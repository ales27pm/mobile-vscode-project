import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, ".."); // apps/backend
const entry = path.join(root, "extension", "src", "extension.ts");
const outFile = path.join(root, "extension", "dist", "extension.bundle.js");

await build({
  entryPoints: [entry],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "cjs",
  sourcemap: true,
  target: ["node18"],
  external: ["vscode"], // must be external in VS Code extensions
});

console.log("Bundled:", outFile);
