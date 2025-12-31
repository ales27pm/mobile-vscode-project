import * as vscode from 'vscode';

let channel: vscode.OutputChannel | null = null;

export function getLogChannel(): vscode.OutputChannel {
  if (!channel) {
    channel = vscode.window.createOutputChannel('MobileVSCode Server');
  }
  return channel;
}

function stamp() {
  return new Date().toISOString();
}

export function logInfo(message: string) {
  getLogChannel().appendLine(`[${stamp()}] INFO  ${message}`);
}

export function logWarn(message: string) {
  getLogChannel().appendLine(`[${stamp()}] WARN  ${message}`);
}

export function logError(message: string) {
  getLogChannel().appendLine(`[${stamp()}] ERROR ${message}`);
}

export function logDebug(message: string) {
  getLogChannel().appendLine(`[${stamp()}] DEBUG ${message}`);
}

export function showLogs() {
  getLogChannel().show(true);
}
