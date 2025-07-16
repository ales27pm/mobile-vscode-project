import { startServer, stopServer } from './server';
import * as vscode from 'vscode';
import { ensureAuthContext } from './auth';
import { initializeFileSystemWatcher, disposeFileSystemWatcher } from '../watchers/fileSystemWatcher';

jest.mock('./auth');
jest.mock('../watchers/fileSystemWatcher');

// Use inline mocks to avoid circular dependency issues with ts-jest and virtual mocks
const listen = jest.fn((port: number, cb: () => void) => cb());
const close = jest.fn((cb: () => void) => cb());
const on = jest.fn();
jest.mock('https', () => ({
    createServer: jest.fn(() => ({ listen, close, on })),
}));

jest.mock('express', () => {
    const use = jest.fn();
    const json = jest.fn(() => 'json');
    const expressMock = jest.fn(() => ({ use }));
    (expressMock as any).json = json;
    return expressMock;
});
const expressMock = jest.requireMock('express') as jest.Mock;

const start = jest.fn(() => Promise.resolve());
const applyMiddleware = jest.fn();
const stop = jest.fn();
class FakeApolloServer {
    start = start;
    applyMiddleware = applyMiddleware;
    stop = stop;
}
jest.mock('apollo-server-express', () => ({ ApolloServer: jest.fn(() => new FakeApolloServer()) }));
jest.mock('@graphql-tools/schema', () => ({ makeExecutableSchema: jest.fn(() => 'schema') }));
jest.mock('../schema', () => 'type Query { _: Boolean }', { virtual: true });
jest.mock('ws', () => ({ WebSocketServer: jest.fn(() => ({ on: jest.fn(), handleUpgrade: jest.fn(), close: jest.fn() })) }));
jest.mock('graphql-ws/lib/use/ws', () => ({ useServer: jest.fn(() => ({ dispose: jest.fn() })) }));
jest.mock('y-websocket/bin/utils.js', () => ({ setupWSConnection: jest.fn(), setPersistence: jest.fn() }), { virtual: true });
jest.mock('yjs', () => ({}), { virtual: true });
jest.mock('lodash.debounce', () => () => undefined, { virtual: true });
jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => Buffer.from('data')),
}));
jest.mock('../graphql/resolvers', () => ({ getResolvers: jest.fn(() => ({})) }));
jest.mock('../ui/statusBar', () => ({ updateStatusBar: jest.fn() }));
jest.mock('path', () => ({ join: (...parts: string[]) => parts.join('/') }));

describe('server start/stop', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (ensureAuthContext as jest.Mock).mockResolvedValue({ jwtSecret: 'a', pairingToken: 'b', isPaired: false });
        (vscode.workspace.getConfiguration as jest.Mock).mockReturnValue({ get: jest.fn(() => 4000) });
    });

    it('starts and stops server', async () => {
        const context = { extensionPath: '/ext' } as vscode.ExtensionContext;
        await startServer(context);
        expect(expressMock).toHaveBeenCalled();
        expect(start).toHaveBeenCalled();
        expect(listen).toHaveBeenCalledWith(4000, expect.any(Function));
        expect(initializeFileSystemWatcher).toHaveBeenCalled();
        stopServer();
        expect(close).toHaveBeenCalled();
        expect(stop).toHaveBeenCalled();
        expect(disposeFileSystemWatcher).toHaveBeenCalled();
    });

    it('warns when already running', async () => {
        const context = { extensionPath: '/ext' } as vscode.ExtensionContext;
        await startServer(context);
        await startServer(context);
        expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });
});
