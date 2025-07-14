import * as vscode from 'vscode';
import simpleGit from 'simple-git';
import { pubsub } from './pubsub';
import { resolveWorkspacePath } from 'shared/utils/path';

const getWorkspace = (uri: string): vscode.WorkspaceFolder => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(uri));
    if (!workspaceFolder) {
        throw new Error(`Workspace with URI ${uri} not found.`);
    }
    return workspaceFolder;
};

const getValidatedUri = (workspace: vscode.WorkspaceFolder, relativePath: string): vscode.Uri => {
    const finalPath = resolveWorkspacePath(workspace.uri.fsPath, relativePath);
    return vscode.Uri.file(finalPath);
};

export function getResolvers() {
    return {
        Query: {
            listWorkspaces: () => {
                return vscode.workspace.workspaceFolders?.map(f => ({ name: f.name, uri: f.uri.toString() })) ?? [];
            },
            listDirectory: async (_: any, { workspaceUri, path = '' }: { workspaceUri: string, path?: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const directoryUri = getValidatedUri(workspace, path);
                const items = await vscode.workspace.fs.readDirectory(directoryUri);
                return items.map(([name, type]) => ({
                    name,
                    path: `${path ? path + '/' : ''}${name}`,
                    isDirectory: type === vscode.FileType.Directory,
                }));
            },
            readFile: async (_: any, { workspaceUri, path }: { workspaceUri: string, path: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const fileUri = getValidatedUri(workspace, path);
                const content = await vscode.workspace.fs.readFile(fileUri);
                return content.toString();
            },
            search: async (_: any, { workspaceUri, query }: { workspaceUri: string, query: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const results: { file: string; line: number; text: string }[] = [];
                const searchFn = (vscode.workspace as any).findTextInFiles;
                if (typeof searchFn !== 'function') {
                    throw new Error('findTextInFiles method not available in current VSCode API version');
                }
                const versionParts = vscode.version.split('.').slice(0, 2).map(part => {
                  const cleaned = part.replace(/[^\d]/g, '');
                  const num = parseInt(cleaned, 10);
                  if (isNaN(num) || cleaned === '') {
                    throw new Error(`Invalid VSCode version format: ${vscode.version}`);
                  }
                  return num;
                });
                // Use feature detection instead of version comparison
                const useCallbackApi = searchFn.length >= 3; // Callback API has 3+ parameters

                // Use feature detection instead of version comparison
                const useCallbackApi = searchFn.length >= 3; // Callback API has 3+ parameters
                const [major = 0, minor = 0] = versionParts;

                if (useCallbackApi) {
                    await new Promise<void>((resolve) => {
                        searchFn(
                            { pattern: query },
                            { include: new vscode.RelativePattern(workspace, '**/*'), exclude: '**/node_modules/**' },
                            (result: any) => {
                                if ('preview' in result && result.ranges && result.ranges.length > 0) {
                                    results.push({
                                        file: vscode.workspace.asRelativePath(result.uri, false),
                                        line: result.ranges[0].start.line + 1,
                                        text: result.preview.text.trim(),
                                    });
                                }
                            },
                            () => resolve()
                        );
                    });
                } else {
                    const searchResults = await searchFn(
                        { pattern: query, isCaseSensitive: false, isRegExp: false, isWordMatch: false },
                        { include: new vscode.RelativePattern(workspace, '**/*'), exclude: '**/node_modules/**' }
                    );
                    for (const uri in searchResults) {
                        const fileUri = vscode.Uri.parse(uri);
                        const relativePath = vscode.workspace.asRelativePath(fileUri, false);
                        searchResults[uri].forEach((match: any) => {
                            results.push({
                                file: relativePath,
                                line: match.range.start.line + 1,
                                text: match.preview.text.trim(),
                            });
                        });
                    }
                }

                return results;
            },
            gitStatus: async (_: any, { workspaceUri }: { workspaceUri: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const git = simpleGit(workspace.uri.fsPath);
                if (!(await git.checkIsRepo())) return { branch: 'Not a Git repository', changes: [] };
                const s = await git.status();
                return {
                    branch: s.current || 'detached',
                    changes: s.files.map(f => `${f.path} (${f.working_dir})`),
                };
            },
            extensions: () => {
                 return vscode.extensions.all
                    .filter(ext => !ext.id.startsWith('vscode.') && !ext.id.startsWith('ms-vscode.'))
                    .map(ext => ({
                        id: ext.id,
                        name: ext.packageJSON.displayName || ext.packageJSON.name,
                        description: ext.packageJSON.description,
                        installed: true,
                    }));
            }
        },
        Mutation: {
            writeFile: async (_: any, { workspaceUri, path, content }: { workspaceUri: string, path: string; content: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const fileUri = getValidatedUri(workspace, path);
                const newContent = Buffer.from(content, 'utf-8');
                await vscode.workspace.fs.writeFile(fileUri, newContent);
                return true;
            },
            commit: async (_: any, { workspaceUri, message }: { workspaceUri: string, message: string }) => {
              const workspace = getWorkspace(workspaceUri);
              await simpleGit(workspace.uri.fsPath).add('.').commit(message);
              return true;
            },
            push: async (_: any, { workspaceUri }: { workspaceUri: string }) => {
              const workspace = getWorkspace(workspaceUri);
              await simpleGit(workspace.uri.fsPath).push();
              return true;
            },
            installExtension: async (_: any, { id }: { id: string }) => {
                try {
                    await vscode.commands.executeCommand('workbench.extensions.installExtension', id);
                    return true;
                } catch (err) {
                    console.error(err);
                    return false;
                }
            },
            uninstallExtension: async (_: any, { id }: { id: string }) => {
                try {
                    await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', id);
                    return true;
                } catch (err) {
                    console.error(err);
                    return false;
                }
            }
        },
        Subscription: {
            fsEvent: {
                subscribe: () => pubsub.asyncIterator(['FS_EVENT']),
            },
        },
    };
}
