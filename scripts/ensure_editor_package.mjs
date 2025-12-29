import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const editorDir = path.join(ROOT, "packages", "editor");
const pkgJsonPath = path.join(editorDir, "package.json");
const srcIndexPath = path.join(editorDir, "src", "index.ts");
const distIndexPath = path.join(editorDir, "dist", "index.js");

fs.mkdirSync(path.join(editorDir, "src"), { recursive: true });
fs.mkdirSync(path.join(editorDir, "dist"), { recursive: true });

if (!fs.existsSync(pkgJsonPath)) {
  const pkg = {
    name: "packages-editor",
    version: "0.0.1",
    private: true,
    main: "dist/index.js",
    types: "src/index.ts",
    exports: {
      ".": {
        types: "./src/index.ts",
        default: "./dist/index.js"
      }
    }
  };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
  console.log("[ensure_editor_package] created packages/editor/package.json");
} else {
  console.log("[ensure_editor_package] packages/editor/package.json exists");
}

// Minimal runtime stub so bundler resolves it.
// Replace with your real implementation if you already have one elsewhere.
if (!fs.existsSync(distIndexPath)) {
  fs.writeFileSync(
    distIndexPath,
    `"use strict";\nmodule.exports = require("./runtime");\n`,
    "utf8"
  );
  fs.writeFileSync(
    path.join(editorDir, "dist", "runtime.js"),
    `"use strict";\nexports.default = function EditorComponent(){ return null; };\nexports.MonacoEditorRef = {};\n`,
    "utf8"
  );
  console.log("[ensure_editor_package] created packages/editor/dist/* resolver stubs");
}

if (!fs.existsSync(srcIndexPath)) {
  fs.writeFileSync(
    srcIndexPath,
    `export type MonacoEditorRef = unknown;\nexport default function EditorComponent(): any { return null; }\n`,
    "utf8"
  );
  console.log("[ensure_editor_package] created packages/editor/src/index.ts type stub");
}
