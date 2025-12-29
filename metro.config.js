const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const packagesRoot = path.resolve(projectRoot, "packages");

const config = getDefaultConfig(projectRoot);

config.watchFolders = Array.from(new Set([...(config.watchFolders || []), packagesRoot]));
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "apps/mobile/node_modules"),
];

config.resolver.extraNodeModules = new Proxy(
  {},
  { get: (_, name) => path.join(projectRoot, "node_modules", name) }
);

config.resolver.sourceExts = Array.from(new Set([...(config.resolver.sourceExts || []), "cjs", "mjs"]));

module.exports = config;
