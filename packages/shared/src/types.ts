export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type DebuggerEvent = {
  __typename?: 'DebuggerEvent';
  body: Scalars['String']['output'];
  event: Scalars['String']['output'];
};

export type FileChangeEvent = {
  __typename?: 'FileChangeEvent';
  path: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type FileContent = {
  __typename?: 'FileContent';
  content: Scalars['String']['output'];
  encoding: Scalars['String']['output'];
  path: Scalars['String']['output'];
};

export type FileEntry = {
  __typename?: 'FileEntry';
  isDirectory: Scalars['Boolean']['output'];
  mtimeMs?: Maybe<Scalars['Float']['output']>;
  name: Scalars['String']['output'];
  path: Scalars['String']['output'];
  size?: Maybe<Scalars['Float']['output']>;
  type: Scalars['String']['output'];
};

export type GitStatus = {
  __typename?: 'GitStatus';
  branch: Scalars['String']['output'];
  staged: Array<Scalars['String']['output']>;
  unstaged: Array<Scalars['String']['output']>;
  untracked: Array<Scalars['String']['output']>;
};

export type LaunchConfiguration = {
  __typename?: 'LaunchConfiguration';
  args: Array<Scalars['String']['output']>;
  cwd?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  program?: Maybe<Scalars['String']['output']>;
  request: Scalars['String']['output'];
  type: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  gitCommit: Scalars['Boolean']['output'];
  gitPush: Scalars['Boolean']['output'];
  gitStage: Scalars['Boolean']['output'];
  gitUnstage: Scalars['Boolean']['output'];
  startDebugging: Scalars['Boolean']['output'];
  stopDebugging: Scalars['Boolean']['output'];
  writeFile: WriteFileResult;
};


export type MutationGitCommitArgs = {
  message: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type MutationGitPushArgs = {
  workspaceUri: Scalars['String']['input'];
};


export type MutationGitStageArgs = {
  filePath: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type MutationGitUnstageArgs = {
  filePath: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type MutationStartDebuggingArgs = {
  configName: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type MutationWriteFileArgs = {
  content: Scalars['String']['input'];
  encoding: Scalars['String']['input'];
  path: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  getLaunchConfigurations: Array<LaunchConfiguration>;
  gitDiff: Scalars['String']['output'];
  gitStatus: GitStatus;
  listDirectory: Array<FileEntry>;
  listWorkspaces: Array<Workspace>;
  readFile?: Maybe<FileContent>;
  search: Array<SearchResult>;
};


export type QueryGetLaunchConfigurationsArgs = {
  workspaceUri: Scalars['String']['input'];
};


export type QueryGitDiffArgs = {
  filePath?: InputMaybe<Scalars['String']['input']>;
  workspaceUri: Scalars['String']['input'];
};


export type QueryGitStatusArgs = {
  workspaceUri: Scalars['String']['input'];
};


export type QueryListDirectoryArgs = {
  path: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type QueryReadFileArgs = {
  encoding?: InputMaybe<Scalars['String']['input']>;
  path: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type QuerySearchArgs = {
  limit: Scalars['Int']['input'];
  query: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};

export type SearchResult = {
  __typename?: 'SearchResult';
  line: Scalars['Int']['output'];
  path: Scalars['String']['output'];
  preview: Scalars['String']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  debugEvent: DebuggerEvent;
  fileChange: FileChangeEvent;
};

export type Workspace = {
  __typename?: 'Workspace';
  name: Scalars['String']['output'];
  uri: Scalars['String']['output'];
};

export type WriteFileResult = {
  __typename?: 'WriteFileResult';
  ok: Scalars['Boolean']['output'];
};

export type ListWorkspacesQueryVariables = Exact<{ [key: string]: never; }>;


export type ListWorkspacesQuery = { __typename?: 'Query', listWorkspaces: Array<{ __typename?: 'Workspace', name: string, uri: string }> };

export type ListDirectoryQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  path: Scalars['String']['input'];
}>;


export type ListDirectoryQuery = { __typename?: 'Query', listDirectory: Array<{ __typename?: 'FileEntry', name: string, path: string, type: string, isDirectory: boolean, size?: number | null, mtimeMs?: number | null }> };

export type ReadFileQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  path: Scalars['String']['input'];
  encoding?: InputMaybe<Scalars['String']['input']>;
}>;


export type ReadFileQuery = { __typename?: 'Query', readFile?: { __typename?: 'FileContent', path: string, content: string, encoding: string } | null };

export type SearchQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  query: Scalars['String']['input'];
  limit: Scalars['Int']['input'];
}>;


export type SearchQuery = { __typename?: 'Query', search: Array<{ __typename?: 'SearchResult', path: string, line: number, preview: string }> };

export type GitStatusQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
}>;


export type GitStatusQuery = { __typename?: 'Query', gitStatus: { __typename?: 'GitStatus', branch: string, staged: Array<string>, unstaged: Array<string>, untracked: Array<string> } };

export type GitDiffQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  filePath?: InputMaybe<Scalars['String']['input']>;
}>;


export type GitDiffQuery = { __typename?: 'Query', gitDiff: string };

export type GetLaunchConfigurationsQueryVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
}>;


export type GetLaunchConfigurationsQuery = { __typename?: 'Query', getLaunchConfigurations: Array<{ __typename?: 'LaunchConfiguration', name: string, type: string, request: string, program?: string | null, cwd?: string | null, args: Array<string> }> };

export type WriteFileMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  path: Scalars['String']['input'];
  content: Scalars['String']['input'];
  encoding: Scalars['String']['input'];
}>;


export type WriteFileMutation = { __typename?: 'Mutation', writeFile: { __typename?: 'WriteFileResult', ok: boolean } };

export type GitStageMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  filePath: Scalars['String']['input'];
}>;


export type GitStageMutation = { __typename?: 'Mutation', gitStage: boolean };

export type GitUnstageMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  filePath: Scalars['String']['input'];
}>;


export type GitUnstageMutation = { __typename?: 'Mutation', gitUnstage: boolean };

export type GitCommitMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  message: Scalars['String']['input'];
}>;


export type GitCommitMutation = { __typename?: 'Mutation', gitCommit: boolean };

export type GitPushMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
}>;


export type GitPushMutation = { __typename?: 'Mutation', gitPush: boolean };

export type StartDebuggingMutationVariables = Exact<{
  workspaceUri: Scalars['String']['input'];
  configName: Scalars['String']['input'];
}>;


export type StartDebuggingMutation = { __typename?: 'Mutation', startDebugging: boolean };

export type StopDebuggingMutationVariables = Exact<{ [key: string]: never; }>;


export type StopDebuggingMutation = { __typename?: 'Mutation', stopDebugging: boolean };

export type DebugEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type DebugEventSubscription = { __typename?: 'Subscription', debugEvent: { __typename?: 'DebuggerEvent', event: string, body: string } };

export type FileChangeSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FileChangeSubscription = { __typename?: 'Subscription', fileChange: { __typename?: 'FileChangeEvent', type: string, path: string } };
