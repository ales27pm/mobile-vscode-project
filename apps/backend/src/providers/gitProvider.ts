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
      if (!git || !(await git.checkIsRepo())) return { branch: 'Not a repo', staged: [], unstaged: [], untracked: [] };
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
        untracked: s.not_added ?? [],
      };
    },
    gitDiff: async (_: unknown, { workspaceUri, filePath }: { workspaceUri: string; filePath?: string | null }) => {
      const git = getGit(workspaceUri);
      if (!git) return '';
      return filePath ? git.diff([filePath]) : git.diff();
    },
  },
  Mutation: {
    gitStage: async (_: unknown, { workspaceUri, filePath }: { workspaceUri: string; filePath: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.add(filePath);
      return true;
    },
    gitUnstage: async (_: unknown, { workspaceUri, filePath }: { workspaceUri: string; filePath: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.reset(['--', filePath]);
      return true;
    },
    gitCommit: async (_: unknown, { workspaceUri, message }: { workspaceUri: string; message: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.commit(message);
      return true;
    },
    gitPush: async (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      const git = getGit(workspaceUri);
      if (!git) return false;
      await git.push();
      return true;
    },
  },
});
