import * as vscode from 'vscode';
import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';

let serverProcess: ChildProcess | undefined;

export function activate(context: vscode.ExtensionContext) {
  const startCommand = vscode.commands.registerCommand('mobile-vscode-server.start', () => {
    if (serverProcess) {
      vscode.window.showInformationMessage('Mobile VSCode Server is already running.');
      return;
    }
    const backendPath = context.asAbsolutePath(path.join('out', 'backend', 'index.js'));
    serverProcess = spawn('node', [backendPath], { stdio: 'pipe' });
    if (serverProcess.stdout) {
      serverProcess.stdout.on('data', (data) => {
        console.log(`[Mobile VSCode Server stdout]: ${data}`);
      });
    }
    if (serverProcess.stderr) {
      serverProcess.stderr.on('data', (data) => {
        console.error(`[Mobile VSCode Server stderr]: ${data}`);
      });
    }
    vscode.window.showInformationMessage('Mobile VSCode Server started.');
  });

  context.subscriptions.push(startCommand);
}

export function deactivate() {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = undefined;
  }
}
