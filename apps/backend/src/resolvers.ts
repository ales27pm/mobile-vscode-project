import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import simpleGit from 'simple-git';
import { pubsub } from './pubsub';
import { ROOT_DIR } from '../config';

const marketplacePath = path.join(__dirname, '../marketplace.json');
const installedPath = path.join(ROOT_DIR, 'installed.json');

async function getInstalledExts(): Promise<Set<string>> {
  try {
    const data = await fs.readFile(installedPath, 'utf8');
    return new Set(JSON.parse(data));
  } catch {
    await setInstalledExts(new Set());
    return new Set();
  }
}

async function setInstalledExts(ids: Set<string>): Promise<void> {
  await fs.writeFile(installedPath, JSON.stringify(Array.from(ids)));
}

const validatePath = (p: string) => {
  const resolved = path.resolve(ROOT_DIR, p);
  if (!resolved.startsWith(ROOT_DIR)) {
    throw new Error('Path traversal attempt detected');
  }
  if (resolved.includes('..')) {
    throw new Error('Invalid path sequence ".." detected');
  }
  return resolved;
};

export default () => ({
  Query: {
    listDirectory: async (_: any, { path: relPath = '' }: { path?: string }) => {
      const fullPath = validatePath(relPath);
      const items = await fs.readdir(fullPath, { withFileTypes: true });
      return items.map(d => ({ name: d.name, path: path.join(relPath, d.name), isDirectory: d.isDirectory() }));
    },
    readFile: (_: any, { path: relPath }: { path: string }) => {
      const fullPath = validatePath(relPath);
      return fs.readFile(fullPath, 'utf-8');
    },
    search: (_: any, { query }: { query: string }) => new Promise((res, rej) => {
      const rg = spawn('rg', ['--json', query, ROOT_DIR]);
      let out = '';
      rg.stdout.on('data', c => out += c);
      rg.on('close', () => {
        const hits = out.split('
').filter(Boolean).map(l => {
          const o = JSON.parse(l);
          return o.type === 'match' ? { file: o.data.path.text, line: o.data.line_number, text: o.data.lines.text.trim() } : null;
        }).filter(Boolean);
        res(hits);
      });
      rg.on('error', rej);
    }),
    gitStatus: async () => {
      const git = simpleGit(ROOT_DIR);
      if (!(await git.checkIsRepo())) return { branch: 'Not a repo', changes: [] };
      const s = await git.status();
      return { branch: s.current || 'detached', changes: [...s.modified, ...s.not_added, ...s.created, ...s.deleted] };
    },
    extensions: async () => {
      const [all, installed] = await Promise.all([fs.readFile(marketplacePath, 'utf8'), getInstalledExts()]);
      return JSON.parse(all).map((ext: any) => ({ ...ext, installed: installed.has(ext.id) }));
    },
  },
  Mutation: {
    writeFile: async (_: any, { path: relPath, content }: { path: string; content: string }) => {
        const fullPath = validatePath(relPath);
        await fs.writeFile(fullPath, content, 'utf-8');
        return true;
    },
    commit: async (_: any, { message }: { message: string }) => {
      await simpleGit(ROOT_DIR).add('.').commit(message);
      return true;
    },
    push: async () => {
      await simpleGit(ROOT_DIR).push();
      return true;
    },
    installExtension: async (_: any, { id }: { id: string }) => {
      if (!/^[\w-]+\.[\w-]+$/.test(id)) throw new Error('Invalid extension ID');
      const installed = await getInstalledExts();
      installed.add(id);
      await setInstalledExts(installed);
      return true;
    },
    uninstallExtension: async (_: any, { id }: { id: string }) => {
      const installed = await getInstalledExts();
      installed.delete(id);
      await setInstalledExts(installed);
      return true;
    }
  },
  Subscription: {
    fsEvent: { subscribe: () => pubsub.asyncIterator(['FS_EVENT']) }
  }
});
