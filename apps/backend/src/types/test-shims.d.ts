declare module 'yjs' {
    namespace Y {
        interface Doc {
            on: any;
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
