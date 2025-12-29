import { getResolvers } from './resolvers';
import * as vscode from 'vscode';

const readDirectory: jest.Mock = vscode.workspace.fs.readDirectory as jest.Mock;
const readFile: jest.Mock = vscode.workspace.fs.readFile as jest.Mock;
const writeFile: jest.Mock = vscode.workspace.fs.writeFile as jest.Mock;

let workspaceFolder: vscode.WorkspaceFolder;

beforeEach(() => {
  workspaceFolder = {
    name: 'test',
    uri: { fsPath: '/workspace/test', toString: () => 'file:///workspace/test' },
  } as unknown as vscode.WorkspaceFolder;
  (vscode.workspace as unknown as { workspaceFolders: vscode.WorkspaceFolder[] | undefined }).workspaceFolders = [
    workspaceFolder,
  ];
  readDirectory.mockResolvedValue([
    ['file.txt', vscode.FileType.File],
    ['folder', vscode.FileType.Directory],
  ]);
  readFile.mockResolvedValue(Buffer.from('content'));
  writeFile.mockResolvedValue(undefined);
});

test('lists workspaces', async () => {
  const resolvers = getResolvers();
  const workspaces = await resolvers.Query.listWorkspaces(null);
  expect(workspaces).toEqual([{ name: 'test', uri: 'file:///workspace/test' }]);
});

test('lists directory contents', async () => {
  const resolvers = getResolvers();
  const result = await resolvers.Query.listDirectory(null, { workspaceUri: 'file:///workspace/test', path: '' });
  expect(readDirectory).toHaveBeenCalled();
  expect(result).toEqual([
    { name: 'file.txt', path: 'file.txt', type: 'file', isDirectory: false, size: 0, mtimeMs: 0 },
    { name: 'folder', path: 'folder', type: 'directory', isDirectory: true, size: 0, mtimeMs: 0 },
  ]);
});

test('writes file', async () => {
  const resolvers = getResolvers();
  const result = await resolvers.Mutation.writeFile(null, {
    workspaceUri: 'file:///workspace/test',
    path: 'new.txt',
    content: 'hello',
    encoding: 'utf8',
  });
  expect(writeFile).toHaveBeenCalled();
  expect(result).toEqual({ ok: true });
});
