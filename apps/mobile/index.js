import './src/polyfills';
import "./src/polyfills/crypto";
import * as Crypto from "expo-crypto";
import "react-native-get-random-values";
import "react-native-url-polyfill";
// Entry point for Expo (monorepo-safe).
//
// We avoid Expo's default `expo/AppEntry` which tries to import `../../App`
// (relative to `node_modules/expo/AppEntry.js`), which breaks in monorepos.


// Strengthen randomness for libs that rely on `crypto.getRandomValues`.
// In Expo Go, `expo-random` is the simplest good-enough provider.
import * as ExpoRandom from "expo-random";

// Ensure globalThis.crypto exists with a working getRandomValues.
// react-native-get-random-values already patches this in most cases;
// this is a defensive fallback.
if (typeof globalThis.crypto !== "object" || globalThis.crypto === null) {
  // @ts-ignore
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.getRandomValues !== "function") {
  // @ts-ignore
  globalThis.crypto.getRandomValues = (typedArray) => {
    const bytes = ExpoRandom.getRandomBytes(typedArray.byteLength);
    typedArray.set(bytes);
    return typedArray;
  };
}

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
