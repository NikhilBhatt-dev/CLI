import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const cliRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliEntry = path.join(cliRoot, "src", "index.js");
const filterTest = path.join(cliRoot, "_repro", "filter_test.mjs");
const rootFilterTest = path.join(cliRoot, "_repro", "root_filter_test.mjs");
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const npxCommand = process.platform === "win32" ? "npx.cmd" : "npx";

function run(command, args, cwd, input = "", env = {}) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    input,
    env: { ...process.env, ...env },
    maxBuffer: 10 * 1024 * 1024,
    shell: process.platform === "win32" && command.endsWith(".cmd"),
    windowsHide: true,
  });
}

function output(result) {
  return `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
}

function expectExit(result, expected, label) {
  assert.equal(result.status, expected, `${label}\n${result.error?.message ?? ""}\n${output(result)}`);
}

function assertGenerated(projectPath, label, dependenciesExpected = false) {
  const required = [
    "package.json",
    "package-lock.json",
    "README.md",
    ".env.example",
    "src/app.js",
    "src/server.js",
    "src/config",
    "src/controllers",
    "src/routes",
    "src/services",
    "src/middleware",
  ];

  assert.ok(fs.existsSync(projectPath), `${label}: generated project missing`);
  for (const relativePath of required) {
    assert.ok(
      fs.existsSync(path.join(projectPath, relativePath)),
      `${label}: missing ${relativePath}`,
    );
  }
  assert.equal(fs.existsSync(path.join(projectPath, ".env")), false, `${label}: .env copied`);
  if (!dependenciesExpected) {
    assert.equal(fs.existsSync(path.join(projectPath, "node_modules")), false, `${label}: node_modules copied`);
  }
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "nikhilbhatt-cli-e2e-"));
const noInstallProject = path.join(tempRoot, "no-install");
const installProject = path.join(tempRoot, "install");
const packedProject = path.join(tempRoot, "packed");

try {
  const filterResult = run(process.execPath, [filterTest], cliRoot);
  expectExit(filterResult, 0, "focused filter test");

  const rootFilterResult = run(process.execPath, [rootFilterTest], cliRoot);
  expectExit(rootFilterResult, 0, "root filter test");

  const missingName = run(process.execPath, [cliEntry], tempRoot);
  expectExit(missingName, 1, "missing project name");

  const generated = run(process.execPath, [cliEntry, "no-install"], tempRoot, "n\n");
  expectExit(generated, 0, "local generation without install");
  assertGenerated(noInstallProject, "local generation without install");

  const existingDestination = run(process.execPath, [cliEntry, "no-install"], tempRoot, "n\n");
  expectExit(existingDestination, 1, "existing destination");

  const installed = run(process.execPath, [cliEntry, "install"], tempRoot, "y\n", {
    npm_config_audit: "false",
    npm_config_fund: "false",
  });
  expectExit(installed, 0, "local generation with install");
  assertGenerated(installProject, "local generation with install", true);
  assert.ok(fs.existsSync(path.join(installProject, "node_modules")), "npm install did not run");

  const cleanInstall = run(
    npmCommand,
    ["ci", "--ignore-scripts", "--no-audit", "--no-fund"],
    noInstallProject,
  );
  expectExit(cleanInstall, 0, "generated backend npm ci");

  const packDryRun = run(npmCommand, ["pack", "--dry-run", "--json", "--ignore-scripts"], cliRoot);
  expectExit(packDryRun, 0, "npm pack --dry-run");
  const dryRun = JSON.parse(packDryRun.stdout);
  const dryRunPaths = dryRun[0].files.map(({ path: filePath }) => filePath);
  for (const requiredPath of ["README.md", "package.json", "src/index.js", "template/backend/package.json"]) {
    assert.ok(dryRunPaths.includes(requiredPath), `dry run missing ${requiredPath}`);
  }
  for (const excludedPath of ["_repro/", "_pkgchk/", "local.log"]) {
    assert.equal(dryRunPaths.some((filePath) => filePath.startsWith(excludedPath)), false, `dry run includes ${excludedPath}`);
  }

  const packed = run(npmCommand, ["pack", "--ignore-scripts", "--pack-destination", tempRoot], cliRoot);
  expectExit(packed, 0, "temporary npm pack");
  const tarball = fs.readdirSync(tempRoot).find((fileName) => fileName.endsWith(".tgz"));
  assert.ok(tarball, "temporary tarball missing");
  const tarList = run("tar", ["-tf", path.join(tempRoot, tarball)], tempRoot);
  expectExit(tarList, 0, "temporary tarball listing");
  const tarPaths = tarList.stdout.split(/\r?\n/).filter(Boolean);
  for (const requiredPath of ["package/README.md", "package/package.json", "package/src/index.js", "package/template/backend/package.json"]) {
    assert.ok(tarPaths.includes(requiredPath), `tarball missing ${requiredPath}`);
  }
  for (const excludedPath of ["package/_repro/", "package/_pkgchk/"]) {
    assert.equal(tarPaths.some((filePath) => filePath.startsWith(excludedPath)), false, `tarball includes ${excludedPath}`);
  }

  const packedRun = run(npxCommand, ["--yes", path.join(tempRoot, tarball), "packed"], tempRoot, "n\n");
  expectExit(packedRun, 0, "packed npx generation");
  assertGenerated(packedProject, "packed npx generation");

  console.log("E2E TEST: PASS");
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
  for (const generatedPath of [
    "synthetic_template",
    "synthetic_out",
    "out_return_false_for_root",
    "out_root_true_children_false",
    "out_correct_filter",
  ]) {
    fs.rmSync(path.join(cliRoot, "_repro", generatedPath), { recursive: true, force: true });
  }
}