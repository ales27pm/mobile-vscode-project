// This file is used by graphql-codegen to find GraphQL operations.
// The actual typed documents are generated into `types.ts`.
import { gql } from '@apollo/client';

gql`
  query ListDirectory($path: String) {
    listDirectory(path: $path) {
      name
      path
      isDirectory
    }
  }
`;

gql`
  query Search($query: String!) {
    search(query: $query) {
      file
      line
      text
    }
  }
`;

gql`
  query GitStatus {
    gitStatus {
      branch
      changes
    }
  }
`;

gql`
  query Extensions {
    extensions {
      id
      name
      description
      installed
    }
  }
`;

gql`
    query ReadFile($path: String!) {
        readFile(path: $path)
    }
`;

gql`
  mutation Commit($message: String!) {
    commit(message: $message)
  }
`;

gql`
  mutation Push {
    push
  }
`;

gql`
  mutation InstallExtension($id: String!) {
    installExtension(id: $id)
  }
`;

gql`
  mutation UninstallExtension($id: String!) {
    uninstallExtension(id: $id)
  }
`;

gql`
    mutation WriteFile($path: String!, $content: String!) {
        writeFile(path: $path, content: $content)
    }
`;

gql`
  subscription FsEvent {
    fsEvent {
      event
      path
    }
  }
`;
