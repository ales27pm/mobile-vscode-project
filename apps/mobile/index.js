import './src/installPolyfills';
// Entry point for Expo (monorepo-safe).
//
// We avoid Expo's default `expo/AppEntry` which tries to import `../../App`
// (relative to `node_modules/expo/AppEntry.js`), which breaks in monorepos.

import { registerRootComponent } from "expo";
import App from "./src/App";

registerRootComponent(App);
