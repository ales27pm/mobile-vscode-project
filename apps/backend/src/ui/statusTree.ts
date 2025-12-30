import * as vscode from 'vscode';
import { getServerUiState, onDidChangeServerUiState, ServerUiState } from './uiState';

export class StatusTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private state: ServerUiState = getServerUiState();

  constructor() {
    onDidChangeServerUiState((s) => {
      this.state = s;
      this.refresh();
    });
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<vscode.TreeItem[]> {
    const items: vscode.TreeItem[] = [];

    items.push(this.statusItem());

    if (this.state.url) {
      items.push(this.urlItem(this.state.url));
    }

    if (this.state.pairingToken) {
      items.push(this.pairingTokenItem(this.state.pairingToken));
    }

    if (this.state.isPaired) {
      const paired = new vscode.TreeItem('Client: Paired', vscode.TreeItemCollapsibleState.None);
      paired.iconPath = new vscode.ThemeIcon('pass');
      items.push(paired);
    } else if (this.state.status === 'running') {
      const notPaired = new vscode.TreeItem('Client: Not paired', vscode.TreeItemCollapsibleState.None);
      notPaired.iconPath = new vscode.ThemeIcon('circle-outline');
      items.push(notPaired);
    }

    items.push(this.actionItem('Start Server', 'play', 'mobile-vscode-server.start'));
    items.push(this.actionItem('Stop Server', 'stop', 'mobile-vscode-server.stop'));
    items.push(this.actionItem('Restart Server', 'refresh', 'mobile-vscode-server.restart'));
    items.push(this.actionItem('Open Settings', 'gear', 'mobile-vscode-server.openSettings'));
    items.push(this.actionItem('Open Logs', 'output', 'mobile-vscode-server.openLogs'));

    if (this.state.status === 'error' && this.state.message) {
      const err = new vscode.TreeItem(`Last error: ${this.state.message}`, vscode.TreeItemCollapsibleState.None);
      err.iconPath = new vscode.ThemeIcon('warning');
      items.push(err);
    }

    return items;
  }

  private statusItem(): vscode.TreeItem {
    const label = (() => {
      switch (this.state.status) {
        case 'inactive':
          return 'Server: Inactive';
        case 'starting':
          return 'Server: Starting…';
        case 'running':
          return 'Server: Running';
        case 'stopped':
          return 'Server: Stopped';
        case 'error':
          return 'Server: Error';
      }
    })();

    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon(this.iconForStatus());
    item.tooltip = this.state.url ? `Listening on ${this.state.url}` : label;
    return item;
  }

  private iconForStatus(): string {
    switch (this.state.status) {
      case 'running':
        return 'radio-tower';
      case 'starting':
        return 'sync~spin';
      case 'error':
        return 'warning';
      case 'inactive':
      case 'stopped':
      default:
        return 'circle-slash';
    }
  }

  private urlItem(url: string): vscode.TreeItem {
    const item = new vscode.TreeItem(`URL: ${url}`, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('link');
    item.command = {
      command: 'mobile-vscode-server.copyUrl',
      title: 'Copy URL',
      arguments: [url]
    };
    item.tooltip = 'Click to copy server URL to clipboard.';
    return item;
  }

  private pairingTokenItem(token: string): vscode.TreeItem {
    const item = new vscode.TreeItem(`Pairing Token: ${token}`, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon('key');
    item.command = {
      command: 'mobile-vscode-server.copyPairingToken',
      title: 'Copy Pairing Token',
      arguments: [token]
    };
    item.tooltip = 'Click to copy pairing token to clipboard.';
    return item;
  }

  private actionItem(label: string, icon: string, command: string): vscode.TreeItem {
    const item = new vscode.TreeItem(label, vscode.TreeItemCollapsibleState.None);
    item.iconPath = new vscode.ThemeIcon(icon);
    item.command = { command, title: label };
    return item;
  }
}
