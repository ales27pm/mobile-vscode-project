import * as vscode from 'vscode';
import { startServer, stopServer } from './core/server';
import { getStatusBar } from './ui/statusBar';

export async function activate(context: vscode.ExtensionContext) {
  console.log('MobileVSCode Server extension is now active.');

  // Initialize and show a status bar item for server status
  const statusBar = getStatusBar();
  context.subscriptions.push(statusBar);
  statusBar.show();

  // Automatically start the backend server when extension activates
  await startServer(context);

  // Register commands for manual control as well
  context.subscriptions.push(
    vscode.commands.registerCommand('mobile-vscode-server.start', async () => {
      await startServer(context);
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand('mobile-vscode-server.stop', () => {
      stopServer();
    })
  );
}

export function deactivate() {
  // Cleanup on extension deactivation
  stopServer();
  console.log('MobileVSCode Server extension deactivated.');
}
