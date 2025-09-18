module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
          alias: {
            '@assets': './assets',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@screens': './screens',
            '@services': './services',
            '@storage': './storage',
            '@theme': './theme',
          },
        },
      ],
      [
        'dotenv-import',
        {
          moduleName: '@env',
          path: '.env',
          safe: false,
          allowUndefined: true,
        },
      ],
    ],
  };
};
