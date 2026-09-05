// Nail down the exact mechanism that yields an EMPTY destination dir while
// fs.cpSync still "succeeds" (matches the reported symptom).
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, "synthetic_template/backend");

function runScenario(name, filter) {
  const dest = path.resolve(__dirname, "out_" + name.replace(/[A-Z]/g, "_$1"));
  fs.rmSync(dest, { recursive: true, force: true });
  let threw = null;
  try {
    fs.cpSync(src, dest, { recursive: true, filter });
  } catch (e) {
    threw = e.message;
  }
  const exists = fs.existsSync(dest);
  const entries = exists ? fs.readdirSync(dest) : [];
  console.log(`[${name}] threw=${threw ?? "no"} | destExists=${exists} | entries=${entries.length} ${entries.length ? "-> " + entries.join(", ") : "(EMPTY)"}`);
}

// A) return false for root -> (Node 24: dest not created)
runScenario("return_false_for_root", (source) => {
  const relativePath = path.relative(src, source);
  if (!relativePath) return false;
  return true;
});

// B) true for root, false for EVERY child -> empty dest, no throw
runScenario("root_true_children_false", (source) => {
  const relativePath = path.relative(src, source);
  if (!relativePath) return true;
  return false;
});

// C) CORRECT filter (current on-disk code) -> full dest
runScenario("correct_filter", (source) => {
  const relativePath = path.relative(src, source);
  if (!relativePath) return true;
  const parts = relativePath.split(path.sep);
  if (parts.includes("node_modules")) return false;
  if (parts.includes(".env")) return false;
  return true;
});
