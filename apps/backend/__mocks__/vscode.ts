const vscode = {
  workspace: {
    workspaceFolders: [] as unknown[],
    getWorkspaceFolder: jest.fn(),
    fs: {
      readDirectory: jest.fn(),
      readFile: jest.fn(),
      writeFile: jest.fn(),
    },
    createFileSystemWatcher: jest.fn(() => ({
        onDidCreate: jest.fn(),
        onDidChange: jest.fn(),
        onDidDelete: jest.fn(),
        dispose: jest.fn(),
    })),
    asRelativePath: jest.fn(),
    getConfiguration: jest.fn(() => ({ get: jest.fn() })),
  },
  Uri: {
    parse: (s: string) => ({ fsPath: s.replace('file://',''), toString: () => s }),
    file: (p: string) => ({ fsPath: p, toString: () => `file://${p}` }),
  },
  RelativePattern: function(workspace: { uri: { fsPath: string } }, pattern: string) {
    return { baseUri: workspace.uri, pattern } as unknown;
  },
  FileType: { Directory: 2 },
  commands: { executeCommand: jest.fn() },
  extensions: { all: [] as unknown[] },
  window: {
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
    createStatusBarItem: jest.fn(() => ({
        show: jest.fn(),
        tooltip: '',
        command: '',
        text: '',
        backgroundColor: undefined,
    })),
  },
  debug: {
    onDidStartDebugSession: jest.fn(),
    onDidTerminateDebugSession: jest.fn(),
    onDidReceiveDebugSessionCustomEvent: jest.fn(),
    startDebugging: jest.fn(),
    stopDebugging: jest.fn(),
  },
  StatusBarAlignment: {
      Right: 2,
  },
  ThemeColor: jest.fn(id => id),
};

module.exports = vscode;
