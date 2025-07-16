/* eslint-disable @typescript-eslint/no-explicit-any */
declare module 'yjs' {
    namespace Y {
        interface Doc {
            on(event: string, listener: (...args: any[]) => void): void;
            destroy(): void;
        }
    }
    const Y: any;
    export = Y;
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
