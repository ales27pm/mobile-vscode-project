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
    const fn: any;
    export default fn;
}
