import express from 'express';
import http from 'http';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/dist/use/ws'; // Corrected import path
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { typeDefs, resolvers } from './schema';

const PORT = 4000; // Changed from 4 to 4000 for valid port number
const app = express();
const server: http.Server = createServer(app);

const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer({ schema });

async function start() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  const wsServer = new WebSocketServer({ server, path: '/graphql' });
  useServer({ schema }, wsServer); // Using the corrected import

  server.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`);
  });
}

start().catch(console.error);
