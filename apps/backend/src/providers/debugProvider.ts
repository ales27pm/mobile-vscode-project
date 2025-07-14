import * as vscode from 'vscode';
import { pubsub } from '../graphql/pubsub';

let activeSession: vscode.DebugSession | undefined;

vscode.debug.onDidStartDebugSession(session => {
  activeSession = session;
  pubsub.publish('DEBUG_EVENT', { debuggerEvent: { event: 'start', body: `Session '${session.name}' started.` } });
});

vscode.debug.onDidTerminateDebugSession(() => {
  activeSession = undefined;
  pubsub.publish('DEBUG_EVENT', { debuggerEvent: { event: 'stop', body: 'Session terminated.' } });
});

vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
  try {
    if (e.event === 'output') {
      const output = e.body && typeof e.body === 'object' && 'output' in e.body && typeof e.body.output === 'string' ? e.body.output : '';
      pubsub.publish('DEBUG_EVENT', { debuggerEvent: { event: 'output', body: output } });
    }
  } catch (error) {
    console.error('Error handling debug session custom event:', error);
  }
});

export const getDebugProvider = () => ({
  Query: {
    getLaunchConfigurations: (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(workspaceUri));
      if (!workspaceFolder) return [];
      const launchConfig = vscode.workspace.getConfiguration('launch', workspaceFolder.uri);
      return launchConfig.get<vscode.DebugConfiguration[]>('configurations') ?? [];
    },
  },
  Mutation: {
    startDebugging: async (_: unknown, { workspaceUri, configName }: { workspaceUri: string; configName: string }) => {
      const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(workspaceUri));
      if (!workspaceFolder) return false;
      return vscode.debug.startDebugging(workspaceFolder, configName);
    },
    stopDebugging: async () => {
      if (!activeSession) return false;
      await vscode.debug.stopDebugging(activeSession);
      return true;
    },
  },
});

export const testingExports = {
  __setActiveSession: (session: vscode.DebugSession | undefined) => { activeSession = session; },
};
