import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { createServer } from 'http';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { useServer } from 'graphql-ws/lib/use/ws';
import { WebSocketServer } from 'ws';
import { spawn } from 'child_process';
import { createMessageConnection, StreamMessageReader, StreamMessageWriter } from 'vscode-jsonrpc/node';
import { setupWSConnection } from 'y-websocket/bin/utils.js';
import chokidar from 'chokidar';
import debounce from 'lodash.debounce';

import typeDefs from './schema';
import resolvers from './resolvers';
import { pubsub } from './pubsub';
import { PORT, ROOT_DIR } from '../config';

async function start() {
  const app = express();
  const httpServer = createServer(app);
  const schema = makeExecutableSchema({ typeDefs, resolvers: resolvers() });

  const debouncedPublish = debounce((event: string, path: string) => {
    pubsub.publish('FS_EVENT', { fsEvent: { event, path } });
  }, 100);

  chokidar.watch(ROOT_DIR, {
    ignored: /node_modules|.git|.expo|.idea|dist/,
    ignoreInitial: true,
  }).on('all', (event, path) => {
    debouncedPublish(event, path);
  });

  const wsServer = new WebSocketServer({ noServer: true });
  useServer({ schema }, wsServer);

  const yWsServer = new WebSocketServer({ noServer: true });
  yWsServer.on('connection', setupWSConnection);

  const lspWsServer = new WebSocketServer({ noServer: true });
  lspWsServer.on('connection', ws => {
    const tslsPath = require.resolve('typescript-language-server/bin/tsls');
    const lsProcess = spawn('node', [tslsPath, '--stdio'], {
        cwd: ROOT_DIR,
        env: { ...process.env, NODE_OPTIONS: '--no-experimental-fetch' }
    });
    const connection = createMessageConnection(new StreamMessageReader(lsProcess.stdout), new StreamMessageWriter(lsProcess.stdin));
    ws.on('message', data => connection.sendRequest(JSON.parse(data.toString()).method, JSON.parse(data.toString()).params));
    connection.onNotification((method, params) => ws.send(JSON.stringify({ method, params })));
    ws.on('close', () => connection.dispose());
  });

  const debugWsServer = new WebSocketServer({ noServer: true });
  debugWsServer.on('connection', ws => {
    const adapterPath = require.resolve('vscode-node-debug2/out/src/nodeDebug.js');
    const adapterProcess = spawn('node', [adapterPath], { cwd: ROOT_DIR, stdio: 'pipe' });
    ws.on('message', data => adapterProcess.stdin.write(`Content-Length: ${Buffer.byteLength(data.toString())}

${data.toString()}`));
    adapterProcess.stdout.on('data', (data) => {
        const rawMessages = data.toString().split('

');
        for (const rawMessage of rawMessages) {
            if (rawMessage.trim()) {
                try {
                    const contentPart = rawMessage.substring(rawMessage.indexOf('{'));
                    const message = JSON.parse(contentPart);
                    ws.send(JSON.stringify(message));
                } catch (e) {
                    console.error('Debug adapter parse error:', e, 'Raw chunk:', rawMessage);
                }
            }
        }
    });
    ws.on('close', () => adapterProcess.kill());
  });

  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url!, `http://${req.headers.host}`);
    if (pathname === '/graphql') wsServer.handleUpgrade(req, socket, head, ws => wsServer.emit('connection', ws, req));
    else if (pathname === '/yws') yWsServer.handleUpgrade(req, socket, head, ws => yWsServer.emit('connection', ws, req));
    else if (pathname === '/lsp') lspWsServer.handleUpgrade(req, socket, head, ws => lspWsServer.emit('connection', ws, req));
    else if (pathname === '/debug') debugWsServer.handleUpgrade(req, socket, head, ws => debugWsServer.emit('connection', ws, req));
    else socket.destroy();
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

start();
