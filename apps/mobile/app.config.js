/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = ({ config }) => {
  const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';

  return {
    ...config,
    name: 'MobileVSCode',
    slug: 'mobile-vscode',
    scheme: 'mobilevscode',
    version: '0.1.0',
    orientation: 'portrait',
    platforms: ['ios', 'android'],

    // Prefer root-level assets, but also duplicated in apps/mobile/assets
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    splash: {
      image: path.join(__dirname, '..', 'assets', 'splash.png'),
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ['**/*'],

    ios: { bundleIdentifier: 'com.codex.mobilevscode', supportsTablet: true },
    android: { package: 'com.codex.mobilevscode' },

    extra: {
      ...((config && config.extra) || {}),
      LOCAL_IP,
    },
  };
};
