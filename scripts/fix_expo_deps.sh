#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

yarn add -W react-native-url-polyfill
yarn add -W expo-crypto
yarn add -D -W typescript@~5.9.2

echo
echo "OK. Now run:"
echo "  npx expo start -c"
