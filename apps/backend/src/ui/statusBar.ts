import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function getStatusBar(): vscode.StatusBarItem {
    if (!statusBarItem) {
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBarItem.command = 'mobile-vscode-server.start';
        updateStatusBar(false);
    }
    return statusBarItem;
}

export function updateStatusBar(isActive: boolean, tooltip?: string) {
    const item = getStatusBar();
    if (isActive) {
        item.text = `$(vm-active) MobileVSC`;
        item.tooltip = tooltip || 'MobileVSCode Server is active. Click to stop.';
        item.command = 'mobile-vscode-server.stop';
        item.backgroundColor = undefined;
    } else {
        item.text = `$(vm-outline) MobileVSC`;
        item.tooltip = 'MobileVSCode Server is inactive. Click to start.';
        item.command = 'mobile-vscode-server.start';
        item.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    }
}
