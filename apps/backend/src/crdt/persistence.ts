import * as Y from 'yjs';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import debounce from 'lodash.debounce';

const SNAPSHOT_DIR = '.mobile-vscode-crdt-snapshots';
let snapshotDirAbs: string;

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
                await fs.promises.unlink(tempFilePath).catch(() => undefined);
                throw renameError;
            }
            console.log(`[CRDT] Persisted snapshot for doc: ${docId}`);
        } catch (e) {
            console.error(`[CRDT] Failed to save snapshot for doc: ${docId}`, e);
            // Clean up temp file if it exists
            const tempFilePath = path.join(snapshotDirAbs, `${encodeURIComponent(docId)}.yjs.tmp`);
            try {
                await fs.promises.unlink(tempFilePath);
            } catch {
                // ignore cleanup errors
            }
        }
    }, 2000);
};

const debouncedSavers = new Map<string, ReturnType<typeof createDebouncedSave>>();

export function bindState(docName: string, ydoc: Y.Doc) {
    ensureSnapshotDirectory();
    if (!snapshotDirAbs) return;

    const docPath = path.join(snapshotDirAbs, `${encodeURIComponent(docName)}.yjs`);

    if (fs.existsSync(docPath)) {
        try {
            const state = fs.readFileSync(docPath);
            Y.applyUpdate(ydoc, state);
            console.log(`[CRDT] Loaded state for doc: ${docName}`);
        } catch (e) {
            console.error(`[CRDT] Failed to load state for doc: ${docName}`, e);
        }
    }

    if (!debouncedSavers.has(docName)) {
        debouncedSavers.set(docName, createDebouncedSave(docName));
    }

    const saver = debouncedSavers.get(docName)!;
    ydoc.on('update', () => saver(ydoc));
}

export function unbindState(docName: string) {
    const saver = debouncedSavers.get(docName);
    if (saver) {
        saver.flush();
        saver.cancel();
        debouncedSavers.delete(docName);
    }
}
