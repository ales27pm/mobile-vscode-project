import * as fs from 'fs';
import * as path from 'path';

/**
 * Resolve and validate a relative file path within a workspace.
 * Returns the final absolute path if it is inside the workspace.
 * Throws an error if the path is invalid or attempts traversal outside
 * the workspace.
 */
export function resolveWorkspacePath(workspacePath: string, relativePath: string): string {
  const base = fs.realpathSync.native(workspacePath);

  if (!relativePath || relativePath === '.') {
    return base;
  }

  const target = path.resolve(base, relativePath);

  let finalPath: string;
  try {
    const parent = fs.realpathSync.native(path.dirname(target));
    finalPath = path.join(parent, path.basename(target));
  } catch {
    throw new Error('Invalid file path: parent directory does not exist. If creating a new file, ensure the parent directory exists.');
  }

  const normalizedBase = path.normalize(base + path.sep);
  const normalizedFinal = path.normalize(finalPath);

  if (!normalizedFinal.startsWith(normalizedBase) && normalizedFinal !== path.normalize(base)) {
    throw new Error('Path traversal attempt detected.');
  }

  return finalPath;
}
