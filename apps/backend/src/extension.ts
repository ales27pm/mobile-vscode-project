import * as vscode from 'vscode';
import { startServer, stopServer, restartServer } from './core/server';
import { initStatusBar } from './ui/statusBar';
import { StatusTreeProvider } from './ui/statusTree';
import { getServerUiState } from './ui/uiState';
import { logInfo, logWarn, showLogs } from './ui/logger';

export async function activate(context: vscode.ExtensionContext) {
  logInfo('MobileVSCode Server extension is now active.');

  // --- UI: status bar + sidebar view ---
  initStatusBar(context);

  const tree = new StatusTreeProvider();
  vscode.window.registerTreeDataProvider('mobileVscode.statusView', tree);

  // --- Commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand('mobile-vscode-server.start', async () => {
      await startServer(context);
    }),
    vscode.commands.registerCommand('mobile-vscode-server.stop', () => {
      stopServer();
    }),
    vscode.commands.registerCommand('mobile-vscode-server.restart', async () => {
      await restartServer(context);
    }),
    vscode.commands.registerCommand('mobile-vscode-server.openStatus', async () => {
      // Focus the MobileVSCode activity bar container.
      await vscode.commands.executeCommand('workbench.view.extension.mobileVscode');

      // Also provide quick actions on click.
      const state = getServerUiState();
      const picks: vscode.QuickPickItem[] = [
        { label: 'Start Server', description: 'Launch the backend' },
        { label: 'Stop Server', description: 'Stop the backend' },
        { label: 'Restart Server', description: 'Restart backend' },
        { label: 'Copy Server URL', description: state.url ? state.url : 'No URL available' },
        { label: 'Copy Pairing Token', description: state.pairingToken ? state.pairingToken : 'No token available' },
        { label: 'Open Settings', description: 'Configure host/port/HTTPS' },
        { label: 'Open Logs', description: 'Show extension logs' }
      ];

      const choice = await vscode.window.showQuickPick(picks, {
        placeHolder: 'MobileVSCode actions'
      });
      if (!choice) return;

      switch (choice.label) {
        case 'Start Server':
          return startServer(context);
        case 'Stop Server':
          return stopServer();
        case 'Restart Server':
          return restartServer(context);
        case 'Copy Server URL':
          if (state.url) {
            await vscode.env.clipboard.writeText(state.url);
            vscode.window.showInformationMessage('Server URL copied to clipboard.');
          } else {
            vscode.window.showWarningMessage('No server URL available yet. Start the server first.');
          }
          return;
        case 'Copy Pairing Token':
          if (state.pairingToken) {
            await vscode.env.clipboard.writeText(state.pairingToken);
            vscode.window.showInformationMessage('Pairing token copied to clipboard.');
          } else {
            vscode.window.showWarningMessage('No pairing token available yet. Start the server first.');
          }
          return;
        case 'Open Settings':
          return vscode.commands.executeCommand('mobile-vscode-server.openSettings');
        case 'Open Logs':
          return vscode.commands.executeCommand('mobile-vscode-server.openLogs');
      }
    }),
    vscode.commands.registerCommand('mobile-vscode-server.openSettings', async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:codex.mobile-vscode-server');
    }),
    vscode.commands.registerCommand('mobile-vscode-server.copyUrl', async (url?: string) => {
      const state = getServerUiState();
      const value = url || state.url;
      if (!value) {
        vscode.window.showWarningMessage('No server URL available yet.');
        return;
      }
      await vscode.env.clipboard.writeText(value);
      vscode.window.showInformationMessage('Server URL copied to clipboard.');
    }),
    vscode.commands.registerCommand('mobile-vscode-server.copyPairingToken', async (token?: string) => {
      const state = getServerUiState();
      const value = token || state.pairingToken;
      if (!value) {
        vscode.window.showWarningMessage('No pairing token available yet.');
        return;
      }
      await vscode.env.clipboard.writeText(value);
      vscode.window.showInformationMessage('Pairing token copied to clipboard.');
    }),
    vscode.commands.registerCommand('mobile-vscode-server.openLogs', async () => {
      showLogs();
      try {
        await vscode.commands.executeCommand('workbench.action.openExtensionLogsFolder');
      } catch {
        logWarn('Could not open Extension Logs Folder (command not available).');
      }
    })
  );

  // --- Auto-start ---
  const cfg = vscode.workspace.getConfiguration('mobile-vscode-server');
  const autoStart = cfg.get<boolean>('autoStart', true);

  if (autoStart) {
    await startServer(context);
  }
}

export function deactivate() {
  stopServer();
  logInfo('MobileVSCode Server extension deactivated.');
}
