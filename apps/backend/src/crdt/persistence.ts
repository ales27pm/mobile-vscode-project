import * as Y from 'yjs';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import debounce from 'lodash.debounce';
import { LRUCache } from 'lru-cache';

const SNAPSHOT_DIR = '.mobile-vscode-crdt-snapshots';
let snapshotDirAbs: string;

const cache = new LRUCache<string, Y.Doc>({
    max: 50,
    ttl: 1000 * 60 * 5,
    dispose: (doc: Y.Doc, key: string) => {
        const saver = debouncedSavers.get(key);
        if (saver) {
            try {
                saver.flush();
                saver.cancel();
                debouncedSavers.delete(key);
                console.debug(`[CRDT] Evicted and flushed doc: ${key}`);
            } catch (error) {
                console.error(`[CRDT] Error during saver cleanup for ${key}:`, error);
            }
        }
        if (doc && doc.destroy && typeof doc.destroy === 'function') {
            try {
                doc.destroy();
            } catch (error) {
                console.error(`[CRDT] Error destroying doc ${key}:`, error);
            }
        }
    },
});

function ensureSnapshotDirectory() {
    if (snapshotDirAbs) return;
    const storagePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath || vscode.workspace.rootPath;
    if (!storagePath) {
        console.warn('Cannot determine storage path for CRDT snapshots. Persistence will be disabled.');
        return;
    }
    snapshotDirAbs = path.join(storagePath, SNAPSHOT_DIR);
    if (!fs.existsSync(snapshotDirAbs)) {
        fs.mkdirSync(snapshotDirAbs, { recursive: true });
    }
}

const createDebouncedSave = (docId: string) => {
    return debounce(async (doc: Y.Doc) => {
        try {
            ensureSnapshotDirectory();
            if (!snapshotDirAbs) return;
            const filePath = path.join(snapshotDirAbs, `${encodeURIComponent(docId)}.yjs`);
            const state = Y.encodeStateAsUpdate(doc);
            const tempFilePath = `${filePath}.tmp`;
            await fs.promises.writeFile(tempFilePath, state);
            try {
                await fs.promises.rename(tempFilePath, filePath);
            } catch (renameError) {
                await fs.promises.unlink(tempFilePath).catch((err) => {
                    console.warn(`[CRDT] Failed to clean up temp file ${tempFilePath}:`, err);
                });
                throw renameError;
            }
        } catch (e) {
            console.error(`[CRDT] Failed to save snapshot for doc: ${docId}`, e);
            const tempFilePath = path.join(snapshotDirAbs, `${encodeURIComponent(docId)}.yjs.tmp`);
            try {
                await fs.promises.unlink(tempFilePath);
            } catch {
                // ignore
            }
        }
    }, 2000);
};

const debouncedSavers = new Map<string, ReturnType<typeof createDebouncedSave>>();

export function bindState(docName: string, ydoc: Y.Doc) {
    ensureSnapshotDirectory();
    if (!snapshotDirAbs) return;

    if (cache.has(docName)) {
        const cached = cache.get(docName);
        if (cached) {
            Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(cached));
        }
    } else {
        const docPath = path.join(snapshotDirAbs, `${encodeURIComponent(docName)}.yjs`);
        if (fs.existsSync(docPath)) {
            try {
                const state = fs.readFileSync(docPath);
                Y.applyUpdate(ydoc, state);
            } catch (e) {
                console.error(`[CRDT] Failed to load state for doc: ${docName}`, e);
            }
        }
        const docCopy = new Y.Doc();
        Y.applyUpdate(docCopy, Y.encodeStateAsUpdate(ydoc));
        cache.set(docName, docCopy);
    }

    if (!debouncedSavers.has(docName)) {
        debouncedSavers.set(docName, createDebouncedSave(docName));
    }

    const saver = debouncedSavers.get(docName)!;
    ydoc.on('update', () => {
        saver(ydoc);
        const copy = new Y.Doc();
        Y.applyUpdate(copy, Y.encodeStateAsUpdate(ydoc));
        cache.set(docName, copy);
    });
}

export function unbindState(docName: string, ydoc?: Y.Doc) {
    const saver = debouncedSavers.get(docName);
    if (saver) {
        try {
            saver.flush();
            saver.cancel();
        } catch (err) {
            console.warn(`[CRDT] Failed to flush saver for ${docName}:`, err);
        }
        debouncedSavers.delete(docName);
    }
    if (ydoc && typeof ydoc.destroy === 'function') {
        try {
            ydoc.destroy();
        } catch (err) {
            console.warn(`[CRDT] Failed to destroy doc ${docName}:`, err);
        }
    }
    cache.delete(docName);
}
