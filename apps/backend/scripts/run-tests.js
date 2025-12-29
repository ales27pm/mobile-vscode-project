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
const hasExplicitWorkerSetting = forwardedArgs.some(arg => arg === '--runInBand' || arg.startsWith('--maxWorkers'));

if (!hasExplicitWorkerSetting) {
  forwardedArgs.unshift('--runInBand');
}

const jestBin = path.join(repoRoot, 'node_modules', '.bin', 'jest');
const nodeOptions = (process.env.NODE_OPTIONS ?? '').split(/\s+/).filter(Boolean);
const localStorageOption = `--localstorage-file=${path.join(workspaceRoot, '.jest-localstorage')}`;
const sanitizedOptions = nodeOptions.filter(option => option !== '--localstorage-file=' && option !== '--localstorage-file');
const hasLocalStorageOption = sanitizedOptions.some(option => option === localStorageOption);
const env = {
  ...process.env,
  NODE_OPTIONS: hasLocalStorageOption
    ? sanitizedOptions.join(' ')
    : [...sanitizedOptions, localStorageOption].join(' '),
};

const result = spawnSync(jestBin, forwardedArgs, {
  cwd: workspaceRoot,
  env,
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error);
}

process.exit(result.status ?? 1);
