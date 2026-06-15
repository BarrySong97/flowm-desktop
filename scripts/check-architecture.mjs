#!/usr/bin/env node
/**
 * @purpose Enforce high-value layered architecture boundaries that TypeScript alone cannot express.
 * @role    Repository sensor for frontend/shared/use-case/backend dependency direction.
 * @deps    Node fs/path.
 * @gotcha  Keep this focused on hard architectural red lines rather than stylistic preferences.
 */

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, relative, sep } from "node:path"

const ROOT = process.cwd()
const failures = []

function toPosix(file) {
  return file.split(sep).join("/")
}

function walk(dir, acc = []) {
  if (!existsSync(dir)) return acc
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) walk(full, acc)
    else if (entry.isFile() && /\.[cm]?[tj]sx?$/.test(entry.name)) acc.push(full)
  }
  return acc
}

function read(file) {
  return readFileSync(file, "utf8")
}

function fail(file, message) {
  failures.push(`${toPosix(relative(ROOT, file))}: ${message}`)
}

for (const file of walk(join(ROOT, "packages/api/src/use-cases"))) {
  const source = read(file)
  if (/from\s+["'](?:@flowm\/db|drizzle-orm)["']/.test(source)) {
    fail(file, "use-cases must not import @flowm/db or drizzle-orm directly")
  }
  if (/\bthis\.db\b/.test(source)) {
    fail(file, "use-cases must access persistence through infrastructure repositories")
  }
}

for (const file of walk(join(ROOT, "packages/api/src/infrastructure"))) {
  const source = read(file)
  if (/from\s+["'][^"']*use-cases\//.test(source)) {
    fail(file, "infrastructure must not import use-case modules")
  }
}

for (const file of walk(join(ROOT, "packages/shared/src/contracts"))) {
  const source = read(file)
  if (/from\s+["'](?:@flowm\/api|@flowm\/db|electron|node:|drizzle-orm)/.test(source)) {
    fail(file, "shared contracts must stay browser-safe and backend-runtime free")
  }
}

for (const file of walk(join(ROOT, "packages/api/src/sqlite"))) {
  const source = read(file)
  const lines = source.trimEnd().split(/\r?\n/)
  if (lines.length > 20 || !/\bexport\s+\*\s+from\b/.test(source)) {
    fail(file, "sqlite compatibility modules must remain thin re-exports")
  }
}

if (failures.length) {
  console.error("-- check-architecture --")
  for (const item of failures) console.error(`FAIL ${item}`)
  process.exit(1)
}

console.log("-- check-architecture --")
console.log("OK all checks passed")
