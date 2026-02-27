const { withAndroidManifest, withInfoPlist } = require('expo/config-plugins');

function withWebRTC(config) {
  // Android: Add permissions for WebRTC
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Ensure permissions array exists
    if (!manifest['uses-permission']) {
      manifest['uses-permission'] = [];
    }

    const permissions = [
      'android.permission.CAMERA',
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS',
      'android.permission.INTERNET',
      'android.permission.ACCESS_NETWORK_STATE',
    ];

    permissions.forEach((perm) => {
      const exists = manifest['uses-permission'].some(
        (p) => p.$?.['android:name'] === perm
      );
      if (!exists) {
        manifest['uses-permission'].push({
          $: { 'android:name': perm },
        });
      }
    });

    return config;
  });

  // iOS: Add usage descriptions
  config = withInfoPlist(config, (config) => {
    config.modResults.NSCameraUsageDescription =
      config.modResults.NSCameraUsageDescription ||
      'CanTak canli video yayin icin kameraya erisim gerektirir.';
    config.modResults.NSMicrophoneUsageDescription =
      config.modResults.NSMicrophoneUsageDescription ||
      'CanTak ses kaydi icin mikrofona erisim gerektirir.';
    return config;
  });

  return config;
}

module.exports = withWebRTC;
