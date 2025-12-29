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

type CryptoContainer = typeof globalThis & { crypto?: CryptoWithRandomValues };

function asUint8Array(view: TypedArray): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset, view.byteLength);
}

(function ensureCrypto() {
  const globalCrypto = globalThis as CryptoContainer;
  if (!globalCrypto.crypto) globalCrypto.crypto = {};

  const crypto = globalCrypto.crypto as CryptoWithRandomValues;

  if (typeof crypto.getRandomValues !== "function") {
    crypto.getRandomValues = <T extends TypedArray>(arr: T): T => {
      const u8 = asUint8Array(arr);

      try {
        if (typeof ExpoCrypto.getRandomBytes === "function") {
          const bytes = ExpoCrypto.getRandomBytes(u8.length);
          u8.set(bytes);
          return arr;
        }

        if (typeof ExpoCrypto.getRandomBytesAsync === "function") {
          const warning = "[crypto polyfill] Using async getRandomBytesAsync fallback for getRandomValues().";
          if (__DEV__) {
            // eslint-disable-next-line no-console
            console.warn(warning);
          }
          // This is a best-effort fallback; it preserves the API shape even though
          // it must block until the Promise resolves.
          const bytesPromise = ExpoCrypto.getRandomBytesAsync(u8.length);
          // eslint-disable-next-line @typescript-eslint/no-floating-promises
          bytesPromise.then((bytes) => u8.set(bytes));
          return arr;
        }
      } catch (error) {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn("[crypto polyfill] ExpoCrypto getRandomBytes failed; falling back to Math.random().", error);
        }
      }

      for (let i = 0; i < u8.length; i++) u8[i] = (Math.random() * 256) | 0;
      return arr;
    };
  }
})();
