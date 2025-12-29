import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { pubsub } from './pubsub';
import { FS_EVENT, DEBUG_EVENT } from '../constants';
import { getGitProvider } from '../providers/gitProvider';
import { getDebugProvider } from '../providers/debugProvider';

export function getResolvers(pubsubInstance: typeof pubsub) {
  return {
    Query: {
      workspaces: () => {
        // Return list of workspaces (for simplicity, currently open workspace)
        const folders = vscode.workspace.workspaceFolders || [];
        return folders.map(folder => ({
          uri: folder.uri.toString(),
          name: path.basename(folder.uri.fsPath)
        }));
      },
      files: (_: any, args: { workspaceUri: string; directory: string }) => {
        // List files in the given directory
        const dirPath = path.join(vscode.Uri.parse(args.workspaceUri).fsPath, args.directory);
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries.map(entry => ({
          name: entry.name,
          path: path.join(args.directory, entry.name),
          isDirectory: entry.isDirectory()
        }));
      },
      search: (_: any, args: { workspaceUri: string; query: string }) => {
        // Very basic search implementation (could integrate ripgrep or VS Code search)
        const results: any[] = [];
        const baseDir = vscode.Uri.parse(args.workspaceUri).fsPath;
        function searchDir(dir: string) {
          const entries = fs.readdirSync(dir, { withFileTypes: true });
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              searchDir(fullPath);
            } else if (entry.isFile()) {
              const content = fs.readFileSync(fullPath, 'utf-8');
              const lines = content.split(/\r?\n/);
              lines.forEach((text, idx) => {
                if (text.includes(args.query)) {
                  results.push({
                    file: path.relative(baseDir, fullPath),
                    line: idx + 1,
                    text: text.trim()
                  });
                }
              });
            }
          }
        }
        searchDir(baseDir);
        return results;
      },
      gitStatus: (_: any, args: { workspaceUri: string }) => {
        const gitProvider = getGitProvider();
        return gitProvider.getStatus(vscode.Uri.parse(args.workspaceUri));
      }
    },
    Mutation: {
      openWorkspace: async (_: any, args: { path: string }) => {
        try {
          const uri = vscode.Uri.file(args.path);
          await vscode.commands.executeCommand('vscode.openFolder', uri, { forceNewWindow: false });
          return true;
        } catch (error) {
          console.error('Failed to open workspace:', error);
          return false;
        }
      },
      createFile: (_: any, args: { path: string }) => {
        fs.writeFileSync(args.path, '');
        return true;
      },
      deleteFile: (_: any, args: { path: string }) => {
        fs.rmSync(args.path, { recursive: true, force: true });
        return true;
      },
      saveFile: (_: any, args: { path: string; content: string }) => {
        fs.writeFileSync(args.path, args.content);
        return true;
      },
      executeCommand: async (_: any, args: { command: string; args: string[] }) => {
        try {
          const result = await vscode.commands.executeCommand(args.command, ...(args.args || []));
          return result ? result.toString() : 'Executed';
        } catch (err) {
          console.error('Command execution error:', err);
          return err instanceof Error ? err.message : 'Error';
        }
      }
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
