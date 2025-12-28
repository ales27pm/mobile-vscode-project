import { gql, type DocumentNode } from "@apollo/client";

// ---------------------------------------------------------------------------
// Shared GraphQL documents + minimal TS types.
//
// The mobile app imports these from:
//   - "shared"  (workspace package root entry)
//
// If this package is missing or Metro can't transpile it, Apollo can receive
// `undefined` instead of a DocumentNode and crash with:
//   "Argument of <undefined> passed to parser ..."
//
// This file intentionally contains only the documents/types the mobile UI uses.
// ---------------------------------------------------------------------------

// --- Pairing ----------------------------------------------------------------

export const PairWithServerDocument: DocumentNode = gql`
  mutation PairWithServer($pairingToken: String!) {
    pairWithServer(pairingToken: $pairingToken)
  }
`;

export type PairWithServerMutationVariables = { pairingToken: string };
export type PairWithServerMutation = { pairWithServer: string };

// --- Workspaces / Files ------------------------------------------------------

export const ListWorkspacesDocument: DocumentNode = gql`
  query ListWorkspaces {
    listWorkspaces {
      uri
      name
    }
  }
`;

export const ListDirectoryDocument: DocumentNode = gql`
  query ListDirectory($workspaceUri: String!, $path: String!) {
    listDirectory(workspaceUri: $workspaceUri, path: $path) {
      name
      path
      type
      size
      mtimeMs
    }
  }
`;

export const ReadFileDocument: DocumentNode = gql`
  query ReadFile($workspaceUri: String!, $path: String!) {
    readFile(workspaceUri: $workspaceUri, path: $path) {
      path
      content
      encoding
    }
  }
`;

export const WriteFileDocument: DocumentNode = gql`
  mutation WriteFile(
    $workspaceUri: String!
    $path: String!
    $content: String!
    $encoding: String!
  ) {
    writeFile(
      workspaceUri: $workspaceUri
      path: $path
      content: $content
      encoding: $encoding
    ) {
      ok
    }
  }
`;

export type WorkspaceInfo = { uri: string; name: string };
export type FileEntry = {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  mtimeMs: number;
};
export type ReadFileResult = {
  path: string;
  content: string;
  encoding: "utf8" | "base64";
};

export type ListWorkspacesQuery = { listWorkspaces: WorkspaceInfo[] };
export type ListWorkspacesQueryVariables = Record<string, never>;

export type ListDirectoryQuery = { listDirectory: FileEntry[] };
export type ListDirectoryQueryVariables = { workspaceUri: string; path: string };

export type ReadFileQuery = { readFile: ReadFileResult | null };
export type ReadFileQueryVariables = { workspaceUri: string; path: string };

export type WriteFileMutation = { writeFile: { ok: boolean } };
export type WriteFileMutationVariables = {
  workspaceUri: string;
  path: string;
  content: string;
  encoding: "utf8" | "base64";
};

// --- Search ------------------------------------------------------------------

export const SearchDocument: DocumentNode = gql`
  query Search($workspaceUri: String!, $query: String!, $limit: Int!) {
    search(workspaceUri: $workspaceUri, query: $query, limit: $limit) {
      path
      line
      preview
    }
  }
`;

export type SearchResult = { path: string; line: number; preview: string };
export type SearchQuery = { search: SearchResult[] };
export type SearchQueryVariables = {
  workspaceUri: string;
  query: string;
  limit: number;
};

// --- Git ---------------------------------------------------------------------

export const GitStatusDocument: DocumentNode = gql`
  query GitStatus($workspaceUri: String!) {
    gitStatus(workspaceUri: $workspaceUri) {
      branch
      staged
      unstaged
      untracked
    }
  }
`;

export const GitDiffDocument: DocumentNode = gql`
  query GitDiff($workspaceUri: String!, $filePath: String) {
    gitDiff(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

export const GitStageDocument: DocumentNode = gql`
  mutation GitStage($workspaceUri: String!, $filePath: String!) {
    gitStage(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

export const GitUnstageDocument: DocumentNode = gql`
  mutation GitUnstage($workspaceUri: String!, $filePath: String!) {
    gitUnstage(workspaceUri: $workspaceUri, filePath: $filePath)
  }
`;

export const CommitDocument: DocumentNode = gql`
  mutation Commit($workspaceUri: String!, $message: String!) {
    gitCommit(workspaceUri: $workspaceUri, message: $message)
  }
`;

export const PushDocument: DocumentNode = gql`
  mutation Push($workspaceUri: String!) {
    gitPush(workspaceUri: $workspaceUri)
  }
`;

export type GitStatus = {
  branch: string;
  staged: string[];
  unstaged: string[];
  untracked: string[];
};
export type GitStatusQuery = { gitStatus: GitStatus };
export type GitStatusQueryVariables = { workspaceUri: string };

export type GitDiffQuery = { gitDiff: string };
export type GitDiffQueryVariables = { workspaceUri: string; filePath?: string | null };

export type GitStageMutation = { gitStage: boolean };
export type GitStageMutationVariables = { workspaceUri: string; filePath: string };

export type GitUnstageMutation = { gitUnstage: boolean };
export type GitUnstageMutationVariables = { workspaceUri: string; filePath: string };

export type CommitMutation = { gitCommit: boolean };
export type CommitMutationVariables = { workspaceUri: string; message: string };

export type PushMutation = { gitPush: boolean };
export type PushMutationVariables = { workspaceUri: string };

// --- Extensions --------------------------------------------------------------

export const ExtensionsDocument: DocumentNode = gql`
  query Extensions {
    extensions {
      id
      name
      publisher
      version
      installed
      description
    }
  }
`;

export const InstallExtensionDocument: DocumentNode = gql`
  mutation InstallExtension($id: String!) {
    installExtension(id: $id)
  }
`;

export const UninstallExtensionDocument: DocumentNode = gql`
  mutation UninstallExtension($id: String!) {
    uninstallExtension(id: $id)
  }
`;

export type ExtensionInfo = {
  id: string;
  name: string;
  publisher: string;
  version: string;
  installed: boolean;
  description: string;
};
export type ExtensionsQuery = { extensions: ExtensionInfo[] };
export type ExtensionsQueryVariables = Record<string, never>;

export type InstallExtensionMutation = { installExtension: boolean };
export type InstallExtensionMutationVariables = { id: string };

export type UninstallExtensionMutation = { uninstallExtension: boolean };
export type UninstallExtensionMutationVariables = { id: string };

// --- Debug -------------------------------------------------------------------

export const LaunchConfigsDocument: DocumentNode = gql`
  query LaunchConfigs($workspaceUri: String!) {
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

export const StartDebuggingDocument: DocumentNode = gql`
  mutation StartDebugging($workspaceUri: String!, $configName: String!) {
    startDebugging(workspaceUri: $workspaceUri, configName: $configName)
  }
`;

export const StopDebuggingDocument: DocumentNode = gql`
  mutation StopDebugging {
    stopDebugging
  }
`;

export const DebuggerEventDocument: DocumentNode = gql`
  subscription DebuggerEvent($workspaceUri: String!) {
    debuggerEvent(workspaceUri: $workspaceUri) {
      type
      payload
    }
  }
`;

export type LaunchConfiguration = {
  name: string;
  type: string;
  request: string;
  program?: string | null;
  cwd?: string | null;
  args: string[];
};

export type DebuggerEvent = { type: string; payload: string };

export type LaunchConfigsQuery = { getLaunchConfigurations: LaunchConfiguration[] };
export type LaunchConfigsQueryVariables = { workspaceUri: string };

export type StartDebuggingMutation = { startDebugging: boolean };
export type StartDebuggingMutationVariables = { workspaceUri: string; configName: string };

export type StopDebuggingMutation = { stopDebugging: boolean };
export type StopDebuggingMutationVariables = Record<string, never>;

export type DebuggerEventSubscription = { debuggerEvent: DebuggerEvent };
export type DebuggerEventSubscriptionVariables = { workspaceUri: string };
