import * as ExpoCrypto from "expo-crypto";

type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array;

type CryptoWithRandomValues = {
  getRandomValues?: <T extends TypedArray>(array: T) => T;
};

type GlobalWithCrypto = typeof globalThis & { crypto?: CryptoWithRandomValues };

function asUint8Array(view: TypedArray): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

function fillWithMathRandom(u8: Uint8Array): void {
  for (let i = 0; i < u8.length; i++) {
    u8[i] = (Math.random() * 256) | 0;
  }
}

function tryFillFromExpoSync(u8: Uint8Array): boolean {
  if (typeof ExpoCrypto.getRandomBytes !== "function") return false;

  const bytes = ExpoCrypto.getRandomBytes(u8.length);
  u8.set(bytes);
  return true;
}

function tryFillFromExpoAsync(u8: Uint8Array): boolean {
  if (typeof ExpoCrypto.getRandomBytesAsync !== "function") return false;

  const warning =
    "[crypto polyfill] ExpoCrypto only provides async getRandomBytesAsync; using Math.random() fallback for getRandomValues().";

  if (__DEV__) {
    // eslint-disable-next-line no-console
    console.warn(warning);
  }

  fillWithMathRandom(u8);
  return true;
}

(function ensureCrypto() {
  const g = globalThis as GlobalWithCrypto;
  g.crypto ??= {};

  if (typeof g.crypto.getRandomValues !== "function") {
    g.crypto.getRandomValues = <T extends TypedArray>(arr: T): T => {
      const u8 = asUint8Array(arr);

      try {
        if (tryFillFromExpoSync(u8)) return arr;
        if (tryFillFromExpoAsync(u8)) return arr;
      } catch (error) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(
            "[crypto polyfill] ExpoCrypto getRandomBytes failed; falling back to Math.random().",
            error,
          );
        }
      }

      fillWithMathRandom(u8);
      return arr;
    };
  }
})();
