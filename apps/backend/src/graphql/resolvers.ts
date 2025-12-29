import * as vscode from 'vscode';
import * as path from 'path';
import { pubsub } from './pubsub';
import { FS_EVENT, DEBUG_EVENT } from '../constants';
import { getGitProvider } from '../providers/gitProvider';
import { getDebugProvider } from '../providers/debugProvider';
import { getExtensionsProvider } from '../providers/extensionsProvider';

type ResolverContext = unknown;

const isDirectoryType = (type: number) => (type & vscode.FileType.Directory) === vscode.FileType.Directory;

const toWorkspacePath = (workspaceUri: string, relativePath: string) => {
  const workspace = vscode.Uri.parse(workspaceUri);
  const segments = relativePath.split(/[\\/]+/).filter(Boolean);
  return vscode.Uri.joinPath(workspace, ...segments);
};

const toPosixPath = (p: string) => p.split(path.sep).join(path.posix.sep);

const shouldSkipDirectory = (name: string) => name === 'node_modules' || name.startsWith('.');

const MAX_SEARCH_FILE_SIZE = 1024 * 1024; // 1MB

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
        if (shouldSkipDirectory(name)) {
          continue;
        }
        await walk(nextRelativePath);
      } else {
        const fileUri = toWorkspacePath(workspaceUri, nextRelativePath);
        try {
          const stat = await vscode.workspace.fs.stat(fileUri);
          if (stat.size > MAX_SEARCH_FILE_SIZE) {
            continue;
          }

          const data = await vscode.workspace.fs.readFile(fileUri);
          const content = Buffer.from(data).toString('utf8');
          const lines = content.split(/\r?\n/);
          lines.forEach((text, idx) => {
            if (results.length >= limit) return;
            if (text.includes(query)) {
              results.push({
                path: toPosixPath(path.relative(basePath, fileUri.fsPath)),
                line: idx + 1,
                preview: text.trim()
              });
            }
          });
        } catch {
          // Skip files that cannot be read (binary, permissions, etc.)
          continue;
        }
      }
    }
  }

  await walk('');
  return results;
}

export function getResolvers(pubsubInstance: typeof pubsub = pubsub) {
  const gitProvider = getGitProvider();
  const debugProvider = getDebugProvider();
  const extensionsProvider = getExtensionsProvider();

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
      ...debugProvider.Query,
      extensions: () => extensionsProvider.listInstalled(),
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
      ...debugProvider.Mutation,
      pairWithServer: () => {
        throw new Error('pairWithServer is handled by middleware');
      },
      installExtension: (_: ResolverContext, { id }: { id: string }) => extensionsProvider.install(id),
      uninstallExtension: (_: ResolverContext, { id }: { id: string }) => extensionsProvider.uninstall(id)
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
