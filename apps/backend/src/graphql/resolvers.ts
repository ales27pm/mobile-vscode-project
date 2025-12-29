import * as vscode from 'vscode';
import * as path from 'path';
import { pubsub } from './pubsub';
import { FS_EVENT, DEBUG_EVENT } from '../constants';
import { getGitProvider } from '../providers/gitProvider';
import { getDebugProvider } from '../providers/debugProvider';

type ResolverContext = unknown;

const isDirectoryType = (type: number) => (type & vscode.FileType.Directory) === vscode.FileType.Directory;

const toWorkspacePath = (workspaceUri: string, relativePath: string) =>
  vscode.Uri.file(path.posix.join(vscode.Uri.parse(workspaceUri).fsPath, relativePath));

async function listDirectoryEntries(workspaceUri: string, relativePath: string) {
  const dirUri = toWorkspacePath(workspaceUri, relativePath);
  const entries = await vscode.workspace.fs.readDirectory(dirUri);
  return entries.map(([name, type]) => {
    const entryPath = path.posix.join(relativePath, name);
    const isDirectory = isDirectoryType(type);
    return {
      name,
      path: entryPath,
      type: isDirectory ? 'directory' : 'file',
      isDirectory,
      size: 0,
      mtimeMs: 0
    };
  });
}

async function readFileFromWorkspace(workspaceUri: string, filePath: string, encoding: BufferEncoding = 'utf8') {
  const fileUri = toWorkspacePath(workspaceUri, filePath);
  const content = await vscode.workspace.fs.readFile(fileUri);
  return {
    path: filePath,
    content: Buffer.from(content).toString(encoding),
    encoding
  };
}

async function searchWorkspace(workspaceUri: string, query: string, limit: number) {
  const results: { path: string; line: number; preview: string }[] = [];
  const basePath = vscode.Uri.parse(workspaceUri).fsPath;

  async function walk(relativePath: string) {
    if (results.length >= limit) return;
    const dirUri = toWorkspacePath(workspaceUri, relativePath);
    const entries = await vscode.workspace.fs.readDirectory(dirUri);

    for (const [name, type] of entries) {
      if (results.length >= limit) break;
      const nextRelativePath = path.posix.join(relativePath, name);
      if (isDirectoryType(type)) {
        await walk(nextRelativePath);
      } else {
        const fileUri = toWorkspacePath(workspaceUri, nextRelativePath);
        const data = await vscode.workspace.fs.readFile(fileUri);
        const content = Buffer.from(data).toString('utf8');
        const lines = content.split(/\r?\n/);
        lines.forEach((text, idx) => {
          if (results.length >= limit) return;
          if (text.includes(query)) {
            results.push({
              path: path.posix.relative(basePath, fileUri.fsPath),
              line: idx + 1,
              preview: text.trim()
            });
          }
        });
      }
    }
  }

  await walk('');
  return results;
}

export function getResolvers(pubsubInstance: typeof pubsub = pubsub) {
  const gitProvider = getGitProvider();
  const debugProvider = getDebugProvider();

  return {
    Query: {
      listWorkspaces: (_: ResolverContext) => {
        const folders = vscode.workspace.workspaceFolders || [];
        return folders.map(folder => ({
          uri: folder.uri.toString(),
          name: path.basename(folder.uri.fsPath)
        }));
      },
      listDirectory: async (_: ResolverContext, args: { workspaceUri: string; path: string }) =>
        listDirectoryEntries(args.workspaceUri, args.path),
      readFile: async (_: ResolverContext, args: { workspaceUri: string; path: string; encoding?: BufferEncoding }) =>
        readFileFromWorkspace(args.workspaceUri, args.path, args.encoding ?? 'utf8'),
      search: async (_: ResolverContext, args: { workspaceUri: string; query: string; limit: number }) =>
        searchWorkspace(args.workspaceUri, args.query, args.limit),
      ...gitProvider.Query,
      ...debugProvider.Query
    },
    Mutation: {
      writeFile: async (
        _: ResolverContext,
        args: { workspaceUri: string; path: string; content: string; encoding: BufferEncoding }
      ) => {
        const targetUri = toWorkspacePath(args.workspaceUri, args.path);
        await vscode.workspace.fs.writeFile(targetUri, Buffer.from(args.content, args.encoding));
        return { ok: true };
      },
      ...gitProvider.Mutation,
      ...debugProvider.Mutation
    },
    Subscription: {
      fileChange: {
        subscribe: () => pubsubInstance.asyncIterator([FS_EVENT])
      },
      debugEvent: {
        subscribe: () => pubsubInstance.asyncIterator([DEBUG_EVENT])
      }
    }
  };
}
