import * as vscode from 'vscode';
import simpleGit, { SimpleGit } from 'simple-git';

const getGit = (workspaceUri: string): SimpleGit | null => {
  const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(workspaceUri));
  if (!workspaceFolder) return null;
  return simpleGit(workspaceFolder.uri.fsPath);
};

export const getGitProvider = () => ({
  Query: {
    gitStatus: async (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      const git = getGit(workspaceUri);
      if (!git || !(await git.checkIsRepo())) return { branch: 'Not a repo', staged: [], unstaged: [] };
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
      if (!git) return '';
      return git.diff([file]);
    },
  },
  Mutation: {
    gitStage: async (_: unknown, { workspaceUri, file }: { workspaceUri: string; file: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.add(file);
      return true;
    },
    gitUnstage: async (_: unknown, { workspaceUri, file }: { workspaceUri: string; file: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.reset(['--', file]);
      return true;
    },
    commit: async (_: unknown, { workspaceUri, message }: { workspaceUri: string; message: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.commit(message);
      return true;
    },
    push: async (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.push();
      return true;
    },
  },
});
