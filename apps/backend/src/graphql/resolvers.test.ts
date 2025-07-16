import { getResolvers } from './resolvers';
import * as fs from 'fs';
import * as vscode from 'vscode';

jest.mock('fs');

const readDirectory: jest.Mock = vscode.workspace.fs.readDirectory as jest.Mock;
const readFile: jest.Mock = vscode.workspace.fs.readFile as jest.Mock;
const writeFile: jest.Mock = vscode.workspace.fs.writeFile as jest.Mock;
const getWorkspaceFolder: jest.Mock = vscode.workspace.getWorkspaceFolder as jest.Mock;
let workspaceFolder: vscode.WorkspaceFolder;

beforeEach(() => {
    workspaceFolder = {
        name: 'test',
        uri: { fsPath: '/workspace/test', toString: () => 'file:///workspace/test' },
    } as unknown as vscode.WorkspaceFolder;
    (vscode.workspace as any).workspaceFolders = [workspaceFolder];
    (fs.realpathSync.native as jest.Mock).mockImplementation((p: string) => p);
    readDirectory.mockResolvedValue([['file.txt', 0], ['folder', 2]]);
    readFile.mockResolvedValue(Buffer.from('content'));
    writeFile.mockResolvedValue(undefined);
    getWorkspaceFolder.mockReturnValue(workspaceFolder);
    (vscode.workspace.asRelativePath as jest.Mock).mockImplementation((uri: vscode.Uri) => uri.fsPath.replace('/workspace/test/', ''));
});

test('lists workspaces', () => {
    const resolvers = getResolvers();
    expect(resolvers.Query.listWorkspaces()).toEqual([
        { name: 'test', uri: 'file:///workspace/test' },
    ]);
});

test('lists directory contents', async () => {
    const resolvers = getResolvers();
    const result = await resolvers.Query.listDirectory(undefined, { workspaceUri: 'file:///workspace/test', path: '' });
    expect(readDirectory).toHaveBeenCalled();
    expect(result).toEqual([
        { name: 'file.txt', path: 'file.txt', isDirectory: false },
        { name: 'folder', path: 'folder', isDirectory: true },
    ]);
});

test('writes file', async () => {
    const resolvers = getResolvers();
    const ok = await resolvers.Mutation.writeFile(undefined, { workspaceUri: 'file:///workspace/test', path: 'new.txt', content: 'hello' });
    expect(writeFile).toHaveBeenCalled();
    expect(ok).toBe(true);
});
