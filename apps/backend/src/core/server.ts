import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { join } from 'path';
import { setupWSConnection } from 'y-websocket/bin/utils.js';

import { createAuthContext, setupAuthMiddleware } from './auth';
import { getResolvers } from '../graphql/resolvers';
import schemaTypeDefs from '../schema';
import { updateStatusBar } from '../ui/statusBar';
import { initializeFileSystemWatcher, disposeFileSystemWatcher } from '../watchers/fileSystemWatcher';

let httpServer: https.Server | null = null;
let apolloServer: ApolloServer | null = null;
let wsServerCleanup: (() => void) | null = null;

export function startServer(context: vscode.ExtensionContext) {
    if (httpServer) {
        vscode.window.showWarningMessage('MobileVSCode Server is already running.');
        return;
    }

    const app = express();
    app.use(express.json({ 
        limit: '10mb',
        strict: false,
        type: 'application/json'
    }));
    app.use((error: any, req: any, res: any, next: any) => {
        if (error instanceof SyntaxError && 'body' in error) {
            return res.status(400).json({ error: 'Invalid JSON payload' });
        }
        next(error);
    });
    
    const keyPath = join(context.extensionPath, 'certs/server.key');
    const certPath = join(context.extensionPath, 'certs/server.crt');
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
        vscode.window.showErrorMessage('Server certificates not found. Please reinstall the extension.');
        return;
    }
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);

    httpServer = https.createServer({ key, cert }, app);

    const schema = makeExecutableSchema({ typeDefs: schemaTypeDefs, resolvers: getResolvers() });

    const authContext = createAuthContext();
    setupAuthMiddleware(app, authContext);

    apolloServer = new ApolloServer({
        schema,
        context: ({ req }) => ({ user: (req as any).user }),
    });

    apolloServer.start().then(() => {
        if (!apolloServer || !httpServer) return;

        apolloServer.applyMiddleware({ app, path: '/graphql' });

        const gqlWsServer = new WebSocketServer({ noServer: true });
        const gqlWsServerHandler = useServer({ schema }, gqlWsServer);

        const yjsWsServer = new WebSocketServer({ noServer: true });
        yjsWsServer.on('connection', setupWSConnection);

        httpServer.on('upgrade', (req, socket, head) => {
            const url = new URL(req.url!, `https://${req.headers.host}`);
            if (url.pathname === '/graphql') {
                gqlWsServer.handleUpgrade(req, socket, head, ws => gqlWsServer.emit('connection', ws, req));
            } else if (url.pathname.startsWith('/yjs')) {
                yjsWsServer.handleUpgrade(req, socket, head, ws => yjsWsServer.emit('connection', ws, req));
            } else {
                socket.destroy();
            }
        });
        
        wsServerCleanup = () => {
             gqlWsServerHandler.dispose();
             yjsWsServer.close();
             gqlWsServer.close();
        };

        const config = vscode.workspace.getConfiguration('mobile-vscode-server');
        const port = config.get<number>('port', 4000);

        httpServer.listen(port, () => {
            console.log(`🚀 MobileVSCode Server ready at https://localhost:${port}`);
        });

        initializeFileSystemWatcher();
    });
}

export function stopServer() {
    disposeFileSystemWatcher();
    if (httpServer) {
        wsServerCleanup?.();
        httpServer.close(() => {
            console.log('MobileVSCode Server stopped.');
            updateStatusBar(false);
            vscode.window.showInformationMessage('MobileVSCode Server stopped.');
        });
        apolloServer?.stop();
        httpServer = null;
        apolloServer = null;
    } else {
        vscode.window.showInformationMessage('MobileVSCode Server is not running.');
    }
}
