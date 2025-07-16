const workspace = {
    getConfiguration: jest.fn(() => ({ get: jest.fn() })),
    fs: {
        readDirectory: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
    },
    getWorkspaceFolder: jest.fn(),
    asRelativePath: jest.fn(),
    createFileSystemWatcher: jest.fn(),
    workspaceFolders: [] as any,
};

const vscodeWindow = {
    showWarningMessage: jest.fn(),
    showErrorMessage: jest.fn(),
    showInformationMessage: jest.fn(),
};

const debug = {
    onDidStartDebugSession: jest.fn(),
    onDidTerminateDebugSession: jest.fn(),
    onDidReceiveDebugSessionCustomEvent: jest.fn(),
    startDebugging: jest.fn(),
    stopDebugging: jest.fn(),
};

const Uri = {
    parse: (s: string) => ({ fsPath: s.replace('file://', ''), toString: () => s }),
    file: (p: string) => ({ fsPath: p, toString: () => `file://${p}` }),
};

const FileType = { Directory: 2 };

class RelativePattern {
    base: any; pattern: string;
    constructor(base: any, pattern: string) { this.base = base; this.pattern = pattern; }
}

module.exports = { workspace, window: vscodeWindow, debug, Uri, FileType, RelativePattern };
