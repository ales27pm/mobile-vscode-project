import fs from "fs";
import path from "path";
import JSON5 from "json5";

const ROOT = path.resolve(process.cwd());
const appJsonPath = path.join(ROOT, "apps", "mobile", "app.json");

if (!fs.existsSync(appJsonPath)) {
  console.error(`[patch_expo_appjson] Missing: ${appJsonPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(appJsonPath, "utf8");

// JSON5 tolerant parse (comments/trailing commas OK)
let cfg;
try {
  cfg = JSON5.parse(raw);
} catch (e) {
  console.error(`[patch_expo_appjson] Failed to parse app.json as JSON5: ${e?.message || e}`);
  process.exit(1);
}

cfg.expo ??= {};

const iconPath = "./assets/icon.png";
const splashPath = "./assets/splash.png";

cfg.expo.icon = cfg.expo.icon || iconPath;

cfg.expo.splash ??= {};
cfg.expo.splash.image = cfg.expo.splash.image || splashPath;
cfg.expo.splash.resizeMode = cfg.expo.splash.resizeMode || "contain";
cfg.expo.splash.backgroundColor = cfg.expo.splash.backgroundColor || "#0a0a0c";

// Always normalize to these repo-root assets (since you start expo at repo root)
cfg.expo.icon = iconPath;
cfg.expo.splash.image = splashPath;

// Write as strict JSON (no comments/trailing commas)
const out = JSON.stringify(cfg, null, 2) + "\n";
fs.writeFileSync(appJsonPath, out, "utf8");

console.log(`[patch_expo_appjson] patched ${appJsonPath}`);
