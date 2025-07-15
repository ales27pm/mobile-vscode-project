export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type DebugConfiguration = {
  __typename?: 'DebugConfiguration';
  name: Scalars['String'];
  request: Scalars['String'];
  type: Scalars['String'];
};

export type DebuggerEvent = {
  __typename?: 'DebuggerEvent';
  body: Scalars['String'];
  event: Scalars['String'];
};

export type Extension = {
  __typename?: 'Extension';
  description: Scalars['String'];
  id: Scalars['String'];
  installed: Scalars['Boolean'];
  name: Scalars['String'];
};

export type FsEvent = {
  __typename?: 'FSEvent';
  event: Scalars['String'];
  path: Scalars['String'];
};

export type File = {
  __typename?: 'File';
  isDirectory: Scalars['Boolean'];
  name: Scalars['String'];
  path: Scalars['String'];
};

export type GitStatus = {
  __typename?: 'GitStatus';
  branch: Scalars['String'];
  staged: Array<Scalars['String']>;
  unstaged: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  commit: Scalars['Boolean'];
  gitStage: Scalars['Boolean'];
  gitUnstage: Scalars['Boolean'];
  installExtension: Scalars['Boolean'];
  pairWithServer?: Maybe<Scalars['String']>;
  push: Scalars['Boolean'];
  startDebugging: Scalars['Boolean'];
  stopDebugging: Scalars['Boolean'];
  uninstallExtension: Scalars['Boolean'];
  writeFile: Scalars['Boolean'];
};


export type MutationCommitArgs = {
  message: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type MutationGitStageArgs = {
  file: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type MutationGitUnstageArgs = {
  file: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type MutationInstallExtensionArgs = {
  id: Scalars['String'];
};


export type MutationPairWithServerArgs = {
  pairingToken: Scalars['String'];
};


export type MutationPushArgs = {
  workspaceUri: Scalars['String'];
};


export type MutationStartDebuggingArgs = {
  configName: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type MutationUninstallExtensionArgs = {
  id: Scalars['String'];
};


export type MutationWriteFileArgs = {
  content: Scalars['String'];
  path: Scalars['String'];
  workspaceUri: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  extensions: Array<Extension>;
  getLaunchConfigurations: Array<DebugConfiguration>;
  gitDiff: Scalars['String'];
  gitStatus: GitStatus;
  listDirectory: Array<File>;
  listWorkspaces: Array<Workspace>;
  readFile?: Maybe<Scalars['String']>;
  search: Array<SearchResult>;
};


export type QueryGetLaunchConfigurationsArgs = {
  workspaceUri: Scalars['String'];
};


export type QueryGitDiffArgs = {
  file: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type QueryGitStatusArgs = {
  workspaceUri: Scalars['String'];
};


export type QueryListDirectoryArgs = {
  path?: InputMaybe<Scalars['String']>;
  workspaceUri: Scalars['String'];
};


export type QueryReadFileArgs = {
  path: Scalars['String'];
  workspaceUri: Scalars['String'];
};


export type QuerySearchArgs = {
  query: Scalars['String'];
  workspaceUri: Scalars['String'];
};

export type SearchResult = {
  __typename?: 'SearchResult';
  file: Scalars['String'];
  line: Scalars['Int'];
  text: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  debuggerEvent: DebuggerEvent;
  fsEvent: FsEvent;
};

export type Workspace = {
  __typename?: 'Workspace';
  name: Scalars['String'];
  uri: Scalars['String'];
};

export type ListWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListWorkspacesQuery = { __typename?: 'Query', listWorkspaces: Array<{ __typename?: 'Workspace', name: string, uri: string }> };

export type ListDirectoryQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
  path?: InputMaybe<Scalars['String']>;
}>;


export type ListDirectoryQuery = { __typename?: 'Query', listDirectory: Array<{ __typename?: 'File', name: string, path: string, isDirectory: boolean }> };

export type ReadFileQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
  path: Scalars['String'];
}>;


export type ReadFileQuery = { __typename?: 'Query', readFile?: string | null };

export type SearchQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
  query: Scalars['String'];
}>;


export type SearchQuery = { __typename?: 'Query', search: Array<{ __typename?: 'SearchResult', file: string, line: number, text: string }> };

export type GitStatusQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
}>;


export type GitStatusQuery = { __typename?: 'Query', gitStatus: { __typename?: 'GitStatus', branch: string, staged: Array<string>, unstaged: Array<string> } };

export type ExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ExtensionsQuery = { __typename?: 'Query', extensions: Array<{ __typename?: 'Extension', id: string, name: string, description: string, installed: boolean }> };

export type GitDiffQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
  file: Scalars['String'];
}>;


export type GitDiffQuery = { __typename?: 'Query', gitDiff: string };

export type GitStageMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
  file: Scalars['String'];
}>;


export type GitStageMutation = { __typename?: 'Mutation', gitStage: boolean };

export type GitUnstageMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
  file: Scalars['String'];
}>;


export type GitUnstageMutation = { __typename?: 'Mutation', gitUnstage: boolean };

export type GetLaunchConfigurationsQueryVariables = Exact<{
  workspaceUri: Scalars['String'];
}>;


export type GetLaunchConfigurationsQuery = { __typename?: 'Query', getLaunchConfigurations: Array<{ __typename?: 'DebugConfiguration', name: string, type: string, request: string }> };

export type StartDebuggingMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
  configName: Scalars['String'];
}>;


export type StartDebuggingMutation = { __typename?: 'Mutation', startDebugging: boolean };

export type StopDebuggingMutationVariables = Exact<{ [key: string]: never; }>;


export type StopDebuggingMutation = { __typename?: 'Mutation', stopDebugging: boolean };

export type DebuggerEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DebuggerEventSubscription = { __typename?: 'Subscription', debuggerEvent: { __typename?: 'DebuggerEvent', event: string, body: string } };

export type PairWithServerMutationVariables = Exact<{
  pairingToken: Scalars['String'];
}>;


export type PairWithServerMutation = { __typename?: 'Mutation', pairWithServer?: string | null };

export type WriteFileMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
  path: Scalars['String'];
  content: Scalars['String'];
}>;


export type WriteFileMutation = { __typename?: 'Mutation', writeFile: boolean };

export type CommitMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
  message: Scalars['String'];
}>;


export type CommitMutation = { __typename?: 'Mutation', commit: boolean };

export type PushMutationVariables = Exact<{
  workspaceUri: Scalars['String'];
}>;


export type PushMutation = { __typename?: 'Mutation', push: boolean };

export type InstallExtensionMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type InstallExtensionMutation = { __typename?: 'Mutation', installExtension: boolean };

export type UninstallExtensionMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type UninstallExtensionMutation = { __typename?: 'Mutation', uninstallExtension: boolean };

export type FsEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FsEventSubscription = { __typename?: 'Subscription', fsEvent: { __typename?: 'FSEvent', event: string, path: string } };
