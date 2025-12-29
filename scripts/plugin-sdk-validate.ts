import fs from 'fs';
import path from 'path';

interface CommandContribution {
  command: string;
  title: string;
}

interface PluginPackageJson {
  name?: string;
  displayName?: string;
  publisher?: string;
  version?: string;
  main?: string;
  engines?: {
    vscode?: string;
  };
  activationEvents?: string[];
  contributes?: {
    commands?: CommandContribution[];
  };
}

const workspaceRoot = path.resolve(__dirname, '..');
const extensionRoot = path.join(workspaceRoot, 'apps', 'backend');
const packageJsonPath = path.join(extensionRoot, 'package.json');

function loadPackageJson(): PluginPackageJson {
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error(`Missing VS Code extension package.json at ${packageJsonPath}`);
  }

  const raw = fs.readFileSync(packageJsonPath, 'utf8');
  return JSON.parse(raw) as PluginPackageJson;
}

function ensureString(value: unknown, field: string, errors: string[]): void {
  if (typeof value !== 'string' || value.trim().length === 0) {
    errors.push(`${field} must be a non-empty string`);
  }
}

function validateEntryPoint(pkg: PluginPackageJson, errors: string[]): void {
  ensureString(pkg.main, 'main', errors);
  if (!pkg.main) return;

  const mainPath = path.join(extensionRoot, pkg.main);
  const hasMain = fs.existsSync(mainPath);

  const tsFallback = path.join(extensionRoot, 'src', 'extension.ts');
  const hasFallback = fs.existsSync(tsFallback);

  if (!hasMain && !hasFallback) {
    errors.push(`Entry point not found. Expected ${mainPath} or ${tsFallback}`);
    return;
  }

  if (!hasMain && hasFallback) {
    console.warn(`Warning: ${pkg.main} is missing; build output will be required before publishing.`);
  }
}

function validateActivationEvents(pkg: PluginPackageJson, errors: string[]): void {
  if (!pkg.activationEvents || pkg.activationEvents.length === 0) {
    errors.push('activationEvents must include at least one command-based trigger');
    return;
  }

  const commandEvents = pkg.activationEvents.filter((event) => event.startsWith('onCommand:'));
  if (commandEvents.length === 0) {
    errors.push('activationEvents should include onCommand:* entries to align with contributed commands');
  }

  const contributedCommands = new Set((pkg.contributes?.commands ?? []).map((cmd) => cmd.command));
  const missingCommands = commandEvents.filter((event) => {
    const commandId = event.replace('onCommand:', '');
    return !contributedCommands.has(commandId);
  });

  if (missingCommands.length > 0) {
    errors.push(`activationEvents reference commands that are not contributed: ${missingCommands.join(', ')}`);
  }
}

function validateCommands(pkg: PluginPackageJson, errors: string[]): void {
  const commands = pkg.contributes?.commands ?? [];
  if (commands.length === 0) {
    errors.push('contributes.commands must declare at least one command');
    return;
  }

  commands.forEach((cmd, index) => {
    ensureString(cmd.command, `contributes.commands[${index}].command`, errors);
    ensureString(cmd.title, `contributes.commands[${index}].title`, errors);
  });
}

function main(): void {
  const pkg = loadPackageJson();
  const errors: string[] = [];

  ensureString(pkg.name, 'name', errors);
  ensureString(pkg.displayName, 'displayName', errors);
  ensureString(pkg.publisher, 'publisher', errors);
  ensureString(pkg.version, 'version', errors);
  ensureString(pkg.engines?.vscode, 'engines.vscode', errors);

  validateEntryPoint(pkg, errors);
  validateCommands(pkg, errors);
  validateActivationEvents(pkg, errors);

  if (errors.length > 0) {
    console.error('Plugin SDK validation failed:\n - ' + errors.join('\n - '));
    process.exit(1);
  }

  console.log('Plugin SDK validation passed for', pkg.name);
}

main();
