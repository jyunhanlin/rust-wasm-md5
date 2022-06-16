const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');

const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

module.exports = {
  mode: 'production',

  entry: {
    index: './js/index.js',
  },

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
  },

  plugins: [
    new HTMLWebpackPlugin({
      template: './static/index.html',
    }),

    new CopyPlugin({
      patterns: [{ from: 'public', to: 'public' }],
    }),

    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],

  resolve: { fallback: { buffer: require.resolve('buffer/') } },

  experiments: {
    asyncWebAssembly: true,
  },
};
