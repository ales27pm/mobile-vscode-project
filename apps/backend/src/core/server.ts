import * as vscode from 'vscode';
import * as https from 'https';
import * as fs from 'fs';
import { AddressInfo } from 'net';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
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
let wsServerCleanup: (() => void) | null = null;

export async function startServer(context: vscode.ExtensionContext) {
    if (httpServer) {
        vscode.window.showWarningMessage('MobileVSCode Server is already running.');
        return;
    }

    const authContext = await ensureAuthContext();
    if (!authContext) {
        return;
    }

    const app = express();
    app.use(express.json());

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

    setupAuthMiddleware(app, authContext);

    apolloServer = new ApolloServer({
        schema,
        context: ({ req }) => ({ user: (req as RequestWithUser).user }),
    });

    await apolloServer.start();
    
    if (!apolloServer || !httpServer) return;

    apolloServer.applyMiddleware({ app, path: '/graphql' });

    const gqlWsServer = new WebSocketServer({ noServer: true });
    const gqlWsServerHandler = useServer({ schema }, gqlWsServer);

    const yjsWsServer = new WebSocketServer({ noServer: true });

        setPersistence({
            bindState: (docName: string, ydoc: Doc) => {
                bindState(docName, ydoc);
            },
            writeState: () => {
                // Persistence is handled by debounced savers in bindState
            },
            provider: null,
        });

        yjsWsServer.on('connection', setupWSConnection);

        httpServer.on('upgrade', (req, socket, head) => {

            if (!req.url) {
                console.error('HTTP upgrade request missing URL. Destroying socket.');
                socket.destroy();
                return;
            }
            const host = req.headers.host || 'localhost:3000';
            // Try to detect protocol dynamically, fallback to 'http' if not possible
            let protocol = 'http';
            if (
                req.headers["x-forwarded-proto"] &&
                typeof req.headers["x-forwarded-proto"] === 'string'
            ) {
                protocol = req.headers["x-forwarded-proto"].split(',')[0].trim();
            } else if (httpServer && typeof httpServer.address === 'function') {
                const addr = httpServer.address() as AddressInfo | string | null;
                if (addr && typeof addr === 'object' && addr.port === 443) {
                    protocol = 'https';
                }
            } else if (process.env.NODE_ENV === 'production') {
                protocol = 'https';
            }
            const url = new URL(req.url, `${protocol}://${host}`);
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
