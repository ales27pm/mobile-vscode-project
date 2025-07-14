declare module 'yjs' {
    namespace Y {
        interface Doc {
            on: any;
            destroy?: () => void;
        }
    }
    const Y: any;
    export = Y;
}
declare module 'lodash.debounce' {
    const fn: any;
    export default fn;
}
declare module 'lru-cache' {
    export class LRUCache<K = any, V = any> {
        constructor(opts?: any);
        get(key: K): V | undefined;
        set(key: K, value: V): void;
        has(key: K): boolean;
    }
}
