module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
      blocklist: null,
      allowlist: null,
      safe: false,
      allowUndefined: true,
    }],
    [
       '@babel/plugin-transform-class-properties', { loose: true }
    ],
    [
       '@babel/plugin-transform-private-property-in-object', { loose: true }
    ]
  ]
};
