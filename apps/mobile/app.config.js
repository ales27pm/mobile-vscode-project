/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

function normalizeServerOrigin(rawValue) {
  const value = rawValue.trim();

  if (value.includes('YOUR_COMPUTER_IP_HERE')) {
    throw new Error('Replace YOUR_COMPUTER_IP_HERE in EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL.');
  }

  const url = new URL(value);

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL must use http:// or https://.');
  }

  if (url.username || url.password || url.search || url.hash) {
    throw new Error('EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL must be a plain origin.');
  }

  if (url.pathname !== '/' && url.pathname !== '') {
    throw new Error('EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL must not include a path.');
  }

  return `${url.protocol}//${url.host}`;
}

function pluginName(plugin) {
  return Array.isArray(plugin) ? plugin[0] : plugin;
}

module.exports = ({ config }) => {
  const baseConfig = config || {};
  const localIp = process.env.LOCAL_IP || '127.0.0.1';
  const serverOrigin = normalizeServerOrigin(
    process.env.EXPO_PUBLIC_MOBILE_VSCODE_SERVER_URL || `http://${localIp}:4000`
  );
  const allowCleartext = serverOrigin.startsWith('http://');

  const easProjectId =
    process.env.EAS_PROJECT_ID ||
    (baseConfig.extra && baseConfig.extra.eas && baseConfig.extra.eas.projectId) ||
    undefined;

  const existingExtra = baseConfig.extra || {};
  const existingEas = existingExtra.eas || {};
  const existingIos = baseConfig.ios || {};
  const existingAndroid = baseConfig.android || {};
  const existingInfoPlist = existingIos.infoPlist || {};
  const existingAts = existingInfoPlist.NSAppTransportSecurity || {};
  const existingPlugins = Array.isArray(baseConfig.plugins) ? baseConfig.plugins : [];
  const managedPluginNames = new Set([
    'expo-secure-store',
    './plugins/with-mobile-vscode-networking',
  ]);

  const eas = {
    ...existingEas,
    ...(easProjectId ? { projectId: easProjectId } : {}),
  };

  return {
    ...baseConfig,
    name: 'MobileVSCode',
    slug: 'mobile-vscode',
    scheme: 'mobilevscode',
    version: '0.1.0',
    orientation: baseConfig.orientation || 'portrait',
    platforms: ['ios', 'android'],

    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    splash: {
      image: path.join(__dirname, '..', 'assets', 'splash.png'),
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ['**/*'],

    ios: {
      ...existingIos,
      bundleIdentifier: existingIos.bundleIdentifier || 'com.codex.mobilevscode',
      supportsTablet: true,
      config: {
        ...(existingIos.config || {}),
        usesNonExemptEncryption: false,
      },
      infoPlist: {
        ...existingInfoPlist,
        NSLocalNetworkUsageDescription:
          existingInfoPlist.NSLocalNetworkUsageDescription ||
          'MobileVSCode connects to your VS Code server to browse, edit, and run workspace actions.',
        NSAppTransportSecurity: {
          ...existingAts,
          NSAllowsLocalNetworking: true,
        },
      },
    },
    android: {
      ...existingAndroid,
      package: existingAndroid.package || 'com.codex.mobilevscode',
    },

    plugins: [
      ...existingPlugins.filter(plugin => !managedPluginNames.has(pluginName(plugin))),
      ['expo-secure-store', { configureAndroidBackup: true }],
      ['./plugins/with-mobile-vscode-networking', { allowCleartext }],
    ],

    extra: {
      ...existingExtra,
      LOCAL_IP: localIp,
      MOBILE_VSCODE_SERVER_URL: serverOrigin,
      eas,
    },
  };
};
