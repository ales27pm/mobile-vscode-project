#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Repo root: $ROOT_DIR"

NODE_VER="$(node -v || true)"
NPM_VER="$(npm -v || true)"
echo "==> node: ${NODE_VER}"
echo "==> npm:  ${NPM_VER}"

# Expo SDK 54 is happiest on Node 20 LTS.
if [[ "${NODE_VER}" =~ ^v2[1-9] || "${NODE_VER}" =~ ^v3 ]]; then
  echo "!! WARNING: Node ${NODE_VER} detected. Expo SDK 54 is most stable on Node 20 LTS."
  echo "!! If you see Metro/Babel weirdness: nvm install 20 && nvm use 20"
fi

ASSETS_DIR="$ROOT_DIR/assets"
MOBILE_DIR="$ROOT_DIR/apps/mobile"
MOBILE_ASSETS_DIR="$MOBILE_DIR/assets"

mkdir -p "$ASSETS_DIR" "$MOBILE_ASSETS_DIR"

echo "==> Ensuring Expo assets exist (root/assets + apps/mobile/assets)"

# Create tiny valid PNGs (no external deps) using base64.
# (These are intentionally minimal placeholders so Metro never fails.)
ICON_B64="iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAP0lEQVR4nO3OMQEAIAwEsf7/0w0mQk2pGm0kGQAAAAAAAAAAAAAAAAAAAAAAAADwGQm1AAE5c9w2AAAAAElFTkSuQmCC"
SPLASH_B64="iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAAP0lEQVR4nO3OMQEAIAwEsf7/0w0mQk2pGm0kGQAAAAAAAAAAAAAAAAAAAAAAAADwGQm1AAE5c9w2AAAAAElFTkSuQmCC"

ensure_png () {
  local target="$1"
  local b64="$2"
  if [[ ! -f "$target" ]]; then
    echo "created $target"
    printf "%s" "$b64" | base64 -d > "$target"
  else
    echo "exists  $target"
  fi
}

ensure_png "$ASSETS_DIR/icon.png" "$ICON_B64"
ensure_png "$ASSETS_DIR/splash.png" "$SPLASH_B64"

# Mirror into apps/mobile/assets so any relative references also work.
ensure_png "$MOBILE_ASSETS_DIR/icon.png" "$ICON_B64"
ensure_png "$MOBILE_ASSETS_DIR/splash.png" "$SPLASH_B64"

echo "==> Ensuring Expo config is valid (app.config.js instead of app.json with process.env)"

APP_JSON="$MOBILE_DIR/app.json"
if [[ -f "$APP_JSON" ]] && rg -n "process\.env" "$APP_JSON" >/dev/null 2>&1; then
  TS="$(date +"%Y%m%d-%H%M%S")"
  cp "$APP_JSON" "$MOBILE_DIR/app.json.bak.${TS}"
  echo "==> app.json contains process.env (invalid JSON). Backed up to: app.json.bak.${TS}"
fi

# Write app.config.js (Expo officially supports app.config.js)
cat > "$MOBILE_DIR/app.config.js" <<'JS'
/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');

module.exports = ({ config }) => {
  const LOCAL_IP = process.env.LOCAL_IP || '127.0.0.1';

  return {
    ...config,
    name: 'MobileVSCode',
    slug: 'mobile-vscode',
    scheme: 'mobilevscode',
    version: '0.1.0',
    orientation: 'portrait',
    platforms: ['ios', 'android'],

    // Prefer root-level assets, but also duplicated in apps/mobile/assets
    icon: path.join(__dirname, '..', 'assets', 'icon.png'),
    splash: {
      image: path.join(__dirname, '..', 'assets', 'splash.png'),
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },

    updates: { fallbackToCacheTimeout: 0 },
    assetBundlePatterns: ['**/*'],

    ios: { bundleIdentifier: 'com.codex.mobilevscode', supportsTablet: true },
    android: { package: 'com.codex.mobilevscode' },

    extra: {
      ...((config && config.extra) || {}),
      LOCAL_IP,
    },
  };
};
JS

# Replace app.json with a minimal valid JSON so Expo never parses env expressions there.
cat > "$MOBILE_DIR/app.json" <<'JSON'
{
  "expo": {
    "name": "MobileVSCode",
    "slug": "mobile-vscode"
  }
}
JSON

echo "==> Aligning dependencies for Expo SDK 54"
echo "    - expo-status-bar bundled version is ~3.0.8 on SDK 54"  # (per docs)

# Patch package.json files via Node (no jq dependency)
node <<'NODE'
const fs = require('fs');
const path = require('path');

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}
function writeJSON(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
  console.log('patched', p);
}
function ensure(obj, key, def) {
  if (!obj[key]) obj[key] = def;
  return obj[key];
}

const root = process.cwd();
const rootPkgPath = path.join(root, 'package.json');
const mobilePkgPath = path.join(root, 'apps/mobile/package.json');

const rootPkg = readJSON(rootPkgPath);
const mobilePkg = readJSON(mobilePkgPath);

// Root: keep workspaces, add overrides that match Expo SDK 54 expectations.
ensure(rootPkg, 'overrides', {});
rootPkg.overrides['react'] = '19.2.3';
rootPkg.overrides['react-dom'] = '19.2.3';
rootPkg.overrides['react-native'] = '0.81.4';

// Also force y-websocket to an existing version (1.5.5 is not on npm).
rootPkg.overrides['y-websocket'] = '1.5.3';

writeJSON(rootPkgPath, rootPkg);

// Mobile: SDK 54 alignment.
// IMPORTANT: expo-status-bar is ~3.0.8 for SDK 54 (not ~49.0.0).
mobilePkg.dependencies = mobilePkg.dependencies || {};
mobilePkg.devDependencies = mobilePkg.devDependencies || {};

// Expo SDK 54 core
mobilePkg.dependencies['expo'] = '54.0.30';

// Common Expo modules (use expo install afterwards if you prefer)
mobilePkg.dependencies['expo-constants'] = mobilePkg.dependencies['expo-constants'] || '~18.0.12';
mobilePkg.dependencies['expo-status-bar'] = '~3.0.8';

// React / RN expected by Expo SDK 54
mobilePkg.dependencies['react'] = '19.2.3';
mobilePkg.dependencies['react-dom'] = '19.2.3';
mobilePkg.dependencies['react-native'] = '0.81.4';

// Keep your polyfills
mobilePkg.dependencies['react-native-url-polyfill'] = mobilePkg.dependencies['react-native-url-polyfill'] || '^3.0.0';

// Avoid legacy Expo 49 pins if present
const removeIf = (k) => { if (mobilePkg.dependencies[k] && String(mobilePkg.dependencies[k]).includes('49')) delete mobilePkg.dependencies[k]; };
removeIf('expo-status-bar');
mobilePkg.dependencies['expo-status-bar'] = '~3.0.8';

// NPM override duplication is fine but keep consistent
mobilePkg.overrides = mobilePkg.overrides || {};
mobilePkg.overrides['react'] = '19.2.3';
mobilePkg.overrides['react-dom'] = '19.2.3';
mobilePkg.overrides['react-native'] = '0.81.4';
mobilePkg.overrides['y-websocket'] = '1.5.3';

writeJSON(mobilePkgPath, mobilePkg);
NODE

echo "==> Ensuring packages/editor is resolvable as a workspace package"

# If Editor screen imports "packages/editor", rewrite it to import the actual package name.
# Defaulting to "editor" (adjust if your packages/editor/package.json has a different name).
EDITOR_SCREEN="$ROOT_DIR/apps/mobile/src/screens/Editor.tsx"
if [[ -f "$EDITOR_SCREEN" ]]; then
  # Replace only the exact import pattern you're using.
  sed -i \
    -e "s/from 'packages\\/editor'/from 'editor'/g" \
    -e "s/from \"packages\\/editor\"/from \"editor\"/g" \
    "$EDITOR_SCREEN" || true
fi

echo "==> Writing apps/mobile/metro.config.js (monorepo + packages/* support)"

cat > "$MOBILE_DIR/metro.config.js" <<'JS'
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so Metro can resolve workspaces packages/*
config.watchFolders = [workspaceRoot];

// Prefer resolving node_modules from workspace root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Allow workspace package resolution (and avoid duplicate copies of react/react-native)
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
JS

echo "==> Cleaning install artifacts"
rm -rf node_modules package-lock.json \
  "$MOBILE_DIR/node_modules" "$MOBILE_DIR/package-lock.json"

echo "==> Installing dependencies (npm workspaces)"
npm install

echo
echo "==> Done."
echo "Next:"
echo "  cd apps/mobile"
echo "  npx expo start -c"
