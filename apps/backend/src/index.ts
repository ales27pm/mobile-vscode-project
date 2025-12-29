import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/dist/use/ws';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from './schema';

const PORT = 4000;
const app = express();
const server = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer({ schema });

async function start() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const wsServer = new WebSocketServer({ server, path: '/graphql' });
  useServer({ schema }, wsServer);

  server.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

start().catch(console.error);
