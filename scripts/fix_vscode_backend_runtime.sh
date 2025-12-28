#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/apps/backend"

log(){ printf "\n==> %s\n" "$*"; }
warn(){ printf "\n[warn] %s\n" "$*" >&2; }

make_vscode_stub() {
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
 * Add to this ONLY when runtime errors demand it.
 */

function makeDisposable() {
  return { dispose() {} };
}

function makeEvent() {
  // VS Code events are functions that accept a listener and return a Disposable.
  return function on(listener) {
    // keep reference (optional)
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

  // 🔥 This is what your bundle crashed on:
  debug: {
    onDidStartDebugSession: makeEvent(),
    onDidTerminateDebugSession: makeEvent(),
    onDidReceiveDebugSessionCustomEvent: makeEvent(),
    startDebugging: async () => true,
  },

  // Sometimes extensions expect these to exist (safe minimal stubs):
  extensions: {
    all: [],
    getExtension: () => undefined,
  },

  env: {},

  // Basic Uri stub (only if accessed later)
  Uri: {
    file: (p) => ({ fsPath: p, path: p, toString: () => String(p) }),
    parse: (s) => ({ toString: () => String(s) }),
  },
};

module.exports = vscode;
JS

  echo "Created vscode stub at: $base/node_modules/vscode"
}

log "1) Create VS Code runtime stub (backend + root)"
make_vscode_stub "$BACKEND_DIR"
make_vscode_stub "$REPO_ROOT"

log "2) Verify Node can resolve vscode from repo root"
node -e 'console.log("vscode resolves to:", require.resolve("vscode"))' || {
  warn "Still cannot resolve vscode from repo root. Ensure $REPO_ROOT/node_modules/vscode exists."
  exit 1
}

log "3) Verify Node can resolve vscode from backend"
( cd "$BACKEND_DIR" && node -e 'console.log("backend vscode resolves to:", require.resolve("vscode"))' )

log "4) Rebuild + bundle backend"
( cd "$REPO_ROOT" && yarn workspace mobile-vscode-server build )
( cd "$REPO_ROOT" && yarn workspace mobile-vscode-server bundle )

log "5) Optional: start backend (AUTO_START_BACKEND=1)"
if [[ "${AUTO_START_BACKEND:-0}" == "1" ]]; then
  ( cd "$REPO_ROOT" && yarn workspace mobile-vscode-server start )
else
  echo "Not starting backend. To start now:"
  echo "  AUTO_START_BACKEND=1 $REPO_ROOT/scripts/fix_vscode_backend_runtime.sh"
fi

log "Done."
