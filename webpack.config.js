const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require('@wasm-tool/wasm-pack-plugin');

const dist = path.resolve(__dirname, 'dist');

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

    new WasmPackPlugin({
      crateDirectory: __dirname,
    }),
  ],

  experiments: {
    asyncWebAssembly: true,
  },
};
