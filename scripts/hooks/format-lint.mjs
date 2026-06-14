#!/usr/bin/env node
/**
 * @purpose PostToolUse quality feedback hook: runs Oxlint/Oxfmt checks for one edited file.
 * @role    Fast harness sensor shared by Claude Code and Codex hook configs.
 * @deps    Node child_process/fs plus workspace-local oxlint and oxfmt binaries.
 * @gotcha  Multi-file patches are skipped here; pre-commit handles staged-file batches.
 */

import { readFileSync } from "node:fs"
import { existsSync } from "node:fs"
import { extname } from "node:path"
import { spawnSync } from "node:child_process"

const LINT_EXTS = new Set([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts"])
const FORMAT_EXTS = new Set([...LINT_EXTS, ".css", ".html", ".json", ".jsonc", ".md", ".mdx"])

let payload = {}
try {
  payload = JSON.parse(readFileSync(0, "utf8") || "{}")
} catch {
  // Keep payload empty on malformed hook input.
}

const toolInput = payload?.tool_input ?? {}
const file = toolInput.file_path ?? toolInput.path ?? singleFileFromPatch(toolInput.input)

if (!file || !existsSync(file)) process.exit(0)

const ext = extname(file).toLowerCase()
const reports = []

if (LINT_EXTS.has(ext)) {
  runCheck("Oxlint", ["exec", "oxlint", "--no-error-on-unmatched-pattern", file])
}

if (FORMAT_EXTS.has(ext)) {
  runCheck("Oxfmt", ["exec", "oxfmt", "--check", "--no-error-on-unmatched-pattern", file])
}

if (reports.length > 0) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: `Lint/format report (${file}):\n${reports.join("\n\n")}`,
      },
    }),
  )
}

process.exit(0)

function runCheck(label, args) {
  const result = spawnSync("pnpm", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
  if (result.status === 0) return

  const out = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim()
  if (out) {
    reports.push(`${label}:\n${out}`)
    return
  }

  const failure = result.error?.message ?? `exited with status ${result.status ?? "unknown"}`
  reports.push(`${label}: ${failure}`)
}

function singleFileFromPatch(input) {
  if (typeof input !== "string") return ""

  const files = new Set()
  for (const match of input.matchAll(/^\*\*\* (?:Add|Update) File: (.+)$/gm)) {
    files.add(match[1].trim())
  }

  return files.size === 1 ? [...files][0] : ""
}
