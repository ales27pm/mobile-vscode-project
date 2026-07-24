import Constants from 'expo-constants';

type MobileVscodeExtra = {
  MOBILE_VSCODE_SERVER_URL?: unknown;
  LOCAL_IP?: unknown;
};

function normalizeServerOrigin(rawValue: string): string {
  const value = rawValue.trim();

  if (value.includes('YOUR_COMPUTER_IP_HERE')) {
    throw new Error('Replace YOUR_COMPUTER_IP_HERE in the MobileVSCode server URL.');
  }

  const url = new URL(value);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('MobileVSCode server URL must use http:// or https://.');
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error('MobileVSCode server URL must be a plain origin without credentials, query, or fragment.');
  }

  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error('MobileVSCode server URL must not include /graphql, /yjs, or another path.');
  }

  return `${url.protocol}//${url.host}`;
}

const extra = (Constants.expoConfig?.extra ?? {}) as MobileVscodeExtra;
const configuredUrl =
  process.env.EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL ??
  (typeof extra.MOBILE_VSCODE_SERVER_URL === 'string'
    ? extra.MOBILE_VSCODE_SERVER_URL
    : undefined);
const legacyHost =
  typeof extra.LOCAL_IP === 'string' && extra.LOCAL_IP.trim()
    ? extra.LOCAL_IP.trim()
    : '127.0.0.1';

export const SERVER_ORIGIN = normalizeServerOrigin(
  configuredUrl ?? `http://${legacyHost}:4000`
);

if (/^http:\/\/(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::|$)/.test(SERVER_ORIGIN)) {
  console.warn(
    'MobileVSCode is configured for a loopback address. Set EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL to the VS Code host address before using a physical device.'
  );
}

const websocketOrigin = SERVER_ORIGIN.replace(/^http:/, 'ws:').replace(/^https:/, 'wss:');

export const GRAPHQL_URL = `${SERVER_ORIGIN}/graphql`;
export const WS_URL = `${websocketOrigin}/graphql`;
export const YJS_URL = `${websocketOrigin}/yjs`;
