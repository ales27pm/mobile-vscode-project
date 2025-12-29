import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import { AddressInfo } from 'net';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer as useGraphQLWsServer } from 'graphql-ws/lib/use/ws';
import { join } from 'path';
import { setupWSConnection, setPersistence, Doc } from 'y-websocket/bin/utils.js';

import { ensureAuthContext, setupAuthMiddleware, RequestWithUser } from './auth';
import { bindState } from '../crdt/persistence';
import { getResolvers } from '../graphql/resolvers';
import schemaTypeDefs from '../schema';
import { updateStatusBar } from '../ui/statusBar';
import { initializeFileSystemWatcher, disposeFileSystemWatcher } from '../watchers/fileSystemWatcher';

let httpServer: https.Server | null = null;
let apolloServer: ApolloServer | null = null;
let gqlWss: WebSocketServer | null = null;
let yjsWss: WebSocketServer | null = null;
let wsServerCleanup: (() => void) | null = null;

/**
 * Starts the Express/Apollo server and WebSocket servers.
 */
export async function startServer(context: vscode.ExtensionContext) {
  if (httpServer) {
    vscode.window.showWarningMessage('MobileVSCode Server is already running.');
    return;
  }

  // Ensure user is authenticated (could be a no-op or prompt, depending on auth setup)
  const authContext = await ensureAuthContext();
  if (!authContext) {
    // If auth is required and not provided, we abort start.
    vscode.window.showErrorMessage('Authentication failed. Server not started.');
    return;
  }

  // Prepare Express app
  const app = express();
  app.use(express.json());
  setupAuthMiddleware(app); // (Optional) attach auth middleware if needed

  // Load SSL certificate and key for HTTPS
  const keyPath = join(context.extensionPath, 'certs', 'server.key');
  const certPath = join(context.extensionPath, 'certs', 'server.crt');
  const useHttps = fs.existsSync(keyPath) && fs.existsSync(certPath);
  let serverOptions: https.ServerOptions | undefined;
  if (useHttps) {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    serverOptions = { key, cert };
  } else {
    vscode.window.showWarningMessage('Using insecure HTTP. For production, configure HTTPS certificates.');
  }

  // Create HTTP or HTTPS server
  httpServer = useHttps 
    ? https.createServer(serverOptions!, app) 
    : https.createServer(app);

  // GraphQL Schema and Resolvers
  const schema = makeExecutableSchema({
    typeDefs: schemaTypeDefs,
    resolvers: getResolvers(pubsub)
  });

  // Set up Apollo Server with the schema
  apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ensureAuthContext(req as RequestWithUser)  // attach auth info to context if needed
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Set up WebSocket servers for GraphQL and Yjs (HMR/collaboration)
  gqlWss = new WebSocketServer({ noServer: true });
  const wsCleanup = useGraphQLWsServer({ schema }, gqlWss);  // GraphQL subscriptions server
  wsServerCleanup = wsCleanup.dispose;
  yjsWss = new WebSocketServer({ noServer: true });          // Yjs WebSocket (CRDT sync)

  // Persistence for Yjs (to keep documents in memory or file between sessions)
  setPersistence({
    bindState: (docName: string, ydoc: Doc) => {
      bindState(docName, ydoc);
    },
    writeState: async () => {
      /* Optionally, persist Yjs document updates */
    }
  });

  // Handle upgrade requests for WebSocket routes
  httpServer.on('upgrade', (request, socket, head) => {
    const { url } = request;
    if (url === '/graphql') {
      gqlWss!.handleUpgrade(request, socket, head, ws => {
        gqlWss!.emit('connection', ws, request);
      });
    } else if (url === '/yjs') {
      yjsWss!.handleUpgrade(request, socket, head, ws => {
        // Use Y-WebSocket server handling
        setupWSConnection(ws, request);
      });
    } else {
      // Unknown route, destroy socket
      socket.destroy();
    }
  });

  // Start listening on a port
  const port = 4000;
  httpServer.listen(port, () => {
    const address = httpServer!.address() as AddressInfo;
    updateStatusBar(`Server running at ${useHttps ? 'https' : 'http'}://${address.address}:${address.port}`);
    console.log(`🚀 GraphQL server ready at ${useHttps ? 'https' : 'http'}://localhost:${port}/graphql`);
  });

  // Initialize file system watcher (for HMR or file sync)
  initializeFileSystemWatcher();
}

/**
 * Stops the server and cleans up resources.
 */
export function stopServer() {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
  if (apolloServer) {
    apolloServer.stop();
    apolloServer = null;
  }
  if (gqlWss) {
    gqlWss.close();
    gqlWss = null;
  }
  if (yjsWss) {
    yjsWss.close();
    yjsWss = null;
  }
  if (wsServerCleanup) {
    wsServerCleanup();
    wsServerCleanup = null;
  }
  disposeFileSystemWatcher();
  updateStatusBar('Server stopped');
  console.log('🛑 MobileVSCode Server stopped.');
}
