import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

const getGit = (workspaceUri: string): SimpleGit => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(workspaceUri));
  if (!workspaceFolder) throw new Error('Workspace not found');
  return simpleGit(workspaceFolder.uri.fsPath);
};

export const getGitProvider = () => ({
  Query: {
    gitStatus: async (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      const git = getGit(workspaceUri);
      if (!(await git.checkIsRepo())) return { branch: 'Not a repo', staged: [], unstaged: [] };
      const s = await git.status();
      const unstaged = s.files
        .filter(f => f.working_dir !== ' ')
        .map(f => f.path);
      const staged = s.files
        .filter(f => f.index !== ' ')
        .map(f => f.path);
      return {
        branch: s.current || 'detached',
        staged,
        unstaged,
      };
    },
    gitDiff: async (_: unknown, { workspaceUri, file }: { workspaceUri: string; file: string }) => {
      const git = getGit(workspaceUri);
      return git.diff([file]);
    },
  },
  Mutation: {
    gitStage: async (_: unknown, { workspaceUri, file }: { workspaceUri: string; file: string }) => {
      await getGit(workspaceUri).add(file);
      return true;
    },
    gitUnstage: async (_: unknown, { workspaceUri, file }: { workspaceUri: string; file: string }) => {
      await getGit(workspaceUri).reset(['--', file]);
      return true;
    },
    commit: async (_: unknown, { workspaceUri, message }: { workspaceUri: string; message: string }) => {
      await getGit(workspaceUri).commit(message);
      return true;
    },
    push: async (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      await getGit(workspaceUri).push();
      return true;
    },
  },
});
