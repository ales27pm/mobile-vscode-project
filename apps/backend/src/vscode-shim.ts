export const commands = { registerCommand: () => ({ dispose() {} }) };
export const workspace = { getConfiguration: () => ({ get: () => undefined }) };
export const window = { showInformationMessage: console.log };
export const ExtensionContext = {};
export default { commands, workspace, window };
