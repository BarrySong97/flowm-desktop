#!/usr/bin/env node
/**
 * @purpose Build the npm-publishable Flowm CLI package.
 * @role    Bundles workspace TypeScript into dist/index.mjs and copies DB migrations.
 * @deps    Node fs/child_process/path/url and workspace esbuild CLI.
 * @gotcha  Keep better-sqlite3 external so npm installs the native module for the user's Node ABI.
 */

import {
  chmodSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { execFileSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const here = dirname(fileURLToPath(import.meta.url))
const packageRoot = resolve(here, "..")
const repoRoot = resolve(packageRoot, "../..")
const distDir = resolve(packageRoot, "dist")
const npmDir = resolve(packageRoot, "npm")
const npmDistDir = resolve(npmDir, "dist")

rmSync(distDir, { recursive: true, force: true })
rmSync(npmDir, { recursive: true, force: true })
mkdirSync(distDir, { recursive: true })
mkdirSync(npmDistDir, { recursive: true })

execFileSync(
  "pnpm",
  [
    "exec",
    "esbuild",
    "src/index.ts",
    "--bundle",
    "--platform=node",
    "--format=esm",
    "--target=node20",
    "--outfile=dist/index.mjs",
    "--banner:js=#!/usr/bin/env node",
    "--external:better-sqlite3",
    "--external:commander",
    "--external:drizzle-orm",
    "--external:drizzle-orm/*",
  ],
  { cwd: packageRoot, stdio: "inherit" },
)

const migrationsSource = resolve(repoRoot, "packages/db/migrations")
if (!existsSync(migrationsSource)) {
  throw new Error(`Migrations source not found: ${migrationsSource}`)
}

cpSync(migrationsSource, resolve(distDir, "migrations"), { recursive: true })
chmodSync(resolve(distDir, "index.mjs"), 0o755)

cpSync(distDir, npmDistDir, { recursive: true })
cpSync(resolve(packageRoot, "README.md"), resolve(npmDir, "README.md"))

const sourcePackage = JSON.parse(readFileSync(resolve(packageRoot, "package.json"), "utf8"))
const publishPackage = {
  name: sourcePackage.name,
  version: sourcePackage.version,
  description: sourcePackage.description,
  license: sourcePackage.license,
  type: "module",
  main: "./dist/index.mjs",
  exports: {
    ".": "./dist/index.mjs",
  },
  bin: {
    "flowm-cli": "dist/index.mjs",
  },
  files: ["dist", "README.md"],
  publishConfig: {
    access: "public",
  },
  dependencies: {
    "better-sqlite3": sourcePackage.dependencies["better-sqlite3"],
    commander: sourcePackage.dependencies.commander,
    "drizzle-orm": sourcePackage.dependencies["drizzle-orm"],
  },
}

writeFileSync(resolve(npmDir, "package.json"), `${JSON.stringify(publishPackage, null, 2)}\n`)
