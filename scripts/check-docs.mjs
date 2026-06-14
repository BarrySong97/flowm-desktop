#!/usr/bin/env node
/**
 * @purpose Cross-tool documentation sensor: checks AI file headers, local doc links, and likely module doc drift.
 * @role    Harness completion gate used by agents, hooks, and manual audits.
 * @deps    Node fs/path/child_process plus optional git.
 * @gotcha  The current config intentionally scopes header checks to scripts/ so the project can adopt headers incrementally.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { dirname, join, relative, resolve, sep } from "node:path";

const ROOT = process.cwd();
const rawArgs = process.argv.slice(2);
const STRICT = rawArgs.includes("--strict");
const HOOK = rawArgs.includes("--hook");
let BASE = null;

{
  const i = rawArgs.findIndex((a) => a === "--base" || a.startsWith("--base="));
  if (i !== -1) {
    BASE = rawArgs[i].includes("=") ? rawArgs[i].slice("--base=".length) : rawArgs[i + 1];
  }
  if (BASE && !/^[\w./@~^-]+$/.test(BASE)) {
    console.error("Warning: --base contains invalid characters and was ignored.");
    BASE = null;
  }
}

if (rawArgs.includes("--help") || rawArgs.includes("-h")) {
  console.log(`check-docs
Usage: node scripts/check-docs.mjs [--strict] [--hook] [--base <ref>]

Checks:
  1. Source files in configured sourceRoots have an @purpose header marker.
  2. Local markdown links point to existing files.
  3. Changed module code has nearby docs/modules/<module>/ updates.

Options:
  --strict       Treat warnings as failures.
  --hook         Stop-hook mode. Hard failures exit 2.
  --base <ref>   Include git diff <ref>...HEAD for branch audits.
`);
  process.exit(0);
}

const DEFAULTS = {
  sourceExts: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"],
  sourceRoots: [],
  ignoreDirs: [
    "node_modules",
    ".git",
    "dist",
    "build",
    ".next",
    "out",
    "coverage",
    ".turbo",
    ".cache",
    "vendor",
    "templates",
  ],
  nonModuleDirs: [
    "scripts",
    "hooks",
    "test",
    "tests",
    "__tests__",
    "spec",
    "bin",
    "config",
    "public",
    "assets",
    "types",
    "typings",
    "migrations",
  ],
  headerMarker: "@purpose",
  headerScanLines: 20,
  docsDir: "docs",
};

let CONFIG = { ...DEFAULTS };
const cfgPath = join(ROOT, "check-docs.config.json");
if (existsSync(cfgPath)) {
  try {
    CONFIG = { ...DEFAULTS, ...JSON.parse(readFileSync(cfgPath, "utf8")) };
  } catch (error) {
    console.error(`Warning: failed to parse check-docs.config.json: ${error.message}`);
  }
}

const IGNORE = new Set(CONFIG.ignoreDirs);
const NON_MODULE = new Set(CONFIG.nonModuleDirs);
const hasSourceExt = (file) => CONFIG.sourceExts.some((ext) => file.endsWith(ext));
const toPosix = (file) => file.split(sep).join("/");

function walk(dir, acc = []) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return acc;
  }

  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORE.has(entry.name)) walk(full, acc);
    } else if (entry.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}

function readHead(file) {
  try {
    return readFileSync(file, "utf8")
      .split(/\r?\n/)
      .slice(0, CONFIG.headerScanLines)
      .join("\n");
  } catch {
    return "";
  }
}

const roots = CONFIG.sourceRoots.length
  ? CONFIG.sourceRoots
  : existsSync(join(ROOT, "src"))
    ? ["src"]
    : ["."];

const sourceFiles = [];
for (const root of roots) {
  const base = join(ROOT, root);
  if (existsSync(base)) {
    for (const file of walk(base)) {
      if (hasSourceExt(file)) sourceFiles.push(file);
    }
  }
}

const missingHeaders = sourceFiles
  .filter((file) => !readHead(file).includes(CONFIG.headerMarker))
  .map((file) => toPosix(relative(ROOT, file)));

function gitChangedFiles(base) {
  try {
    execSync("git rev-parse --is-inside-work-tree", { cwd: ROOT, stdio: "ignore" });
  } catch {
    return null;
  }

  const files = new Set();
  const unquote = (path) => path.replace(/^"|"$/g, "");

  if (base) {
    try {
      const out = execSync(`git diff --name-only ${base}...HEAD`, {
        cwd: ROOT,
        encoding: "utf8",
      });
      for (const line of out.split(/\r?\n/)) {
        if (line.trim()) files.add(toPosix(unquote(line.trim())));
      }
    } catch (error) {
      console.error(`Warning: git diff ${base}...HEAD failed: ${error.message}`);
    }
  }

  try {
    const out = execSync("git status --porcelain", { cwd: ROOT, encoding: "utf8" });
    for (const line of out.split(/\r?\n/)) {
      if (!line.trim()) continue;
      let path = line.slice(3);
      if (path.includes(" -> ")) path = path.split(" -> ")[1];
      files.add(toPosix(unquote(path)));
    }
  } catch {
    // Ignore git status failures.
  }

  return files;
}

const changed = gitChangedFiles(BASE);
const driftWarnings = [];

if (changed) {
  const prefixes = roots.map((root) => (root === "." ? "" : `${toPosix(root)}/`));
  const seen = new Set();

  for (const changedFile of changed) {
    if (!hasSourceExt(changedFile)) continue;
    const prefix = prefixes.find((candidate) => candidate === "" || changedFile.startsWith(candidate));
    if (prefix === undefined) continue;

    const rel = prefix ? changedFile.slice(prefix.length) : changedFile;
    const parts = rel.split("/");
    if (parts.length < 2) continue;

    const mod = parts[0];
    if (NON_MODULE.has(mod) || seen.has(mod)) continue;
    seen.add(mod);

    const folder = `${CONFIG.docsDir}/modules/${mod}`;
    const flatInModules = `${folder}.md`;
    const flatLegacy = `${CONFIG.docsDir}/${mod}.md`;

    if (existsSync(join(ROOT, folder))) {
      if (![...changed].some((file) => file.startsWith(`${folder}/`))) {
        driftWarnings.push(`Changed ${mod} code but did not update ${folder}/ docs.`);
      }
    } else if (existsSync(join(ROOT, flatInModules))) {
      if (!changed.has(flatInModules)) {
        driftWarnings.push(`Changed ${mod} code but did not update ${flatInModules}.`);
      }
    } else if (existsSync(join(ROOT, flatLegacy))) {
      if (!changed.has(flatLegacy)) {
        driftWarnings.push(`Changed ${mod} code but did not update ${flatLegacy}.`);
      }
    } else {
      driftWarnings.push(`Changed module "${mod}" but ${folder}/README.md is missing.`);
    }
  }
}

const brokenRefs = new Set();
const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const isSkippableTarget = (target) =>
  !target || /^(https?:|mailto:|tel:|data:|#)/i.test(target) || /[<>*]/.test(target);

for (const md of walk(ROOT).filter((file) => file.endsWith(".md"))) {
  let content;
  try {
    content = readFileSync(md, "utf8");
  } catch {
    continue;
  }

  let match;
  while ((match = linkRe.exec(content)) !== null) {
    let target = match[1].trim();
    if (isSkippableTarget(target)) continue;
    target = target.split("#")[0].split("?")[0];
    if (!target) continue;
    if (!existsSync(resolve(dirname(md), target))) {
      brokenRefs.add(`${toPosix(relative(ROOT, md))} -> missing link target: ${target}`);
    }
  }
}

const docRefRe = /docs\/[A-Za-z0-9_./-]+\.md/g;
for (const file of sourceFiles) {
  const head = readHead(file);
  let match;
  while ((match = docRefRe.exec(head)) !== null) {
    const target = match[0];
    if (!existsSync(join(ROOT, target))) {
      brokenRefs.add(`${toPosix(relative(ROOT, file))} header -> missing doc target: ${target}`);
    }
  }
}

const lines = ["-- check-docs --", ""];
let hard = 0;
let soft = 0;

if (missingHeaders.length) {
  hard += missingHeaders.length;
  lines.push(`ERROR missing AI file headers (${missingHeaders.length})`);
  for (const file of missingHeaders) lines.push(`  - ${file}`);
  lines.push("");
}

if (brokenRefs.size) {
  hard += brokenRefs.size;
  lines.push(`ERROR broken local references (${brokenRefs.size})`);
  for (const ref of brokenRefs) lines.push(`  - ${ref}`);
  lines.push("");
}

if (driftWarnings.length) {
  soft += driftWarnings.length;
  lines.push(`WARN possible doc drift (${driftWarnings.length})`);
  for (const warning of driftWarnings) lines.push(`  - ${warning}`);
  lines.push("");
}

lines.push(!hard && !soft ? "OK all checks passed" : `Summary: ${hard} errors, ${soft} warnings`);
if (changed === null) lines.push("(Git was unavailable; skipped drift detection.)");

const report = lines.join("\n");
console.log(report);

const failed = hard > 0 || (STRICT && soft > 0);
if (HOOK && failed) {
  process.stderr.write(`${report}\n\n[check-docs] Fix these issues before ending the task.\n`);
  process.exit(2);
}

process.exit(failed ? 1 : 0);
