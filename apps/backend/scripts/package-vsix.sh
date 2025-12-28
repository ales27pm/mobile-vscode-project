#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STAGING="$ROOT_DIR/.vsix-staging"
OUT_VSIX="$ROOT_DIR/../../mobile-vscode-server.vsix"

echo "[package-vsix] root:    $ROOT_DIR"
echo "[package-vsix] staging: $STAGING"
echo "[package-vsix] out:     $OUT_VSIX"

rm -rf "$STAGING"
mkdir -p "$STAGING"

# Build backend (dist/)
yarn -s build

# Copy only what the extension actually needs
cp "$ROOT_DIR/package.json" "$STAGING/"
cp -r "$ROOT_DIR/dist" "$STAGING/"
[ -d "$ROOT_DIR/resources" ] && cp -r "$ROOT_DIR/resources" "$STAGING/" || true
[ -f "$ROOT_DIR/README.md" ] && cp "$ROOT_DIR/README.md" "$STAGING/" || true
[ -f "$ROOT_DIR/CHANGELOG.md" ] && cp "$ROOT_DIR/CHANGELOG.md" "$STAGING/" || true
# License is optional, but try
ls "$ROOT_DIR"/LICENSE* >/dev/null 2>&1 && cp "$ROOT_DIR"/LICENSE* "$STAGING/" || true

pushd "$STAGING" >/dev/null

# Ensure runtime deps only (no dev deps, no workspace crawling)
npm install --omit=dev --silent

# Extra safety: never ship node_modules/.bin symlinks
rm -rf node_modules/.bin || true

npx vsce package -o "$OUT_VSIX"

popd >/dev/null
echo "[package-vsix] DONE: $OUT_VSIX"
