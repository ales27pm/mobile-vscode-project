import * as vscode from "vscode";

export type ExtensionsProvider = {
  listInstalled: () => Promise<
    Array<{
      id: string;
      version: string;
      installed: boolean;
      isActive: boolean;
      extensionKind?: string;
    }>
  >;
  install: (id: string) => Promise<boolean>;
  uninstall: (id: string) => Promise<boolean>;
};

function extensionKindToString(kind: vscode.ExtensionKind | undefined): string | undefined {
  if (kind === undefined) return undefined;
  // vscode.ExtensionKind is an enum; stringify to stable text
  switch (kind) {
    case vscode.ExtensionKind.UI:
      return "UI";
    case vscode.ExtensionKind.Workspace:
      return "Workspace";
    default:
      return String(kind);
  }
}

export function getExtensionsProvider(_context?: vscode.ExtensionContext): ExtensionsProvider {
  return {
    async listInstalled() {
      return vscode.extensions.all.map((ext) => ({
        id: ext.id,
        version: (ext.packageJSON?.version as string | undefined) ?? "0.0.0",
        installed: true,
        isActive: ext.isActive,
        extensionKind: extensionKindToString(ext.extensionKind),
      }));
    },
    async install(id) {
      try {
        await vscode.commands.executeCommand("workbench.extensions.installExtension", id);
        return true;
      } catch (error) {
        console.error("Failed to install extension", id, error);
        return false;
      }
    },
    async uninstall(id) {
      try {
        await vscode.commands.executeCommand("workbench.extensions.uninstallExtension", id);
        return true;
      } catch (error) {
        console.error("Failed to uninstall extension", id, error);
        return false;
      }
    }
  };
}
