import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { pubsub } from './pubsub';
import { getGitProvider } from '../providers/gitProvider';
import { getDebugProvider } from '../providers/debugProvider';

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

const gitProvider = getGitProvider();
const debugProvider = getDebugProvider();

const resolvers = {
        Query: {
            listWorkspaces: () => {
                return vscode.workspace.workspaceFolders?.map(f => ({ name: f.name, uri: f.uri.toString() })) ?? [];
            },
            listDirectory: async (_: unknown, { workspaceUri, path = '' }: { workspaceUri: string; path?: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const directoryUri = getValidatedUri(workspace, path);
                const items = await vscode.workspace.fs.readDirectory(directoryUri);
                return items.map(([name, type]) => ({
                    name,
                    path: `${path ? path + '/' : ''}${name}`,
                    isDirectory: type === vscode.FileType.Directory,
                }));
            },
            readFile: async (_: unknown, { workspaceUri, path }: { workspaceUri: string; path: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const fileUri = getValidatedUri(workspace, path);
                const content = await vscode.workspace.fs.readFile(fileUri);
                return content.toString();
            },
            search: async (_: unknown, { workspaceUri, query }: { workspaceUri: string; query: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const results: { file: string; line: number; text: string }[] = [];
                const workspaceWithSearch = vscode.workspace as unknown as {
                    findTextInFiles: (
                        query: { pattern: string },
                        opts: { include: vscode.RelativePattern; exclude: string },
                        onResult: (result: { uri: vscode.Uri; ranges: vscode.Range[]; preview: { text: string } }) => void
                    ) => void;
                };
                await workspaceWithSearch.findTextInFiles(
                    { pattern: query },
                    { include: new vscode.RelativePattern(workspace, '**/*'), exclude: '**/node_modules/**' },
                    (result) => {
                        if ('preview' in result && result.ranges && result.ranges.length > 0) {
                            results.push({
                                file: vscode.workspace.asRelativePath(result.uri, false),
                                line: result.ranges[0].start.line + 1,
                                text: result.preview.text.trim(),
                            });
                        }
                    }
                );
                return results;
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
            },
            ...gitProvider.Query,
            ...debugProvider.Query,
        },
        Mutation: {
            writeFile: async (_: unknown, { workspaceUri, path, content }: { workspaceUri: string; path: string; content: string }) => {
                const workspace = getWorkspace(workspaceUri);
                const fileUri = getValidatedUri(workspace, path);
                const newContent = Buffer.from(content, 'utf-8');
                await vscode.workspace.fs.writeFile(fileUri, newContent);
                return true;
            },
            installExtension: async (_: unknown, { id }: { id: string }) => {
                try {
                    await vscode.commands.executeCommand('workbench.extensions.installExtension', id);
                    return true;
                } catch (err) {
                    console.error(err);
                    return false;
                }
            },
            uninstallExtension: async (_: unknown, { id }: { id: string }) => {
                try {
                    await vscode.commands.executeCommand('workbench.extensions.uninstallExtension', id);
                    return true;
                } catch (err) {
                    console.error(err);
                    return false;
                }
            },
            ...gitProvider.Mutation,
            ...debugProvider.Mutation,
        },
        Subscription: {
            fsEvent: {
                subscribe: () => pubsub.asyncIterator(['FS_EVENT']),
            },
            debuggerEvent: {
                subscribe: () => pubsub.asyncIterator(['DEBUG_EVENT']),
            },
        },
    };

export function getResolvers() {
    return resolvers;
}
