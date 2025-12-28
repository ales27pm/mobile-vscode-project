#!/usr/bin/env bash
# scripts/fix_mobile_stack.sh
#
# Mobile VSCode Project fixer:
# - Creates missing /assets dir (Metro ENOENT)
# - Fixes shared package exports + ensures index.ts exists
# - Installs + wires URL + crypto polyfills for Expo
# - Builds shared
# - Builds + bundles backend
# - Creates local "vscode" stubs so backend can run under plain Node
# - Prints LAN GraphQL URL + optional auto-start backend / expo
#
# Usage:
#   chmod +x scripts/fix_mobile_stack.sh
#   AUTO_START_BACKEND=1 ./scripts/fix_mobile_stack.sh
#   AUTO_START_EXPO=1   ./scripts/fix_mobile_stack.sh
#
set -euo pipefail

# --------------------------- helpers -----------------------------------------

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHARED_DIR="$REPO_ROOT/packages/shared"
MOBILE_DIR="$REPO_ROOT/apps/mobile"
BACKEND_DIR="$REPO_ROOT/apps/backend"

log()  { echo; echo "==> $*"; }
warn() { echo; echo "[warn] $*"; }
die()  { echo; echo "[fatal] $*"; exit 1; }

need_file() { [[ -f "$1" ]] || die "Missing file: $1"; }
need_dir()  { [[ -d "$1" ]] || die "Missing directory: $1"; }

node_read_json_field() {
  # $1: json file path, $2: JS expression returning the value (from parsed json object j)
  node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); const v=($2); if(v===undefined||v===null){process.exit(2)}; process.stdout.write(String(v));" "$1"
}

get_workspace_name() {
  local pkg="$1"
  [[ -f "$pkg" ]] || return 1
  node_read_json_field "$pkg" "j.name"
}

yarn_ws_add() {
  # $1 workspace name, then packages...
  local ws="$1"; shift
  (cd "$REPO_ROOT" && yarn workspace "$ws" add "$@")
}

yarn_ws_run() {
  local ws="$1"; shift
  (cd "$REPO_ROOT" && yarn workspace "$ws" run "$@")
}

detect_lan_ip() {
  local ip=""
  if command -v ip >/dev/null 2>&1; then
    ip="$(ip route get 1.1.1.1 2>/dev/null | awk '{for(i=1;i<=NF;i++) if($i=="src"){print $(i+1); exit}}' || true)"
  fi
  if [[ -z "${ip:-}" ]]; then
    ip="$(hostname -I 2>/dev/null | awk '{print $1}' || true)"
  fi
  if [[ -z "${ip:-}" ]]; then
    ip="127.0.0.1"
  fi
  echo "$ip"
}

make_vscode_stub() {
  # $1: base dir where node_modules should live
  local base="$1"
  mkdir -p "$base/node_modules/vscode"

  cat > "$base/node_modules/vscode/package.json" <<'JSON'
{
  "name": "vscode",
  "version": "0.0.0-stub",
  "main": "index.js"
}
JSON

  cat > "$base/node_modules/vscode/index.js" <<'JS'
"use strict";

/**
 * VS Code API stub for running extension-like code under plain Node.
 * Expand only when runtime errors demand it.
 */

function makeDisposable() {
  return { dispose() {} };
}

function makeEvent() {
  // VS Code events are functions that accept a listener and return a Disposable.
  return function on(_listener) {
    return makeDisposable();
  };
}

const vscode = {
  commands: {
    registerCommand: () => makeDisposable(),
    executeCommand: async () => undefined,
  },

  workspace: {
    getConfiguration: () => ({
      get: (_k, defVal) => defVal,
      update: async () => undefined,
    }),
  },

  window: {
    showInformationMessage: (...args) =>
      console.log("[vscode.window.showInformationMessage]", ...args),
    showWarningMessage: (...args) =>
      console.warn("[vscode.window.showWarningMessage]", ...args),
    showErrorMessage: (...args) =>
      console.error("[vscode.window.showErrorMessage]", ...args),
  },

  // Your bundle crashed here previously:
  debug: {
    onDidStartDebugSession: makeEvent(),
    onDidTerminateDebugSession: makeEvent(),
    onDidReceiveDebugSessionCustomEvent: makeEvent(),
    startDebugging: async () => true,
  },

  extensions: {
    all: [],
    getExtension: () => undefined,
  },

  env: {},

  Uri: {
    file: (p) => ({ fsPath: p, path: p, toString: () => String(p) }),
    parse: (s) => ({ toString: () => String(s) }),
  },
};

module.exports = vscode;
JS

  echo "Created vscode stub at: $base/node_modules/vscode"
}

# --------------------------- sanity ------------------------------------------

need_dir "$REPO_ROOT"
need_dir "$SHARED_DIR"
need_dir "$MOBILE_DIR"
need_dir "$BACKEND_DIR"

need_file "$REPO_ROOT/package.json"
need_file "$SHARED_DIR/package.json"
need_file "$MOBILE_DIR/package.json"
need_file "$BACKEND_DIR/package.json"

MOBILE_WS="$(get_workspace_name "$MOBILE_DIR/package.json" || true)"
BACKEND_WS="$(get_workspace_name "$BACKEND_DIR/package.json" || true)"

[[ -n "${MOBILE_WS:-}" ]] || die "Could not detect mobile workspace name from apps/mobile/package.json"
[[ -n "${BACKEND_WS:-}" ]] || die "Could not detect backend workspace name from apps/backend/package.json"

log "0) Sanity: ensure required directories exist"
mkdir -p "$REPO_ROOT/assets"

# --------------------------- 1) shared exports --------------------------------

log "1) Fix shared package exports"
REPO_ROOT="$REPO_ROOT" node - <<'NODE'
const fs = require("fs");
const path = require("path");

const repoRoot = process.env.REPO_ROOT;
if (!repoRoot) {
  console.error("REPO_ROOT env missing in node patch step");
  process.exit(1);
}

const pkgPath = path.join(repoRoot, "packages", "shared", "package.json");

if (!fs.existsSync(pkgPath)) {
  console.error("Missing:", pkgPath);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
pkg.name ||= "shared";
pkg.main ||= "dist/index.js";
pkg.types ||= "dist/index.d.ts";
pkg.exports ||= {};

function ensureExport(subpath, target) {
  if (!pkg.exports[subpath]) pkg.exports[subpath] = target;
}

ensureExport(".", { types: "./dist/index.d.ts", default: "./dist/index.js" });

// Only add these if they make sense for your project.
// (They were in your earlier logs, so we keep them.)
ensureExport("./types", { default: "./dist/types.js", types: "./dist/types.d.ts" });
ensureExport("./src/types", { default: "./src/types.ts" });
ensureExport("./package.json", "./package.json");

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("Patched", pkgPath);
NODE

# --------------------------- 2) ensure shared index.ts ------------------------

log "2) Ensure shared index.ts exists"
if [[ ! -f "$SHARED_DIR/src/index.ts" ]]; then
  mkdir -p "$SHARED_DIR/src"
  cat > "$SHARED_DIR/src/index.ts" <<'TS'
export * from "./types";
TS
  echo "Created $SHARED_DIR/src/index.ts"
fi

# --------------------------- 3) build shared ----------------------------------

log "3) Build shared workspace"
( cd "$REPO_ROOT" && yarn workspace shared run tsc -p . ) \
  || ( cd "$REPO_ROOT" && yarn workspace "$(node -e "console.log(require('./packages/shared/package.json').name)")" run tsc -p . )

# --------------------------- 4) polyfills deps --------------------------------

log "4) Fix crypto + URL polyfills (install into mobile workspace)"
yarn_ws_add "$MOBILE_WS" expo-crypto react-native-url-polyfill

# --------------------------- 5) patch Expo entry ------------------------------

log "5) Patch Expo entry (ensure polyfills run first)"

mkdir -p "$MOBILE_DIR/src/polyfills"

cat > "$MOBILE_DIR/src/polyfills/crypto.ts" <<'TS'
import * as ExpoCrypto from "expo-crypto";

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array;

function fillWithMathRandom(arr: Uint8Array) {
  for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() * 256) | 0;
}

function asUint8Array(view: TypedArray): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

(function ensureCrypto() {
  const g: any = globalThis as any;
  if (!g.crypto) g.crypto = {};

  if (typeof g.crypto.getRandomValues !== "function") {
    g.crypto.getRandomValues = <T extends TypedArray>(arr: T): T => {
      const u8 = asUint8Array(arr);

      try {
        // Expo currently has async APIs; keep this hook in case sync is added.
        // @ts-expect-error
        if (typeof (ExpoCrypto as any).getRandomBytes === "function") {
          // @ts-expect-error
          const bytes: Uint8Array = (ExpoCrypto as any).getRandomBytes(u8.length);
          u8.set(bytes);
          return arr;
        }
      } catch {}

      fillWithMathRandom(u8);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[crypto polyfill] Using Math.random() fallback for getRandomValues().");
      }
      return arr;
    };
  }
})();
TS

if [[ -f "$MOBILE_DIR/index.js" ]]; then
  REPO_ROOT="$REPO_ROOT" node - <<'NODE'
const fs = require("fs");
const path = require("path");

const repoRoot = process.env.REPO_ROOT;
if (!repoRoot) {
  console.error("REPO_ROOT env missing in Expo index patch step");
  process.exit(1);
}

const mobileIndex = path.join(repoRoot, "apps", "mobile", "index.js");
let s = fs.readFileSync(mobileIndex, "utf8");

const wantA = `import "react-native-url-polyfill/auto";`;
const wantB = `import "./src/polyfills/crypto";`;

function ensureTopImport(code, line) {
  if (code.includes(line)) return code;

  const lines = code.split("\n");
  let insertAt = 0;

  while (insertAt < lines.length) {
    const t = lines[insertAt].trim();
    if (t === "" || t.startsWith("//") || t.startsWith("/*") || t.startsWith("*")) {
      insertAt++;
      continue;
    }
    break;
  }

  if (lines[insertAt] && lines[insertAt].trim() === `"use strict";`) insertAt++;

  lines.splice(insertAt, 0, line);
  return lines.join("\n");
}

s = ensureTopImport(s, wantB);
s = ensureTopImport(s, wantA);

fs.writeFileSync(mobileIndex, s, "utf8");
console.log("Patched", mobileIndex);
NODE
else
  warn "apps/mobile/index.js not found; skipped patch"
fi

# --------------------------- 6) vscode stubs ----------------------------------

log "6) Stub VS Code runtime for Node execution (backend + root)"
make_vscode_stub "$BACKEND_DIR"
make_vscode_stub "$REPO_ROOT"

# --------------------------- 7) build + bundle backend ------------------------

log "7) Build + bundle backend"
yarn_ws_run "$BACKEND_WS" build
yarn_ws_run "$BACKEND_WS" bundle

# --------------------------- 8) network info ----------------------------------

log "8) Network info"
LAN_IP="$(detect_lan_ip)"
GRAPHQL_URL="http://${LAN_IP}:4000/graphql"
echo "Detected LAN IP: $LAN_IP"
echo "GraphQL URL:"
echo "  $GRAPHQL_URL"

# --------------------------- 9) optional start backend ------------------------

log "9) Optional backend start"
if [[ "${AUTO_START_BACKEND:-0}" == "1" ]]; then
  log "Starting backend on this terminal (Ctrl+C to stop)…"
  (cd "$REPO_ROOT" && exec yarn workspace "$BACKEND_WS" start)
else
  warn "Not starting backend automatically."
  echo "To auto-start backend next time:"
  echo "  AUTO_START_BACKEND=1 $REPO_ROOT/scripts/fix_mobile_stack.sh"
fi

# --------------------------- 10) optional start expo --------------------------

if [[ "${AUTO_START_EXPO:-0}" == "1" ]]; then
  log "Starting Expo (clearing cache)…"
  (cd "$REPO_ROOT" && EXPO_PUBLIC_GRAPHQL_HTTP_URL="$GRAPHQL_URL" npx expo start -c)
else
  echo
  echo "Run Expo like this:"
  echo "  EXPO_PUBLIC_GRAPHQL_HTTP_URL=\"$GRAPHQL_URL\" npx expo start -c"
fi

log "Done."
