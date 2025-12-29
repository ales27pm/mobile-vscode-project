/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');

const resolveAssetPath = (fileName) => {
  const candidatePaths = [
    path.join(__dirname, '..', '..', 'assets', fileName),
    path.join(__dirname, 'assets', fileName),
  ];

  const resolvedPath = candidatePaths.find((assetPath) => fs.existsSync(assetPath));

  if (!resolvedPath) {
    throw new Error(
      `Missing expected asset: ${fileName}. Checked paths: ${candidatePaths.join(', ')}`,
    );
  }

  return resolvedPath;
};

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
    icon: resolveAssetPath('icon.png'),
    splash: {
      image: resolveAssetPath('splash.png'),
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
