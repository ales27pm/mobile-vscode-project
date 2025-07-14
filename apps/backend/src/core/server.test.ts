import { startServer, stopServer } from './server';
import * as vscode from 'vscode';
import { ensureAuthContext } from './auth';
import { initializeFileSystemWatcher, disposeFileSystemWatcher } from '../watchers/fileSystemWatcher';

jest.mock('./auth');
jest.mock('../watchers/fileSystemWatcher');

const listen = jest.fn((port: number, cb: () => void) => cb());
const close = jest.fn((cb: () => void) => cb());
const on = jest.fn();

jest.mock('https', () => ({
    createServer: jest.fn(() => ({ listen, close, on }))
}), { virtual: true });

jest.mock('express', () => {
    const use = jest.fn();
    const json = jest.fn(() => 'json');
    const expressMock: any = jest.fn(() => ({ use }));
    expressMock.json = json;
    return Object.assign(expressMock, { __mocks: { use, json, expressMock } });
}, { virtual: true });
const expressModule = jest.requireMock('express').__mocks;
const use = expressModule.use as jest.Mock;
const json = expressModule.json as jest.Mock;
const expressMock = expressModule.expressMock as jest.Mock;

const start = jest.fn(() => Promise.resolve());
const applyMiddleware = jest.fn();
const stop = jest.fn();
class FakeApolloServer {
    start = start;
    applyMiddleware = applyMiddleware;
    stop = stop;
}
jest.mock('apollo-server-express', () => ({
    ApolloServer: jest.fn(() => new FakeApolloServer()),
    gql: (literals: any, ...placeholders: any[]) => literals.reduce((acc: string, lit: string, i: number) => acc + placeholders[i - 1] + lit)
}), { virtual: true });

jest.mock('@graphql-tools/schema', () => ({ makeExecutableSchema: jest.fn(() => 'schema') }), { virtual: true });

const ws = { on: jest.fn(), handleUpgrade: jest.fn(), close: jest.fn() };
jest.mock('ws', () => ({ WebSocketServer: jest.fn(() => ws) }), { virtual: true });

jest.mock('graphql-ws/lib/use/ws', () => ({ useServer: jest.fn(() => ({ dispose: jest.fn() })) }), { virtual: true });

jest.mock('y-websocket/bin/utils.js', () => ({ setupWSConnection: jest.fn(), setPersistence: jest.fn() }), { virtual: true });

jest.mock('yjs', () => ({}), { virtual: true });
jest.mock('lodash.debounce', () => () => undefined, { virtual: true });

jest.mock('fs', () => ({
    existsSync: jest.fn(() => true),
    readFileSync: jest.fn(() => Buffer.from('data'))
}), { virtual: true });

jest.mock('../graphql/resolvers', () => ({ getResolvers: jest.fn(() => ({})) }), { virtual: true });

jest.mock('../ui/statusBar', () => ({ updateStatusBar: jest.fn() }), { virtual: true });

jest.mock('path', () => ({ join: (...parts: string[]) => parts.join('/') }), { virtual: true });

jest.mock('vscode', () => ({
    workspace: {
        getConfiguration: jest.fn(() => ({ get: jest.fn(() => 4000) }))
    },
    window: {
        showWarningMessage: jest.fn(),
        showErrorMessage: jest.fn(),
        showInformationMessage: jest.fn()
    }
}), { virtual: true });

describe('server start/stop', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (ensureAuthContext as jest.Mock).mockResolvedValue({ jwtSecret: 'a', pairingToken: 'b', isPaired: false });
    });

    it('starts and stops server', async () => {
        const context = { extensionPath: '/ext' } as vscode.ExtensionContext;
        await startServer(context);
        await Promise.resolve();
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
        await Promise.resolve();
        await startServer(context);
        expect(vscode.window.showWarningMessage).toHaveBeenCalled();
    });
});
