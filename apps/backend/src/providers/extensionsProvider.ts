import * as vscode from "vscode";

export type ExtensionsProvider = {
  listInstalled: () => Promise<
    Array<{
      id: string;
      version: string;
      isActive: boolean;
      extensionKind?: string;
    }>
  >;
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

export function getExtensionsProvider(_context: vscode.ExtensionContext): ExtensionsProvider {
  return {
    async listInstalled() {
      return vscode.extensions.all.map((ext) => ({
        id: ext.id,
        version: (ext.packageJSON?.version as string | undefined) ?? "0.0.0",
        isActive: ext.isActive,
        extensionKind: extensionKindToString(ext.extensionKind),
      }));
    },
  };
}
