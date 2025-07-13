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
import { z } from 'zod';

import typeDefs from './schema';
import resolvers from './resolvers';
import { pubsub } from './pubsub';
import { PORT, ROOT_DIR } from '../config';

const incomingMessageSchema = z.object({
  jsonrpc: z.literal('2.0'),
  method: z.string().min(1),
  params: z.unknown().optional(),
  id: z.union([z.number(), z.string(), z.null()]).optional(),
});

type IncomingMessage = z.infer<typeof incomingMessageSchema>;

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
    const connection = createMessageConnection(
      new StreamMessageReader(lsProcess.stdout),
      new StreamMessageWriter(lsProcess.stdin)
    );

    ws.on('message', data => {
      const raw = data.toString();
      try {
        const parsed = JSON.parse(raw);
        const msg: IncomingMessage = incomingMessageSchema.parse(parsed);
        if (msg.id !== undefined) {
          connection.sendRequest(msg.method, msg.params);
        } else {
          connection.sendNotification(msg.method, msg.params);
        }
      } catch (err) {
        console.error('Message processing failed:', err);
        let parsedData: unknown;
        try {
          parsedData = JSON.parse(raw);
        } catch {
          // Ignore parse errors; respond with generic error
        }

        const errorResponse: { error: string; id?: string | number | null } = {
          error: err instanceof Error ? err.message : 'Unknown error',
          ...(parsedData && (parsedData as any).id !== undefined
            ? { id: (parsedData as any).id }
            : {}),
        };

        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(errorResponse));
        }
      }
    });
    connection.onNotification((method, params) =>
      ws.send(JSON.stringify({ method, params }))
    );
    ws.on('close', () => connection.dispose());
  });


  const apolloServer = new ApolloServer({ schema });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  httpServer.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url!, `http://${req.headers.host}`);
    if (pathname === '/graphql') wsServer.handleUpgrade(req, socket, head, ws => wsServer.emit('connection', ws, req));
    else if (pathname === '/yws') yWsServer.handleUpgrade(req, socket, head, ws => yWsServer.emit('connection', ws, req));
    else if (pathname === '/lsp') lspWsServer.handleUpgrade(req, socket, head, ws => lspWsServer.emit('connection', ws, req));
    else socket.destroy();
  });

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}/graphql`);
  });
}

start();
