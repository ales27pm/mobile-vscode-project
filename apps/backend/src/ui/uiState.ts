import * as vscode from 'vscode';

export type ServerUiStatus = 'inactive' | 'starting' | 'running' | 'stopped' | 'error';

export interface ServerUiState {
  status: ServerUiStatus;
  protocol?: 'http' | 'https';
  host?: string;
  port?: number;
  url?: string;
  pairingToken?: string;
  isPaired?: boolean;
  message?: string;
  lastUpdated: number;
}

const emitter = new vscode.EventEmitter<ServerUiState>();
export const onDidChangeServerUiState = emitter.event;

let state: ServerUiState = {
  status: 'inactive',
  isPaired: false,
  lastUpdated: Date.now()
};

export function getServerUiState(): ServerUiState {
  return state;
}

export function setServerUiState(patch: Partial<ServerUiState>) {
  state = {
    ...state,
    ...patch,
    lastUpdated: Date.now()
  };
  emitter.fire(state);
}
