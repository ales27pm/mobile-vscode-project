import * as vscode from 'vscode';
import { pubsub } from '../graphql/pubsub';
import { FS_EVENT } from '../constants';

let fileWatcher: vscode.FileSystemWatcher | null = null;

export function initializeFileSystemWatcher() {
    if (fileWatcher) {
        return;
    }

    fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');

    const publishEvent = (event: string, uri: vscode.Uri) => {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
        if (workspaceFolder) {
            const relPath = vscode.workspace.asRelativePath(uri, false);
            pubsub.publish(FS_EVENT, {
                fsEvent: { event, path: relPath }
            });
        }
    };

    fileWatcher.onDidCreate(uri => publishEvent('create', uri));
    fileWatcher.onDidChange(uri => publishEvent('change', uri));
    fileWatcher.onDidDelete(uri => publishEvent('delete', uri));
}

export function disposeFileSystemWatcher() {
    fileWatcher?.dispose();
    fileWatcher = null;
}
