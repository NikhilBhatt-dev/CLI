#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createInterface } from "readline/promises";
import { stdin, stdout } from "process";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// __dirname resolves to the package's own src/ directory in EVERY layout:
//   * local dev          -> <repo>/cli/src
//   * npm-installed      -> <project>/node_modules/nikhilbhatt-dev/src
//   * npx cache extract  -> <npx-cache>/.../nikhilbhatt-dev/src
// Resolving the template relative to __dirname (NOT process.cwd()) is what
// makes the packaged CLI find its bundled template regardless of where it is
// invoked from. Using cwd here was the original cause of the "empty target
// directory" bug.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Project name from command line
const projectName = process.argv[2];

console.log(`
╔══════════════════════════════════════╗
║          NikhilBhatt-dev             ║
║       Backend Generator CLI          ║
╚══════════════════════════════════════╝
`);

if (!projectName) {
  console.log("❌ Please provide a project name.");
  console.log("Example:");
  console.log("  node src/index.js my-backend");
  process.exit(1);
}

const projectPath = path.resolve(process.cwd(), projectName);

// Backend template location -- resolved from the package location so it works
// both when run locally (node src/index.js) and from an installed/npx package.
console.log(`\nCreating ${projectName}...`);

const templatePath = path.resolve(__dirname, "../template/backend");

if (!fs.existsSync(templatePath)) {
  console.error("❌ Backend template not found.");
  console.error("Template path:", templatePath);
  process.exit(1);
}

console.log("📁 Template found:", templatePath);

// Existing-folder protection.
if (fs.existsSync(projectPath)) {
  console.log(`❌ Folder "${projectName}" already exists.`);
  process.exit(1);
}

fs.cpSync(templatePath, projectPath, {
  recursive: true,
  filter: (source) => {
    const relativePath = path.relative(templatePath, source);

    // The template ROOT itself must always be copied. Returning false here is
    // the exact mistake that yields an empty target directory: fs.cpSync still
    // creates the destination folder, copies nothing, and the CLI then prints
    // "created successfully" while my-backend is empty.
    if (!relativePath) return true;

    const parts = relativePath.split(path.sep);

    // Never copy installed dependencies.
    if (parts.includes("node_modules")) return false;
    // Exclude only the exact .env file; other .env.* files are allowed.
    if (path.basename(source) === ".env") return false;

    return true;
  },
});

// Safety net: if the copy produced an empty target (e.g. the bundled template
// was missing from the package, or the filter excluded everything), fail loudly
// with diagnostics instead of silently reporting an empty "success".
const generated = fs.existsSync(projectPath) ? fs.readdirSync(projectPath) : [];
if (generated.length === 0) {
  console.error("❌ Backend generation produced an empty directory.");
  console.error("Target:", projectPath);
  console.error("Template:", templatePath);
  console.error("Template contents:", fs.readdirSync(templatePath));
  process.exit(1);
}

console.log(`✅ Backend project "${projectName}" created successfully!`);
console.log(`   Location: ${projectPath}`);

// Interactive dependency installation prompt
const rl = createInterface({ input: stdin, output: stdout });

const answer = await rl.question("\nDo you want to install dependencies now? (y/n): ");
const choice = answer.trim().toLowerCase();

if (choice === "y" || choice === "yes") {
  console.log("\n📦 Installing dependencies, please wait...\n");
  try {
    const { stdout: out, stderr: err } = await execAsync("npm install", {
      cwd: projectPath,
      maxBuffer: 1024 * 1024 * 10, // 10 MB buffer for npm install output
    });
    if (out) process.stdout.write(out);
    if (err) process.stderr.write(err);
    console.log("\n✅ Dependencies installed successfully!");
    console.log(`   Run "cd ${projectName}" and then "npm run dev" to start the server.`);
  } catch (error) {
    console.error("❌ Failed to install dependencies.");
    if (error.stderr) process.stderr.write(error.stderr);
    if (error.stdout) process.stdout.write(error.stdout);
    console.error(`   ${error.message}`);
    console.error("   You can install dependencies manually by running:");
    console.error(`     cd ${projectName} && npm install`);
  }
} else {
  console.log("\n⏭️  Skipping dependency installation.");
  console.log("   You can install dependencies manually later by running:");
  console.log(`     cd ${projectName} && npm install`);
}

rl.close();
