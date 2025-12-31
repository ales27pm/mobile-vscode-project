import * as vscode from 'vscode';
import { getServerUiState, onDidChangeServerUiState, ServerUiState } from './uiState';

let statusBarItem: vscode.StatusBarItem | null = null;

export function initStatusBar(context: vscode.ExtensionContext): vscode.StatusBarItem {
  if (statusBarItem) {
    return statusBarItem;
  }

  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = 'mobile-vscode-server.openStatus';
  statusBarItem.tooltip = 'MobileVSCode Server';

  render(getServerUiState());

  const sub = onDidChangeServerUiState((state) => render(state));
  context.subscriptions.push(statusBarItem, sub);

  statusBarItem.show();
  return statusBarItem;
}

function render(state: ServerUiState) {
  if (!statusBarItem) return;

  let icon = 'circle-slash';
  let text = 'Stopped';
  let tooltipLines: string[] = [];

  switch (state.status) {
    case 'inactive':
      icon = 'circle-slash';
      text = 'Inactive';
      tooltipLines.push('Extension is loaded but server has not started.');
      break;
    case 'starting':
      icon = 'sync~spin';
      text = 'Starting…';
      tooltipLines.push('Starting backend server…');
      break;
    case 'running':
      icon = 'radio-tower';
      text = 'Running';
      if (state.url) tooltipLines.push(`Server: ${state.url}`);
      if (state.pairingToken) tooltipLines.push(`Pairing Token: ${state.pairingToken}`);
      tooltipLines.push('Click for status and actions.');
      break;
    case 'stopped':
      icon = 'circle-slash';
      text = 'Stopped';
      tooltipLines.push('Server is not running.');
      tooltipLines.push('Click for actions.');
      break;
    case 'error':
      icon = 'warning';
      text = 'Error';
      if (state.message) tooltipLines.push(state.message);
      tooltipLines.push('Click for details/actions.');
      break;
  }

  statusBarItem.text = `$(${icon}) MobileVSCode: ${text}`;
  statusBarItem.tooltip = tooltipLines.join('\n');
}
