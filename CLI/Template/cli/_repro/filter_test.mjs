// Direct test of the EXACT filter+fs.cpSync logic from cli/src/index.js,
// against a synthetic template that contains .env, .env.example, node_modules,
// and a normal src/ tree -- to prove exclusions/inclusions are correct.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const templatePath = path.resolve(__dirname, "../synthetic_template/backend");

// Build a synthetic template
const root = path.resolve(__dirname, "synthetic_template/backend");
fs.rmSync(path.dirname(root), { recursive: true, force: true });
fs.mkdirSync(path.join(root, "src", "config"), { recursive: true });
fs.mkdirSync(path.join(root, "node_modules", "some-pkg"), { recursive: true });
fs.mkdirSync(path.join(root, "uploads"), { recursive: true });

fs.writeFileSync(path.join(root, "package.json"), '{}');
fs.writeFileSync(path.join(root, ".env.example"), "EXAMPLE=1");
fs.writeFileSync(path.join(root, ".env"), "SECRET=leaked");          // must NOT be copied
fs.writeFileSync(path.join(root, ".env.local"), "LOCAL=1");
fs.writeFileSync(path.join(root, ".env.test"), "TEST=1");
fs.writeFileSync(path.join(root, ".env.production"), "PRODUCTION=1");
fs.writeFileSync(path.join(root, "src", "app.js"), "app");
fs.writeFileSync(path.join(root, "src", "config", "env.js"), "env");
fs.writeFileSync(path.join(root, "node_modules", "some-pkg", "x.js"), "x");
fs.writeFileSync(path.join(root, "uploads", "a.txt"), "a");        // empty uploads has a file here

const projectPath = path.resolve(__dirname, "synthetic_out/my-backend");
fs.rmSync(projectPath, { recursive: true, force: true });

fs.cpSync(root, projectPath, {
  recursive: true,
  filter: (source) => {
    const relativePath = path.relative(root, source);
    if (!relativePath) return true;
    const parts = relativePath.split(path.sep);
    if (parts.includes("node_modules")) return false;
    if (path.basename(source) === ".env") return false;
    return true;
  },
});

const all = [];
function walk(p) {
  for (const e of fs.readdirSync(p, { withFileTypes: true })) {
    all.push(path.relative(projectPath, path.join(p, e.name)).replace(/\\/g, "/"));
    if (e.isDirectory()) walk(path.join(p, e.name));
  }
}
walk(projectPath);

const has = (s) => all.some((f) => f === s || f.startsWith(s + "/"));
const results = [
  ["src/app.js COPIED", has("src/app.js")],
  ["src/config/env.js COPIED", has("src/config/env.js")],
  ["package.json COPIED", has("package.json")],
  [".env.example COPIED", has(".env.example")],
  [".env NOT copied", !has(".env")],
  [".env.local COPIED", has(".env.local")],
  [".env.test COPIED", has(".env.test")],
  [".env.production COPIED", has(".env.production")],
  ["node_modules NOT copied", !has("node_modules")],
];

console.log("=== FILTER DIRECT TEST ===");
for (const [label, ok] of results) {
  console.log((ok ? "PASS" : "FAIL") + " - " + label);
}
if (results.some(([, ok]) => !ok)) process.exitCode = 1;
console.log("=== ALL ENTRIES COPIED ===");
console.log(all.sort().join("\n"));
