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
