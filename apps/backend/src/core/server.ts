import * as vscode from 'vscode';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import { AddressInfo } from 'net';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer as useGraphQLWsServer } from 'graphql-ws/use/ws';
import { join } from 'path';
import os from 'os';
import { setupWSConnection, setPersistence, Doc } from 'y-websocket/bin/utils.js';

import { ensureAuthContext, setupAuthMiddleware, RequestWithUser } from './auth';
import { bindState } from '../crdt/persistence';
import { getResolvers } from '../graphql/resolvers';
import { pubsub } from '../graphql/pubsub';
import schemaTypeDefs from '../schema';
import { setServerUiState } from '../ui/uiState';
import { logInfo, logWarn, logError } from '../ui/logger';
import { initializeFileSystemWatcher, disposeFileSystemWatcher } from '../watchers/fileSystemWatcher';

let httpServer: http.Server | https.Server | null = null;
let apolloServer: ApolloServer | null = null;
let gqlWss: WebSocketServer | null = null;
let yjsWss: WebSocketServer | null = null;
let wsServerCleanup: (() => void) | null = null;

export async function startServer(context: vscode.ExtensionContext) {
  if (httpServer) {
    vscode.window.showWarningMessage('MobileVSCode Server is already running.');
    return;
  }

  setServerUiState({ status: 'starting', message: undefined });

  const authContext = await ensureAuthContext();
  if (!authContext) {
    vscode.window.showErrorMessage('Authentication failed. Server not started.');
    setServerUiState({ status: 'error', message: 'Authentication failed. Server not started.' });
    return;
  }

  const app = express();
  app.use(express.json());
  setupAuthMiddleware(app, authContext);

  const cfg = vscode.workspace.getConfiguration('mobile-vscode-server');
  const host = cfg.get<string>('host', '0.0.0.0');
  const port = cfg.get<number>('port', 4000);
  const forceHttps = cfg.get<boolean>('useHttps', false);

  const keyPath = join(context.extensionPath, 'certs', 'server.key');
  const certPath = join(context.extensionPath, 'certs', 'server.crt');
  const hasCerts = fs.existsSync(keyPath) && fs.existsSync(certPath);
  const useHttps = forceHttps && hasCerts;

  let serverOptions: https.ServerOptions | undefined;
  if (useHttps) {
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    serverOptions = { key, cert };
  } else {
    if (forceHttps && !hasCerts) {
      vscode.window.showWarningMessage('HTTPS is enabled in settings but certificates were not found. Falling back to HTTP.');
      logWarn(`HTTPS requested but missing certs at ${keyPath} and ${certPath}; falling back to HTTP.`);
    } else {
      vscode.window.showWarningMessage('Using insecure HTTP. For production, configure HTTPS certificates.');
      logWarn('Starting server in HTTP mode (no TLS).');
    }
  }

  // ✅ CRITICAL FIX: HTTP mode now uses http.createServer()
  httpServer = useHttps
    ? https.createServer(serverOptions!, app)
    : http.createServer(app);

  const schema = makeExecutableSchema({
    typeDefs: schemaTypeDefs,
    resolvers: getResolvers(pubsub)
  });

  apolloServer = new ApolloServer({
    schema,
    context: ({ req }) => ({
      user: (req as RequestWithUser).user,
      authContext
    })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  gqlWss = new WebSocketServer({ noServer: true });
  const wsCleanup = useGraphQLWsServer({ schema }, gqlWss);
  wsServerCleanup = wsCleanup.dispose;

  yjsWss = new WebSocketServer({ noServer: true });

  setPersistence({
    bindState: (docName: string, ydoc: Doc) => {
      bindState(docName, ydoc);
    },
    writeState: async () => {
      /* optional persistence */
    }
  });

  httpServer.on('upgrade', (request, socket, head) => {
    const { url } = request;
    if (url === '/graphql') {
      gqlWss!.handleUpgrade(request, socket, head, (ws) => {
        gqlWss!.emit('connection', ws, request);
      });
    } else if (url === '/yjs') {
      yjsWss!.handleUpgrade(request, socket, head, (ws) => {
        setupWSConnection(ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  httpServer.on('error', (err: any) => {
    const msg = err?.message ? String(err.message) : String(err);
    setServerUiState({ status: 'error', message: msg });
    logError(`HTTP server error: ${msg}`);
  });

  httpServer.listen(port, host, () => {
    const address = httpServer!.address() as AddressInfo;
    const protocol = useHttps ? 'https' : 'http';

    const displayHost = pickDisplayHost(host);
    const url = `${protocol}://${displayHost}:${address.port}`;

    setServerUiState({
      status: 'running',
      protocol,
      host,
      port: address.port,
      url,
      message: undefined
    });

    logInfo(`GraphQL server ready at ${protocol}://${displayHost}:${address.port}/graphql`);
    logInfo(`WebSocket endpoints: /graphql (subscriptions), /yjs (CRDT sync)`);
  });

  initializeFileSystemWatcher();
}

function pickDisplayHost(boundHost: string): string {
  if (boundHost !== '0.0.0.0' && boundHost !== '::') {
    return boundHost;
  }

  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net && net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }

  return 'localhost';
}

export async function restartServer(context: vscode.ExtensionContext) {
  stopServer();
  await startServer(context);
}

export function stopServer() {
  if (httpServer) {
    httpServer.close();
    httpServer = null;
  }
  if (apolloServer) {
    void apolloServer.stop();
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
  setServerUiState({ status: 'stopped', url: undefined, message: undefined });
  logInfo('MobileVSCode Server stopped.');
}
