import * as ExpoCrypto from "expo-crypto";

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array;

function fillWithMathRandom(arr: Uint8Array) {
  for (let i = 0; i < arr.length; i++) arr[i] = (Math.random() * 256) | 0;
}

function asUint8Array(view: TypedArray): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

(function ensureCrypto() {
  const g: any = globalThis as any;
  if (!g.crypto) g.crypto = {};

  if (typeof g.crypto.getRandomValues !== "function") {
    g.crypto.getRandomValues = <T extends TypedArray>(arr: T): T => {
      const u8 = asUint8Array(arr);

      try {
        // Expo currently has async APIs; keep this hook in case sync is added.
        // @ts-expect-error
        if (typeof (ExpoCrypto as any).getRandomBytes === "function") {
          // @ts-expect-error
          const bytes: Uint8Array = (ExpoCrypto as any).getRandomBytes(u8.length);
          u8.set(bytes);
          return arr;
        }
      } catch {}

      fillWithMathRandom(u8);
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn("[crypto polyfill] Using Math.random() fallback for getRandomValues().");
      }
      return arr;
    };
  }
})();
