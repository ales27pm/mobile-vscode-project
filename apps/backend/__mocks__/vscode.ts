import * as path from 'path';

const toUri = (fsPath: string) => ({
  fsPath,
  path: fsPath,
  toString: () => `file://${fsPath}`,
});

const vscode = {
  workspace: {
    workspaceFolders: [] as unknown[],
    getWorkspaceFolder: jest.fn(),
    fs: {
      readDirectory: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
    createFileSystemWatcher: jest.fn(),
    asRelativePath: jest.fn(),
    getConfiguration: jest.fn(() => ({ get: jest.fn() })),
  },
  Uri: {
    parse: (s: string) => toUri(s.replace('file://', '')),
    file: (p: string) => toUri(p),
    joinPath: (workspace: { fsPath: string }, ...segments: string[]) => toUri(path.join(workspace.fsPath, ...segments)),
  },
  RelativePattern: function(workspace: { uri: { fsPath: string } }, pattern: string) {
    return { baseUri: workspace.uri, pattern } as unknown;
  },
  FileType: { File: 1, Directory: 2, SymbolicLink: 64, Unknown: 0 },
  commands: { executeCommand: jest.fn() },
  extensions: { all: [] as unknown[] },
  window: {
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
  },
  debug: {
    onDidStartDebugSession: jest.fn(),
    onDidTerminateDebugSession: jest.fn(),
    onDidReceiveDebugSessionCustomEvent: jest.fn(),
    startDebugging: jest.fn(),
    stopDebugging: jest.fn(),
  },
};
module.exports = vscode;
