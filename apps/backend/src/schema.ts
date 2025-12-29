import { gql } from 'apollo-server-express';
import { getResolvers } from './graphql/resolvers';
import { pubsub } from './graphql/pubsub';

export const typeDefs = gql`
  type Workspace {
    uri: String!
    name: String!
  }

  type FileEntry {
    name: String!
    path: String!
    type: String!
    isDirectory: Boolean!
    size: Float
    mtimeMs: Float
  }

  type FileContent {
    path: String!
    content: String!
    encoding: String!
  }

  type SearchResult {
    path: String!
    line: Int!
    preview: String!
  }

  type GitStatus {
    branch: String!
    staged: [String!]!
    unstaged: [String!]!
    untracked: [String!]!
  }

  type LaunchConfiguration {
    name: String!
    type: String!
    request: String!
    program: String
    cwd: String
    args: [String!]!
  }

  type WriteFileResult {
    ok: Boolean!
  }

  type DebuggerEvent {
    event: String!
    body: String!
  }

  type Query {
    listWorkspaces: [Workspace!]!
    listDirectory(workspaceUri: String!, path: String!): [FileEntry!]!
    readFile(workspaceUri: String!, path: String!, encoding: String): FileContent
    search(workspaceUri: String!, query: String!, limit: Int!): [SearchResult!]!
    gitStatus(workspaceUri: String!): GitStatus!
    gitDiff(workspaceUri: String!, filePath: String): String!
    getLaunchConfigurations(workspaceUri: String!): [LaunchConfiguration!]!
  }

  type Mutation {
    writeFile(workspaceUri: String!, path: String!, content: String!, encoding: String!): WriteFileResult!
    gitStage(workspaceUri: String!, filePath: String!): Boolean!
    gitUnstage(workspaceUri: String!, filePath: String!): Boolean!
    gitCommit(workspaceUri: String!, message: String!): Boolean!
    gitPush(workspaceUri: String!): Boolean!
    startDebugging(workspaceUri: String!, configName: String!): Boolean!
    stopDebugging: Boolean!
  }

  type Subscription {
    fileChange: String
    debugEvent: DebuggerEvent!
  }
`;

export const resolvers = getResolvers(pubsub);

export default typeDefs;
