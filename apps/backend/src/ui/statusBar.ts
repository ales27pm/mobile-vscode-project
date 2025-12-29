import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

/** Create (or return existing) status bar item for server status */
export function getStatusBar(): vscode.StatusBarItem {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.text = "$(rocket) Mobile Server: Inactive";
    statusBarItem.tooltip = "Mobile VSCode backend status";
    statusBarItem.command = "mobile-vscode-server.start";  // clicking will start the server
  }
  return statusBarItem;
}

/** Update the status bar text to reflect current status */
export function updateStatusBar(message: string) {
  if (!statusBarItem) {
    return;
  }
  statusBarItem.text = `$(rocket) Mobile Server: ${message}`;
}
