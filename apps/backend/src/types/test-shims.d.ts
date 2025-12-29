/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'yjs' {
    export class Text {
        length: number;
        insert(index: number, content: string): void;
        toString(): string;
    }
    export class Doc {
        on(event: string, listener: (...args: any[]) => void): void;
        destroy(): void;
        getText(name: string): Text;
    }
    export function encodeStateAsUpdate(doc: Doc): Uint8Array;
    export function applyUpdate(doc: Doc, update: Uint8Array): void;
}
declare module 'graphql-ws/use/ws' {
    export * from 'graphql-ws/dist/use/ws';
}
declare module 'lodash.debounce' {
    export interface DebouncedFunc<T extends (...args: any[]) => any> {
        (...args: Parameters<T>): void;
        cancel(): void;
        flush(): void;
    }
    export default function debounce<T extends (...args: any[]) => any>(
        func: T,
        wait?: number
    ): DebouncedFunc<T>;
}
declare module 'lru-cache' {
    export class LRUCache<K = unknown, V = unknown> {
        constructor(opts?: unknown);
        get(key: K): V | undefined;
        set(key: K, value: V): void;
        has(key: K): boolean;
        delete(key: K): void;
    }
}
