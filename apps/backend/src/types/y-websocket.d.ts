declare module 'y-websocket/bin/utils.js' {
    import { IncomingMessage } from 'http';
    import { WebSocket } from 'ws';
    import * as Y from 'yjs';

    export type Doc = Y.Doc;

    export interface Persistence {
        bindState: (docName: string, ydoc: Doc) => void | Promise<void>;
        writeState: (docName: string, ydoc: Doc) => void | Promise<void>;
        provider?: any;
    }

    export function setPersistence(p: Persistence): void;
    export function setupWSConnection(socket: WebSocket, req: IncomingMessage): void;
}
