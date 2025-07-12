/* eslint-disable */
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
  changes: Array<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  commit?: Maybe<Scalars['Boolean']>;
  installExtension?: Maybe<Scalars['Boolean']>;
  push?: Maybe<Scalars['Boolean']>;
  uninstallExtension?: Maybe<Scalars['Boolean']>;
  writeFile?: Maybe<Scalars['Boolean']>;
};


export type MutationCommitArgs = {
  message: Scalars['String'];
};


export type MutationInstallExtensionArgs = {
  id: Scalars['String'];
};




export type MutationUninstallExtensionArgs = {
  id: Scalars['String'];
};


export type MutationWriteFileArgs = {
  content: Scalars['String'];
  path: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  extensions: Array<Extension>;
  gitStatus: GitStatus;
  listDirectory: Array<File>;
  readFile?: Maybe<Scalars['String']>;
  search: Array<SearchHit>;
};


export type QueryListDirectoryArgs = {
  path?: InputMaybe<Scalars['String']>;
};


export type QueryReadFileArgs = {
  path: Scalars['String'];
};


export type QuerySearchArgs = {
  query: Scalars['String'];
};

export type SearchHit = {
  __typename?: 'SearchHit';
  file: Scalars['String'];
  line: Scalars['Int'];
  text: Scalars['String'];
};

export type Subscription = {
  __typename?: 'Subscription';
  fsEvent: FsEvent;
};

export type ListDirectoryQueryVariables = Exact<{
  path?: InputMaybe<Scalars['String']>;
}>;


export type ListDirectoryQuery = { __typename?: 'Query', listDirectory: Array<{ __typename?: 'File', name: string, path: string, isDirectory: boolean }> };

export type SearchQueryVariables = Exact<{
  query: Scalars['String'];
}>;


export type SearchQuery = { __typename?: 'Query', search: Array<{ __typename?: 'SearchHit', file: string, line: number, text: string }> };

export type GitStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GitStatusQuery = { __typename?: 'Query', gitStatus: { __typename?: 'GitStatus', branch: string, changes: Array<string> } };

export type ExtensionsQueryVariables = Exact<{ [key: string]: never; }>;


export type ExtensionsQuery = { __typename?: 'Query', extensions: Array<{ __typename?: 'Extension', id: string, name: string, description: string, installed: boolean }> };

export type ReadFileQueryVariables = Exact<{
  path: Scalars['String'];
}>;


export type ReadFileQuery = { __typename?: 'Query', readFile?: string | null };

export type CommitMutationVariables = Exact<{
  message: Scalars['String'];
}>;


export type CommitMutation = { __typename?: 'Mutation', commit?: boolean | null };

export type PushMutationVariables = Exact<{ [key:string]: never; }>;


export type PushMutation = { __typename?: 'Mutation', push?: boolean | null };

export type InstallExtensionMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type InstallExtensionMutation = { __typename?: 'Mutation', installExtension?: boolean | null };

export type UninstallExtensionMutationVariables = Exact<{
  id: Scalars['String'];
}>;


export type UninstallExtensionMutation = { __typename?: 'Mutation', uninstallExtension?: boolean | null };

export type WriteFileMutationVariables = Exact<{
  path: Scalars['String'];
  content: Scalars['String'];
}>;


export type WriteFileMutation = { __typename?: 'Mutation', writeFile?: boolean | null };

export type FsEventSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type FsEventSubscription = { __typename?: 'Subscription', fsEvent: { __typename?: 'FSEvent', event: string, path: string } };

export const ListDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ListDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"listDirectory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"path"}},{"kind":"Field","name":{"kind":"Name","value":"isDirectory"}}]}}]}}]} as const;
export const SearchDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Search"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"search"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"file"}},{"kind":"Field","name":{"kind":"Name","value":"line"}},{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]} as const;
export const GitStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GitStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"gitStatus"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"branch"}},{"kind":"Field","name":{"kind":"Name","value":"changes"}}]}}]}}]} as const;
export const ExtensionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"extensions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"installed"}}]}}]}}]} as const;
export const ReadFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReadFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"readFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}}]}]}}]} as const;
export const CommitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Commit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"message"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"message"},"value":{"kind":"Variable","name":{"kind":"Name","value":"message"}}}]}]}}]} as const;
export const PushDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Push"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"push"}}]}}]} as const;
export const InstallExtensionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"InstallExtension"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"installExtension"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as const;
export const UninstallExtensionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UninstallExtension"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"uninstallExtension"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as const;
export const WriteFileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"WriteFile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"path"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"writeFile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"path"},"value":{"kind":"Variable","name":{"kind":"Name","value":"path"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}]}]}}]} as const;
export const FsEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"FsEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"fsEvent"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"}},{"kind":"Field","name":{"kind":"Name","value":"path"}}]}}]}}]} as const;
