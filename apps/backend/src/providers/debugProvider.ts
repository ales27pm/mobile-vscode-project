import * as vscode from 'vscode';
import { pubsub } from '../graphql/pubsub';
import { DEBUG_EVENT } from '../constants';

let activeSession: vscode.DebugSession | undefined;

vscode.debug.onDidStartDebugSession(session => {
  activeSession = session;
  try {
    pubsub.publish(DEBUG_EVENT, {
      debuggerEvent: { event: 'start', body: `Session '${session.name}' started.` },
    });
  } catch (error) {
    console.error('Failed to publish start debug event:', error);
  }
});

vscode.debug.onDidTerminateDebugSession(() => {
  activeSession = undefined;
  try {
    pubsub.publish(DEBUG_EVENT, { debuggerEvent: { event: 'stop', body: 'Session terminated.' } });
  } catch (error) {
    console.error('Failed to publish stop debug event:', error);
  }
});

const getOutputFromBody = (body: unknown): string =>
  typeof body === 'object' &&
  body !== null &&
  'output' in body &&
  typeof (body as { output: unknown }).output === 'string'
    ? (body as { output: string }).output
    : '';

vscode.debug.onDidReceiveDebugSessionCustomEvent(e => {
  try {
    if (activeSession && e.session === activeSession && e.event === 'output') {
      const output = getOutputFromBody(e.body);
      pubsub.publish(DEBUG_EVENT, { debuggerEvent: { event: 'output', body: output } });
    }
  } catch (error) {
    console.error('Error handling debug session custom event:', error);
  }
});

export const getDebugProvider = () => ({
  Query: {
    getLaunchConfigurations: (_: unknown, { workspaceUri }: { workspaceUri: string }) => {
      try {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(workspaceUri));
        if (!workspaceFolder) return [];
        const launchConfig = vscode.workspace.getConfiguration('launch', workspaceFolder.uri);
        return launchConfig.get<vscode.DebugConfiguration[]>('configurations') ?? [];
      } catch (error) {
        console.error('Error getting launch configurations:', error);
        return [];
      }
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
