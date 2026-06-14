#!/usr/bin/env node
/**
 * @purpose Git pre-commit quality gate: checks staged files with Oxlint and Oxfmt.
 * @role    Keeps commit-time lint/format feedback scoped to files the user is committing.
 * @deps    Node child_process/fs/path plus workspace-local oxlint and oxfmt binaries.
 * @gotcha  Uses argv arrays instead of shell interpolation so staged file names stay literal.
 */

import { existsSync } from "node:fs"
import { extname } from "node:path"
import { spawnSync } from "node:child_process"

const LINT_EXTS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"])
const FORMAT_EXTS = new Set([...LINT_EXTS, ".css", ".html", ".json", ".jsonc", ".md", ".mdx"])

const changed = spawnSync("git", ["diff", "--cached", "--name-only", "--diff-filter=ACMR"], {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
})

if (changed.status !== 0) {
  process.stderr.write(changed.stderr || "Unable to read staged files.\n")
  process.exit(changed.status ?? 1)
}

const files = changed.stdout
  .split("\n")
  .map((file) => file.trim())
  .filter((file) => file && existsSync(file))

const lintFiles = files.filter((file) => LINT_EXTS.has(extname(file).toLowerCase()))
const formatFiles = files.filter((file) => FORMAT_EXTS.has(extname(file).toLowerCase()))

let ok = true

if (lintFiles.length > 0) {
  ok = run("Oxlint", ["exec", "oxlint", "--no-error-on-unmatched-pattern", ...lintFiles]) && ok
}

if (formatFiles.length > 0) {
  ok =
    run("Oxfmt", ["exec", "oxfmt", "--check", "--no-error-on-unmatched-pattern", ...formatFiles]) &&
    ok
}

process.exit(ok ? 0 : 1)

function run(label, args) {
  process.stdout.write(`${label}: checking staged files\n`)
  const result = spawnSync("pnpm", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (result.status === 0) return true

  if (result.error) process.stderr.write(`${label}: ${result.error.message}\n`)
  return false
}
