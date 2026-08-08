#!/usr/bin/env node
/**
 * @purpose Package FlowM's Node data process using Tauri's target-specific sidecar naming.
 * @role    Build-time bridge from Rust host triples to @yao-pkg/pkg targets.
 * @deps    rustc, pnpm, @yao-pkg/pkg, and the prebuilt dist-sidecar/index.cjs entry.
 * @gotcha  Build each OS/architecture on its matching runner because better-sqlite3 is native.
 */

import { execFileSync } from "node:child_process"
import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const desktopDir = join(scriptDir, "..")
const targetTriple = execFileSync("rustc", ["--print", "host-tuple"], {
  encoding: "utf8",
}).trim()

const pkgTarget = pkgTargetFor(targetTriple)
const extension = targetTriple.includes("windows") ? ".exe" : ""
const outputDir = join(desktopDir, "src-tauri", "binaries")
const output = join(outputDir, `flowm-sidecar-${targetTriple}${extension}`)
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm"

mkdirSync(outputDir, { recursive: true })
execFileSync(
  pnpm,
  [
    "exec",
    "pkg",
    "dist-sidecar/index.cjs",
    "--config",
    "pkg.sidecar.config.cjs",
    "--target",
    pkgTarget,
    "--output",
    output,
  ],
  { cwd: desktopDir, stdio: "inherit" },
)

console.log(`Built Tauri sidecar: ${output}`)

function pkgTargetFor(triple) {
  const architecture = triple.startsWith("aarch64-")
    ? "arm64"
    : triple.startsWith("x86_64-")
      ? "x64"
      : null
  const platform = triple.includes("apple-darwin")
    ? "macos"
    : triple.includes("pc-windows")
      ? "win"
      : triple.includes("unknown-linux-gnu")
        ? "linux"
        : null

  if (!architecture || !platform) {
    throw new Error(`Unsupported Tauri sidecar target: ${triple}`)
  }
  if (Number(process.versions.node.split(".")[0]) !== 22) {
    throw new Error(`FlowM sidecars must be built with Node 22; found ${process.version}`)
  }
  return `node22-${platform}-${architecture}`
}
