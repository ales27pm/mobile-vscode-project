import { getGitProvider } from './gitProvider';
import simpleGit from 'simple-git';
import * as vscode from 'vscode';

jest.mock('vscode', () => ({
  workspace: {
    getWorkspaceFolder: jest.fn(() => ({ uri: { fsPath: '/test' } })),
  },
  Uri: { parse: (s: string) => ({ fsPath: s.replace('file://', ''), toString: () => s }) },
}), { virtual: true });

jest.mock('simple-git');

const mockGit = {
  checkIsRepo: jest.fn(),
  status: jest.fn(),
  add: jest.fn(),
  reset: jest.fn(),
  diff: jest.fn(),
  commit: jest.fn(),
  push: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  (simpleGit as jest.Mock).mockReturnValue(mockGit);
  mockGit.checkIsRepo.mockResolvedValue(true);
});

describe('gitProvider', () => {
  const provider = getGitProvider();
  const args = { workspaceUri: 'file:///test' };

  it('gitStatus returns correct status', async () => {
    mockGit.status.mockResolvedValue({
      current: 'main',
      staged: ['a.txt'],
      files: [{ path: 'a.txt' }, { path: 'b.txt' }],
    });

    const status = await provider.Query.gitStatus(null, args as any);
    expect(status.branch).toBe('main');
    expect(status.staged).toEqual(['a.txt']);
    expect(status.unstaged).toEqual(['b.txt']);
  });

  it('gitDiff returns diff string', async () => {
    mockGit.diff.mockResolvedValue('diff');
    const diff = await provider.Query.gitDiff(null, { ...args, file: 'file.txt' } as any);
    expect(diff).toBe('diff');
    expect(mockGit.diff).toHaveBeenCalledWith(['file.txt']);
  });

  it('gitStage stages file', async () => {
    await provider.Mutation.gitStage(null, { ...args, file: 'x' } as any);
    expect(mockGit.add).toHaveBeenCalledWith('x');
  });

  it('gitUnstage unstages file', async () => {
    await provider.Mutation.gitUnstage(null, { ...args, file: 'x' } as any);
    expect(mockGit.reset).toHaveBeenCalledWith(['--', 'x']);
  });

  it('commit creates commit', async () => {
    await provider.Mutation.commit(null, { ...args, message: 'm' } as any);
    expect(mockGit.commit).toHaveBeenCalledWith('m');
  });
});
