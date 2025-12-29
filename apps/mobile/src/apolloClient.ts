import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { setContext } from '@apollo/client/link/context';
import { GRAPHQL_URL, WS_URL } from './config';
import { useAuthStore } from './state/authStore';

const httpLink = new HttpLink({
  uri: GRAPHQL_URL
});

// Authentication middleware (if auth tokens are needed)
const authLink = setContext((_, { headers }) => {
  const token = useAuthStore.getState().token;
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};
  return {
    headers: {
      ...(headers ?? {}),
      ...authHeader
    }
  };
});

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: WS_URL,
  // Optionally, include authentication on WebSocket connection as well
  connectionParams: () => {
    const token = useAuthStore.getState().token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}));

// Split traffic: use WS for subscriptions, HTTP for queries/mutations
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return def.kind === 'OperationDefinition' && def.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

export const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
});
