import { gql } from 'apollo-server-express';

export default gql`
  type Workspace {
    uri: String!
    name: String!
  }
  
  type File {
    name: String!
    path: String!
    isDirectory: Boolean!
  }

  type SearchResult {
    file: String!
    line: Int!
    text: String!
  }
  
  type GitStatus {
    branch: String!
    changes: [String!]!
  }

  type FSEvent {
    event: String!
    path: String!
  }

  type Extension {
    id: String!
    name: String!
    description: String!
    installed: Boolean!
  }

  type Query {
    listWorkspaces: [Workspace!]!
    listDirectory(workspaceUri: String!, path: String): [File!]!
    readFile(workspaceUri: String!, path: String!): String
    search(workspaceUri: String!, query: String!): [SearchResult!]!
    gitStatus(workspaceUri: String!): GitStatus!
    extensions: [Extension!]!
  }

  type Mutation {
    pairWithServer(pairingToken: String!): String
    writeFile(workspaceUri: String!, path: String!, content: String!): Boolean!
    commit(workspaceUri: String!, message: String!): Boolean!
    push(workspaceUri: String!): Boolean!
    installExtension(id: String!): Boolean!
    uninstallExtension(id: String!): Boolean!
  }

  type Subscription {
    fsEvent: FSEvent!
  }
`;
