#!/bin/bash

set -e

echo "Updating React and React Native versions for Expo SDK 54..."
npm install

echo "Removing invalid devDependencies and installing required backend packages..."
npm prune
npm install jsonwebtoken simple-git
npm install -D @types/jsonwebtoken

echo "Patching TypeScript configs and adding type definitions..."

TS_CONFIG_PATH="./apps/backend/tsconfig.json"

if [ -f "$TS_CONFIG_PATH" ]; then
  jq '.compilerOptions.module = "es2022" | .compilerOptions.target = "es2022"' "$TS_CONFIG_PATH" > tmp.json && mv tmp.json "$TS_CONFIG_PATH"
else
  echo "Warning: $TS_CONFIG_PATH not found. Skipping TypeScript config patch."
fi

echo "Setting main entry file for the mobile app..."
MAIN_FILE="./apps/backend/src/index.ts"
if ! grep -q "import typeDefs" "$MAIN_FILE"; then
  sed -i 's/import { typeDefs } from ".\/schema"/import typeDefs from ".\/schema"/' "$MAIN_FILE"
fi

echo "Patching Webpack config..."
cat <<EOF > ./apps/backend/webpack.config.js
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
EOF

echo "Building and bundling the VS Code extension (with embedded backend)..."
npm run bundle --workspace apps/backend
