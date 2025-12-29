#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PKG_DIR="$ROOT/apps/backend"
STAGE="$PKG_DIR/.vsix-staging"
OUT="$ROOT/mobile-vscode-server.vsix"

rm -rf "$STAGE"
mkdir -p "$STAGE"

# Build
yarn --cwd "$ROOT" build:backend

# Stage minimal runtime bundle
cp "$PKG_DIR/package.json" "$STAGE/"
cp -r "$PKG_DIR/dist" "$STAGE/"
cp -r "$PKG_DIR/resources" "$STAGE/" 2>/dev/null || true
cp "$PKG_DIR/README.md" "$STAGE/" 2>/dev/null || true
cp "$PKG_DIR/CHANGELOG.md" "$STAGE/" 2>/dev/null || true
cp "$PKG_DIR"/LICENSE* "$STAGE/" 2>/dev/null || true

# Install prod deps in stage (runtime deps only). Ignore lifecycle scripts since the build is already staged.
cd "$STAGE"
npm install --omit=dev --ignore-scripts

# Package
npx vsce package -o "$OUT"

echo "VSIX ready: $OUT"
