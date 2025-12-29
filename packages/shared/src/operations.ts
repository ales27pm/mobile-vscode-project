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
  query ListDirectory($workspaceUri: String!, $path: String!) {
    listDirectory(workspaceUri: $workspaceUri, path: $path) {
      name
      path
      type
      isDirectory
      size
      mtimeMs
    }
  }
`;

gql`
  query ReadFile($workspaceUri: String!, $path: String!, $encoding: String) {
    readFile(workspaceUri: $workspaceUri, path: $path, encoding: $encoding) {
      path
      content
      encoding
    }
  }
`;

gql`
  query Search($workspaceUri: String!, $query: String!, $limit: Int!) {
    search(workspaceUri: $workspaceUri, query: $query, limit: $limit) {
      path
      line
      preview
    }
  }
`;

gql`
  query GitStatus($workspaceUri: String!) {
    gitStatus(workspaceUri: $workspaceUri) {
      branch
      staged
      unstaged
      untracked
    }
  }
`;

gql`
  query GitDiff($workspaceUri: String!, $filePath: String) {
    gitDiff(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

gql`
  query GetLaunchConfigurations($workspaceUri: String!) {
    getLaunchConfigurations(workspaceUri: $workspaceUri) {
      name
      type
      request
      program
      cwd
      args
    }
  }
`;

gql`
  mutation WriteFile(
    $workspaceUri: String!
    $path: String!
    $content: String!
    $encoding: String!
  ) {
    writeFile(workspaceUri: $workspaceUri, path: $path, content: $content, encoding: $encoding) {
      ok
    }
  }
`;

gql`
  mutation GitStage($workspaceUri: String!, $filePath: String!) {
    gitStage(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

gql`
  mutation GitUnstage($workspaceUri: String!, $filePath: String!) {
    gitUnstage(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

gql`
  mutation GitCommit($workspaceUri: String!, $message: String!) {
    gitCommit(workspaceUri: $workspaceUri, message: $message)
  }
`;

gql`
  mutation GitPush($workspaceUri: String!) {
    gitPush(workspaceUri: $workspaceUri)
  }
`;

gql`
  mutation StartDebugging($workspaceUri: String!, $configName: String!) {
    startDebugging(workspaceUri: $workspaceUri, configName: $configName)
  }
`;

gql`
  mutation StopDebugging {
    stopDebugging
  }
`;

gql`
  subscription DebugEvent {
    debugEvent {
      event
      body
    }
  }
`;

gql`
  subscription FileChange {
    fileChange {
      type
      path
    }
  }
`;

gql`
  mutation PairWithServer($pairingToken: String!) {
    pairWithServer(pairingToken: $pairingToken)
  }
`;

gql`
  query Extensions {
    extensions {
      id
      version
      installed
      isActive
      extensionKind
    }
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
