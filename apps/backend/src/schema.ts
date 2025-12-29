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
    branch: String
    ahead: Int
    behind: Int
    changes: [String!]
  }

  type Query {
    workspaces: [Workspace!]!
    files(workspaceUri: String!, directory: String!): [File!]!
    search(workspaceUri: String!, query: String!): [SearchResult!]!
    gitStatus(workspaceUri: String!): GitStatus
  }

  type Mutation {
    openWorkspace(path: String!): Boolean!
    createFile(path: String!): Boolean!
    deleteFile(path: String!): Boolean!
    saveFile(path: String!, content: String!): Boolean!
    executeCommand(command: String!, args: [String!]): String
  }

  enum FileChangeType {
    CREATED
    CHANGED
    DELETED
  }

  type FileChange {
    type: FileChangeType!
    path: String!
  }

  type Subscription {
    fileChange: FileChange!
    debugEvent: String!
  }
`;
