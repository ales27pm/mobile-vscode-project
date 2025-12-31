import fs from "fs";
import path from "path";

const ROOT = path.resolve(process.cwd());
const pkgPath = path.join(ROOT, "package.json");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

pkg.overrides ??= {};
pkg.overrides.react = "19.2.3";
pkg.overrides["react-dom"] = "19.2.3";

// (Optional) lock react-test-renderer too, helps Jest/Expo consistency
pkg.overrides["react-test-renderer"] = "19.2.3";

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("[enforce_react_overrides] set npm overrides for react/react-dom/react-test-renderer to 19.2.3");
