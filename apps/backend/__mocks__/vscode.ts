const vscode = {
  workspace: {
    workspaceFolders: [] as any[],
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
    parse: (s: string) => ({ fsPath: s.replace('file://',''), toString: () => s }),
    file: (p: string) => ({ fsPath: p, toString: () => `file://${p}` }),
  },
  RelativePattern: function(workspace: any, pattern: string) { return { baseUri: workspace.uri, pattern }; } as any,
  FileType: { Directory: 2 },
  commands: { executeCommand: jest.fn() },
  extensions: { all: [] as any[] },
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
