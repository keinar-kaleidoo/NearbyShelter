const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
  resolver: {
    sourceExts: ['js', 'json', 'ts', 'tsx', 'jsx'], // הוסף הרחבות אם נדרשות
  },
  maxWorkers: 2, // הורדת מספר ה-workers למספר קטן יותר
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
