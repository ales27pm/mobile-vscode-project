import { gql } from 'apollo-server-express';

export default gql`
  type File {
    name: String!
    path: String!
    isDirectory: Boolean!
  }
  type SearchHit {
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
    listDirectory(path: String): [File!]!
    search(query: String!): [SearchHit!]!
    gitStatus: GitStatus!
    extensions: [Extension!]!
    readFile(path: String!): String
  }

  type Mutation {
    commit(message: String!): Boolean!
    push: Boolean!
    installExtension(id: String!): Boolean!
    uninstallExtension(id: String!): Boolean!
    writeFile(path: String!, content: String!): Boolean!
  }

  type Subscription {
    fsEvent: FSEvent!
  }
`;
