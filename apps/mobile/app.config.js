/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = ({ config }) => {
  const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';

  // IMPORTANT for CI:
  // Non-interactive EAS builds require the EAS project to be configured.
  // For dynamic config (app.config.js), EAS cannot always auto-write the projectId,
  // so we inject it from env (GitHub Secret: EAS_PROJECT_ID).
  const EAS_PROJECT_ID =
    process.env.EAS_PROJECT_ID ||
    (config && config.extra && config.extra.eas && config.extra.eas.projectId) ||
    undefined;

  const existingExtra = (config && config.extra) || {};
  const existingEas = (existingExtra && existingExtra.eas) || {};

  const eas = {
    ...existingEas,
    ...(EAS_PROJECT_ID ? { projectId: EAS_PROJECT_ID } : {}),
  };

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
      ...existingExtra,
      LOCAL_IP,
      eas,
    },
  };
};
