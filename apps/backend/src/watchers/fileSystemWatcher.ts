import * as vscode from 'vscode';
import { pubsub } from '../graphql/pubsub';
import { FS_EVENT } from '../constants';

let fileWatcher: vscode.FileSystemWatcher | null = null;

/**
 * Initialize a watcher for all files in the workspace.
 * Publishes events through PubSub on file creation, change, or deletion.
 */
export function initializeFileSystemWatcher() {
  if (fileWatcher) {
    return;
  }

  // Watch all files under the workspace (could be refined for performance)
  fileWatcher = vscode.workspace.createFileSystemWatcher('**/*');

  const publishEvent = (type: string, uri: vscode.Uri) => {
    const changeType = type.toUpperCase();
    pubsub.publish(FS_EVENT, {
      fileChange: {
        type: changeType,
        path: uri.fsPath
      }
    });
    console.log(`🔄 File ${changeType}: ${uri.fsPath}`);
  };

  // Attach event listeners
  fileWatcher.onDidCreate(uri => publishEvent('CREATED', uri));
  fileWatcher.onDidChange(uri => publishEvent('CHANGED', uri));
  fileWatcher.onDidDelete(uri => publishEvent('DELETED', uri));
}

/** Dispose of the file system watcher */
export function disposeFileSystemWatcher() {
  if (fileWatcher) {
    fileWatcher.dispose();
    fileWatcher = null;
  }
}
