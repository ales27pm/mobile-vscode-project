#!/usr/bin/env bash
set -euo pipefail

unset NODE_OPTIONS

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
node "$SCRIPT_DIR/run-tests.js" "$@"
