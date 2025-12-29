#!/usr/bin/env bash
set -euo pipefail

# End-to-end deployment helper for Mobile VSCode.
# - Installs dependencies
# - Runs lint/tests (unless skipped)
# - Packages the VS Code extension as a VSIX
# - Builds native mobile binaries via EAS
#
# Usage:
#   scripts/deploy.sh [--profile production|development] [--platform all|ios|android] [--local]
#                     [--skip-tests] [--skip-backend] [--skip-mobile]

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PROFILE="production"
PLATFORM="all"
LOCAL_BUILD=0
SKIP_TESTS=0
SKIP_BACKEND=0
SKIP_MOBILE=0
EXPO_TOKEN_ARG=""

usage() {
  cat <<'USAGE'
Usage: scripts/deploy.sh [options]
  --profile <name>    EAS build profile to use (default: production)
  --platform <value>  Platform to target: all | ios | android (default: all)
  --local             Run EAS builds locally and write artifacts to dist/mobile
  --expo-token <val>  Expo access token used for non-interactive EAS builds
  --skip-tests        Skip linting and unit tests
  --skip-backend      Skip VS Code extension packaging
  --skip-mobile       Skip mobile builds
  --help              Show this help message
USAGE
}

section() {
  printf '\n==> %s\n' "$1"
}

warn() {
  echo "!! $1"
}

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "Missing required command: $cmd" >&2
    exit 1
  fi
}

require_value() {
  local flag="$1"
  if [[ $# -lt 2 || -z "$2" ]]; then
    echo "Missing value for $flag" >&2
    usage
    exit 1
  fi
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --profile)
      require_value "$1" "${2-}"; PROFILE="$2"; shift 2;;
    --platform)
      require_value "$1" "${2-}"; PLATFORM="$2"; shift 2;;
    --local)
      LOCAL_BUILD=1; shift;;
    --expo-token)
      require_value "$1" "${2-}"; EXPO_TOKEN_ARG="$2"; shift 2;;
    --skip-tests)
      SKIP_TESTS=1; shift;;
    --skip-backend)
      SKIP_BACKEND=1; shift;;
    --skip-mobile)
      SKIP_MOBILE=1; shift;;
    --help)
      usage; exit 0;;
    *)
      echo "Unknown option: $1" >&2
      usage
      exit 1;;
  esac
done

case "$PLATFORM" in
  all|ios|android) ;;
  *)
    echo "Invalid --platform value: $PLATFORM (expected all|ios|android)" >&2
    exit 1;;
esac

if [[ -z "$PROFILE" ]]; then
  echo "Invalid --profile value: profile name cannot be empty" >&2
  exit 1
fi

if [[ -n "$EXPO_TOKEN_ARG" ]]; then
  export EXPO_TOKEN="$EXPO_TOKEN_ARG"
fi

section "Preflight checks"
for cmd in node npm npx; do
  require_cmd "$cmd"
done
if command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || warn "Corepack enable failed; falling back to global Yarn"
fi
if ! command -v yarn >/dev/null 2>&1; then
  warn "Yarn not found. Installing via corepack prepare yarn@1.22.22 --activate"
  corepack prepare yarn@1.22.22 --activate
fi

ENV_FILE="$ROOT_DIR/.env"
ENV_TEMPLATE="$ROOT_DIR/.env.example"
if [[ ! -f "$ENV_FILE" ]]; then
  if [[ ! -f "$ENV_TEMPLATE" ]]; then
    warn "Missing $ENV_TEMPLATE. Create it or copy from a template before running this script."
    exit 1
  fi
  cp "$ENV_TEMPLATE" "$ENV_FILE"
  warn "Created .env from .env.example. Update LOCAL_IP before running mobile builds."
fi
if grep -q "YOUR_COMPUTER_IP_HERE" "$ENV_FILE"; then
  warn "LOCAL_IP in .env is still a placeholder. Set it to your host IP for mobile connectivity."
fi

section "Install dependencies (Yarn workspaces)"
echo "Running: corepack yarn install"
corepack yarn install

section "Generate GraphQL artifacts"
corepack yarn codegen

if [[ "$SKIP_TESTS" -eq 0 ]]; then
  section "Lint"
  corepack yarn lint
  section "Unit tests"
  corepack yarn test
else
  warn "Skipping lint/tests as requested"
fi

if [[ "$SKIP_BACKEND" -eq 0 ]]; then
  section "Build VS Code extension backend"
  corepack yarn build:backend

  section "Package VSIX"
  bash "$ROOT_DIR/scripts/package-vsix.sh"
else
  warn "Skipping backend packaging"
fi

if [[ "$SKIP_MOBILE" -eq 0 ]]; then
  section "Build mobile binaries via EAS"
  require_cmd git
  pushd "$ROOT_DIR/apps/mobile" >/dev/null

  if [[ "$LOCAL_BUILD" -eq 0 ]]; then
    if ! npx --yes eas whoami >/dev/null 2>&1; then
      echo "Expo account not detected. Provide a token with --expo-token <value>, export EXPO_TOKEN, or run 'npx eas login' to build in the cloud." >&2
      popd >/dev/null
      exit 1
    fi
  fi

  mkdir -p "$ROOT_DIR/dist/mobile"
  EAS_CMD=(npx --yes eas build --non-interactive --profile "$PROFILE" --platform "$PLATFORM")
  if [[ "$LOCAL_BUILD" -eq 1 ]]; then
    EAS_CMD+=(--local --output-dir "$ROOT_DIR/dist/mobile")
  fi

  echo "Running: ${EAS_CMD[*]}"
  "${EAS_CMD[@]}"
  popd >/dev/null
else
  warn "Skipping mobile builds"
fi

section "Deployment artifacts"
if [[ "$SKIP_BACKEND" -eq 0 ]]; then
  echo "VSIX: $ROOT_DIR/mobile-vscode-server.vsix"
fi
if [[ "$SKIP_MOBILE" -eq 0 ]]; then
  if [[ "$LOCAL_BUILD" -eq 1 ]]; then
    echo "Local mobile build output: $ROOT_DIR/dist/mobile"
  else
    echo "Check the EAS build dashboard for remote artifacts."
  fi
fi

echo "\nAll steps completed."
