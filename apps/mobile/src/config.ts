import Constants from 'expo-constants';

type AppConfig = {
  GRAPHQL_URL: string;
  WS_URL: string;
  YWS_URL: string;
  LSP_URL: string;
  DEBUG_URL: string;
};

const config = Constants.expoConfig?.extra as AppConfig;

if (!config || !config.GRAPHQL_URL) {
  console.warn("Environment variables are not set via .env. Using default localhost values. This will not work on a physical device.");
}

export const GRAPHQL_URL = config?.GRAPHQL_URL || 'http://localhost:4000/graphql';
export const WS_URL = config?.WS_URL || 'ws://localhost:4000/graphql';
export const YWS_URL = config?.YWS_URL || 'ws://localhost:4000/yws';
export const LSP_URL = config?.LSP_URL || 'ws://localhost:4000/lsp';
export const DEBUG_URL = config?.DEBUG_URL || 'ws://localhost:4000/debug';
