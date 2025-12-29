export const commands = {
  registerCommand: () => ({
    dispose() {
      // No-op shim to satisfy the VS Code API surface in tests.
      return undefined;
    },
  }),
};
export const workspace = { getConfiguration: () => ({ get: () => undefined }) };
export const window = { showInformationMessage: console.log };
export const ExtensionContext = {};
export default { commands, workspace, window };
