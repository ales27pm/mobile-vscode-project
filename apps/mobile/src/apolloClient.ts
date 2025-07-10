import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';
import { GRAPHQL_URL, WS_URL } from './config';

const httpLink = new HttpLink({ uri: GRAPHQL_URL });
const wsLink = new GraphQLWsLink(createClient({ url: WS_URL }));

const splitLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

export const client = new ApolloClient({ link: splitLink, cache: new InMemoryCache() });
