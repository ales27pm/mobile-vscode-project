import { resolveWorkspacePath } from './path';
import * as fs from 'fs';
import * as path from 'path';

describe('resolveWorkspacePath', () => {
  const workspace = fs.mkdtempSync(path.join(fs.realpathSync.native('/tmp'), 'ws-'));
  afterAll(() => fs.rmSync(workspace, { recursive: true, force: true }));

  it('resolves a valid file path inside the workspace', () => {
    const file = path.join(workspace, 'file.txt');
    fs.writeFileSync(file, 'data');
    const result = resolveWorkspacePath(workspace, 'file.txt');
    expect(result).toBe(file);
  });

  it('rejects path traversal attempts', () => {
    expect(() => resolveWorkspacePath(workspace, '../outside.txt')).toThrow();
  });
});
