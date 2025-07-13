import * as vscode from 'vscode';
import { startServer, stopServer } from './core/server';
import { getStatusBar } from './ui/statusBar';

export function activate(context: vscode.ExtensionContext) {
    console.log('MobileVSCode Server extension is now active.');

    const statusBar = getStatusBar();
    context.subscriptions.push(statusBar);
    statusBar.show();

    context.subscriptions.push(
        vscode.commands.registerCommand('mobile-vscode-server.start', () => {
            startServer(context);
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('mobile-vscode-server.stop', () => {
            stopServer();
        })
    );
}

export function deactivate() {
    stopServer();
    console.log('MobileVSCode Server extension deactivated.');
}
