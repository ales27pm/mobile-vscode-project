const path = require('path');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './src/index.ts',
  output: {
    filename: 'server.bundle.js',
    path: path.resolve(__dirname, 'dist'),
    module: true,
  },
  experiments: {
    outputModule: true,
    topLevelAwait: true
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    vscode: 'commonjs vscode'
  },
};
