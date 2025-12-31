const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const packagesRoot = path.resolve(projectRoot, "packages");
const sharedSrc = path.resolve(projectRoot, "packages/shared/src");

const config = getDefaultConfig(projectRoot);

const defaultWatchFolders = config.watchFolders || [];
config.watchFolders = Array.from(new Set([...defaultWatchFolders, packagesRoot]));
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(projectRoot, "apps/mobile/node_modules"),
];

config.resolver.disableHierarchicalLookup = false;
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  shared: sharedSrc,
};
config.resolver.extraNodeModules = new Proxy(
  {},
  { get: (_, name) => path.join(projectRoot, "node_modules", name) }
);

config.resolver.sourceExts = Array.from(new Set([...(config.resolver.sourceExts || []), "cjs", "mjs"]));

module.exports = config;
