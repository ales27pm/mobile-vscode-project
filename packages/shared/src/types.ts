import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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

export type Extension = {
  __typename?: 'Extension';
  extensionKind?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  installed: Scalars['Boolean']['output'];
  isActive: Scalars['Boolean']['output'];
  version: Scalars['String']['output'];
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
  installExtension: Scalars['Boolean']['output'];
  pairWithServer: Scalars['String']['output'];
  startDebugging: Scalars['Boolean']['output'];
  stopDebugging: Scalars['Boolean']['output'];
  uninstallExtension: Scalars['Boolean']['output'];
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


export type MutationInstallExtensionArgs = {
  id: Scalars['String']['input'];
};


export type MutationPairWithServerArgs = {
  pairingToken: Scalars['String']['input'];
};


export type MutationStartDebuggingArgs = {
  configName: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};


export type MutationUninstallExtensionArgs = {
  id: Scalars['String']['input'];
};


export type MutationWriteFileArgs = {
  content: Scalars['String']['input'];
  encoding: Scalars['String']['input'];
  path: Scalars['String']['input'];
  workspaceUri: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  extensions: Array<Extension>;
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

export type PairWithServerMutationVariables = Exact<{
  pairingToken: Scalars['String']['input'];
}>;


export type PairWithServerMutation = { __typename?: 'Mutation', pairWithServer: string };

export type ExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ExtensionsQuery = { __typename?: 'Query', extensions: Array<{ __typename?: 'Extension', id: string, version: string, installed: boolean, isActive: boolean, extensionKind?: string | null }> };

export type InstallExtensionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type InstallExtensionMutation = { __typename?: 'Mutation', installExtension: boolean };

export type UninstallExtensionMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type UninstallExtensionMutation = { __typename?: 'Mutation', uninstallExtension: boolean };


export const ListWorkspacesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listWorkspaces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"uri"}}]}}]}}]} as unknown as DocumentNode<ListWorkspacesQuery, ListWorkspacesQueryVariables>;
export const ListDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listDirectory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"isDirectory"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"mtimeMs"}}]}}]}}]} as unknown as DocumentNode<ListDirectoryQuery, ListDirectoryQueryVariables>;
export const ReadFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReadFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"encoding"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}},{"kind":"Argument","name":{"kind":"Name","value":"encoding"},"value":{"kind":"Variable","name":{"kind":"Name","value":"encoding"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"encoding"}}]}}]}}]} as unknown as DocumentNode<ReadFileQuery, ReadFileQueryVariables>;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"preview"}}]}}]}}]} as unknown as DocumentNode<SearchQuery, SearchQueryVariables>;
export const GitStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GitStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"staged"}},{"kind":"Field","name":{"kind":"Name","value":"unstaged"}},{"kind":"Field","name":{"kind":"Name","value":"untracked"}}]}}]}}]} as unknown as DocumentNode<GitStatusQuery, GitStatusQueryVariables>;
export const GitDiffDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GitDiff"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitDiff"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"filePath"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}}}]}]}}]} as unknown as DocumentNode<GitDiffQuery, GitDiffQueryVariables>;
export const GetLaunchConfigurationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetLaunchConfigurations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"getLaunchConfigurations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"request"}},{"kind":"Field","name":{"kind":"Name","value":"program"}},{"kind":"Field","name":{"kind":"Name","value":"cwd"}},{"kind":"Field","name":{"kind":"Name","value":"args"}}]}}]}}]} as unknown as DocumentNode<GetLaunchConfigurationsQuery, GetLaunchConfigurationsQueryVariables>;
export const WriteFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WriteFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"encoding"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"writeFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}},{"kind":"Argument","name":{"kind":"Name","value":"encoding"},"value":{"kind":"Variable","name":{"kind":"Name","value":"encoding"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ok"}}]}}]}}]} as unknown as DocumentNode<WriteFileMutation, WriteFileMutationVariables>;
export const GitStageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GitStage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitStage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"filePath"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}}}]}]}}]} as unknown as DocumentNode<GitStageMutation, GitStageMutationVariables>;
export const GitUnstageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GitUnstage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitUnstage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"filePath"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filePath"}}}]}]}}]} as unknown as DocumentNode<GitUnstageMutation, GitUnstageMutationVariables>;
export const GitCommitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GitCommit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitCommit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}]}]}}]} as unknown as DocumentNode<GitCommitMutation, GitCommitMutationVariables>;
export const GitPushDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"GitPush"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitPush"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}}]}]}}]} as unknown as DocumentNode<GitPushMutation, GitPushMutationVariables>;
export const StartDebuggingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StartDebugging"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"configName"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"startDebugging"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"workspaceUri"},"value":{"kind":"Variable","name":{"kind":"Name","value":"workspaceUri"}}},{"kind":"Argument","name":{"kind":"Name","value":"configName"},"value":{"kind":"Variable","name":{"kind":"Name","value":"configName"}}}]}]}}]} as unknown as DocumentNode<StartDebuggingMutation, StartDebuggingMutationVariables>;
export const StopDebuggingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopDebugging"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopDebugging"}}]}}]} as unknown as DocumentNode<StopDebuggingMutation, StopDebuggingMutationVariables>;
export const DebugEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"DebugEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"debugEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]} as unknown as DocumentNode<DebugEventSubscription, DebugEventSubscriptionVariables>;
export const FileChangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"FileChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fileChange"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}}]}}]} as unknown as DocumentNode<FileChangeSubscription, FileChangeSubscriptionVariables>;
export const PairWithServerDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PairWithServer"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pairingToken"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pairWithServer"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"pairingToken"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pairingToken"}}}]}]}}]} as unknown as DocumentNode<PairWithServerMutation, PairWithServerMutationVariables>;
export const ExtensionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"version"}},{"kind":"Field","name":{"kind":"Name","value":"installed"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"extensionKind"}}]}}]}}]} as unknown as DocumentNode<ExtensionsQuery, ExtensionsQueryVariables>;
export const InstallExtensionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallExtension"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installExtension"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<InstallExtensionMutation, InstallExtensionMutationVariables>;
export const UninstallExtensionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UninstallExtension"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uninstallExtension"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<UninstallExtensionMutation, UninstallExtensionMutationVariables>;