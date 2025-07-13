// This file is used by graphql-codegen to find GraphQL operations.
// The actual typed documents are generated into `types.ts`.
import { gql } from '@apollo/client';

gql`
  query ListWorkspaces {
    listWorkspaces {
      name
      uri
    }
  }
`;

gql`
  query ListDirectory($workspaceUri: String!, $path: String) {
    listDirectory(workspaceUri: $workspaceUri, path: $path) {
      name
      path
      isDirectory
    }
  }
`;

gql`
  query ReadFile($workspaceUri: String!, $path: String!) {
    readFile(workspaceUri: $workspaceUri, path: $path)
  }
`;

gql`
  query Search($workspaceUri: String!, $query: String!) {
    search(workspaceUri: $workspaceUri, query: $query) {
      file
      line
      text
    }
  }
`;

gql`
  query GitStatus($workspaceUri: String!) {
    gitStatus(workspaceUri: $workspaceUri) {
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
  mutation PairWithServer($pairingToken: String!) {
    pairWithServer(pairingToken: $pairingToken)
  }
`;

gql`
  mutation WriteFile($workspaceUri: String!, $path: String!, $content: String!) {
    writeFile(workspaceUri: $workspaceUri, path: $path, content: $content)
  }
`;

gql`
  mutation Commit($workspaceUri: String!, $message: String!) {
    commit(workspaceUri: $workspaceUri, message: $message)
  }
`;

gql`
  mutation Push($workspaceUri: String!) {
    push(workspaceUri: $workspaceUri)
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
  subscription FsEvent {
    fsEvent {
      event
      path
    }
  }
`;
