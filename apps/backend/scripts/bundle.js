/* eslint-disable no-console */
// Bundles the extension + server into a single file so vsce can package with --no-dependencies.
// This avoids monorepo hoisting paths like ../../node_modules leaking into the VSIX.
const path = require('path');
const fs = require('fs');
const { build } = require('esbuild');

const root = path.resolve(__dirname, '..');
const entry = path.join(root, 'src', 'extension.ts');
const outFile = path.join(root, 'dist', 'extension.bundle.js');

async function main() {
  if (!fs.existsSync(entry)) {
    throw new Error(`Entry not found: ${entry}`);
  }

  await build({
    entryPoints: [entry],
    outfile: outFile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    target: ['node18'],
    // vscode is provided by the host.
    external: ['vscode'],
    // Some optional native deps should not break bundling.
    logLevel: 'info',
  });

  console.log(`[bundle] wrote ${path.relative(root, outFile)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
