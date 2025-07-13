import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import simpleGit from 'simple-git';
import { pubsub } from './pubsub';

const getWorkspace = (uri: string): vscode.WorkspaceFolder => {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.Uri.parse(uri));
    if (!workspaceFolder) {
        throw new Error(`Workspace with URI ${uri} not found.`);
    }
    return workspaceFolder;
};

const getValidatedUri = (workspace: vscode.WorkspaceFolder, relativePath: string): vscode.Uri => {
    const workspacePath = fs.realpathSync.native(workspace.uri.fsPath);
    const targetPath = path.resolve(workspacePath, relativePath);

    let finalPath: string;
    try {
        const parent = fs.realpathSync.native(path.dirname(targetPath));
        finalPath = path.join(parent, path.basename(targetPath));
    } catch {
        throw new Error('Invalid file path or path does not exist.');
    }

    if (!finalPath.startsWith(workspacePath + path.sep) && finalPath !== workspacePath) {
        throw new Error('Path traversal attempt detected.');
    }

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
                await (vscode.workspace as any).findTextInFiles(
                    { pattern: query },
                    { include: new vscode.RelativePattern(workspace, '**/*'), exclude: '**/node_modules/**' },
                    (result: any) => {
                        if ('preview' in result) {
                            results.push({
                                file: vscode.workspace.asRelativePath(result.uri, false),
                                line: result.ranges[0].start.line + 1,
                                text: result.preview.text.trim()
                            });
                        }
                    }
                );
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
