import { getResolvers } from './resolvers';
import * as fs from 'fs';
import * as vscode from 'vscode';

jest.mock('vscode', () => {
    const readDirectory = jest.fn();
    const readFile = jest.fn();
    const writeFile = jest.fn();
    const workspaceFolder = { name: 'test', uri: { fsPath: '/workspace/test', toString: () => 'file:///workspace/test' } };
    const getWorkspaceFolder = jest.fn(() => workspaceFolder);
    return {
        workspace: {
            workspaceFolders: [workspaceFolder],
            getWorkspaceFolder,
            fs: { readDirectory, readFile, writeFile },
            asRelativePath: (uri: vscode.Uri) => uri.fsPath.replace('/workspace/test/', '')
        },
        Uri: {
            parse: (s: string) => ({ fsPath: s.replace('file://',''), toString: () => s }),
            file: (p: string) => ({ fsPath: p, toString: () => `file://${p}` })
        },
        FileType: { Directory: 2 },
        __mocks: { readDirectory, readFile, writeFile, getWorkspaceFolder, workspaceFolder }
    };
}, { virtual: true });

jest.mock('fs');

const { __mocks } = jest.requireMock('vscode');
const readDirectory: jest.Mock = __mocks.readDirectory;
const readFile: jest.Mock = __mocks.readFile;
const writeFile: jest.Mock = __mocks.writeFile;
const getWorkspaceFolder: jest.Mock = __mocks.getWorkspaceFolder;
const {workspaceFolder} = __mocks;

beforeEach(() => {
    (fs.realpathSync.native as jest.Mock).mockImplementation((p: string) => p);
    readDirectory.mockResolvedValue([['file.txt', 0], ['folder', 2]]);
    readFile.mockResolvedValue(Buffer.from('content'));
    writeFile.mockResolvedValue(undefined);
    getWorkspaceFolder.mockReturnValue(workspaceFolder);
});

test('lists workspaces', () => {
    const resolvers = getResolvers();
    expect(resolvers.Query.listWorkspaces()).toEqual([
        { name: 'test', uri: 'file:///workspace/test' }
    ]);
});

test('lists directory contents', async () => {
    const resolvers = getResolvers();
    const result = await resolvers.Query.listDirectory(undefined, { workspaceUri: 'file:///workspace/test', path: '' });
    expect(readDirectory).toHaveBeenCalled();
    expect(result).toEqual([
        { name: 'file.txt', path: 'file.txt', isDirectory: false },
        { name: 'folder', path: 'folder', isDirectory: true }
    ]);
});

test('writes file', async () => {
    const resolvers = getResolvers();
    const ok = await resolvers.Mutation.writeFile(undefined, { workspaceUri: 'file:///workspace/test', path: 'new.txt', content: 'hello' });
    expect(writeFile).toHaveBeenCalled();
    expect(ok).toBe(true);
});
