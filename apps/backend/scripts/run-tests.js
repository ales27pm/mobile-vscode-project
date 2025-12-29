/* eslint-disable no-console */
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const workspaceRoot = path.resolve(__dirname, '..');

function normalizeArg(arg) {
  const normalized = arg.replace(/\\/g, '/');
  if (normalized.startsWith('apps/backend/')) {
    return path.resolve(repoRoot, normalized);
  }
  if (normalized.startsWith('./apps/backend/')) {
    return path.resolve(repoRoot, normalized.slice(2));
  }
  return arg;
}

const forwardedArgs = process.argv.slice(2).map(normalizeArg);

const jestBin = path.join(repoRoot, 'node_modules', '.bin', 'jest');
const result = spawnSync(jestBin, forwardedArgs, {
  cwd: workspaceRoot,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
