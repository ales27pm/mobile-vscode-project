const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function withMobileVscodeNetworking(config, options = {}) {
  const allowCleartext = options.allowCleartext === true;
  const disableBackup = options.disableBackup === true;

  return withAndroidManifest(config, androidConfig => {
    const application = androidConfig.modResults.manifest.application?.[0];

    if (!application) {
      throw new Error('AndroidManifest.xml is missing its main application element.');
    }

    application.$ = application.$ || {};
    application.$['android:usesCleartextTraffic'] = allowCleartext ? 'true' : 'false';
    application.$['android:allowBackup'] = disableBackup ? 'false' : 'true';

    return androidConfig;
  });
};
