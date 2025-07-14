import { initializeFileSystemWatcher, disposeFileSystemWatcher } from './fileSystemWatcher';
import { pubsub } from '../graphql/pubsub';
import * as vscode from 'vscode';

type Callback = (uri: vscode.Uri) => void;

const createFileSystemWatcher = vscode.workspace.createFileSystemWatcher as jest.Mock;
const getWorkspaceFolder = vscode.workspace.getWorkspaceFolder as jest.Mock;
const asRelativePath = vscode.workspace.asRelativePath as jest.Mock;

let onCreate: Callback | undefined;
let onChange: Callback | undefined;
let onDelete: Callback | undefined;
const dispose = jest.fn();

jest.mock('../graphql/pubsub', () => ({
    pubsub: { publish: jest.fn() }
}));

beforeEach(() => {
    (pubsub.publish as jest.Mock).mockClear();
    createFileSystemWatcher.mockImplementation(() => {
        return {
            onDidCreate: (cb: Callback) => { onCreate = cb; },
            onDidChange: (cb: Callback) => { onChange = cb; },
            onDidDelete: (cb: Callback) => { onDelete = cb; },
            dispose
        } as any;
    });
    getWorkspaceFolder.mockReturnValue({ uri: { fsPath: '/workspace/test' } });
    asRelativePath.mockImplementation((uri: vscode.Uri) => uri.fsPath.replace('/workspace/test/', ''));
    onCreate = undefined;
    onChange = undefined;
    onDelete = undefined;
    dispose.mockClear();
});

it('publishes events for file changes', () => {
    initializeFileSystemWatcher();
    expect(createFileSystemWatcher).toHaveBeenCalledWith('**/*');
    const uri = { fsPath: '/workspace/test/foo.txt' } as vscode.Uri;
    onCreate!(uri);
    onChange!(uri);
    onDelete!(uri);
    expect(pubsub.publish).toHaveBeenCalledTimes(3);
    expect(pubsub.publish).toHaveBeenCalledWith('FS_EVENT', { fsEvent: { event: 'create', path: 'foo.txt' } });
    expect(pubsub.publish).toHaveBeenCalledWith('FS_EVENT', { fsEvent: { event: 'change', path: 'foo.txt' } });
    expect(pubsub.publish).toHaveBeenCalledWith('FS_EVENT', { fsEvent: { event: 'delete', path: 'foo.txt' } });
});

it('does not reinitialize watcher if already set', () => {
    initializeFileSystemWatcher();
    initializeFileSystemWatcher();
    expect(createFileSystemWatcher).toHaveBeenCalledTimes(1);
});

it('disposes watcher', () => {
    initializeFileSystemWatcher();
    disposeFileSystemWatcher();
    expect(dispose).toHaveBeenCalled();
    // calling again should be safe
    disposeFileSystemWatcher();
});
