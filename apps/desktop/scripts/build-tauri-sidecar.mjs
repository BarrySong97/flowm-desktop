#!/usr/bin/env node
/**
 * @purpose Package FlowM's Node data process using Tauri's target-specific sidecar naming.
 * @role    Build-time bridge from Rust host triples to the @yao-pkg/pkg JavaScript CLI.
 * @deps    rustc, pnpm, @yao-pkg/pkg, and the prebuilt dist-sidecar/index.cjs entry.
 * @gotcha  Build on the matching runner; invoke pkg through Node, not Windows command shims.
 */

import { execFileSync } from "node:child_process"
import { mkdirSync, readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptDir = dirname(fileURLToPath(import.meta.url))
const desktopDir = join(scriptDir, "..")
const require = createRequire(import.meta.url)

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main()
}

function main() {
  const targetTriple = execFileSync("rustc", ["--print", "host-tuple"], {
    encoding: "utf8",
  }).trim()
  const { output, outputDir, pkgArgs } = sidecarBuildSpec(targetTriple)

  mkdirSync(outputDir, { recursive: true })
  execFileSync(process.execPath, pkgArgs, { cwd: desktopDir, stdio: "inherit" })

  console.log(`Built Tauri sidecar: ${output}`)
}

export function sidecarBuildSpec(targetTriple, nodeVersion = process.versions.node) {
  const pkgTarget = pkgTargetFor(targetTriple, nodeVersion)
  const extension = targetTriple.includes("windows") ? ".exe" : ""
  const outputDir = join(desktopDir, "src-tauri", "binaries")
  const output = join(outputDir, `flowm-sidecar-${targetTriple}${extension}`)

  return {
    output,
    outputDir,
    pkgArgs: [
      resolvePkgCli(),
      "dist-sidecar/index.cjs",
      "--config",
      "pkg.sidecar.config.cjs",
      "--target",
      pkgTarget,
      "--output",
      output,
    ],
  }
}

export function pkgTargetFor(triple, nodeVersion = process.versions.node) {
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
  if (Number(nodeVersion.split(".")[0]) !== 22) {
    throw new Error(`FlowM sidecars must be built with Node 22; found ${nodeVersion}`)
  }
  return `node22-${platform}-${architecture}`
}

function resolvePkgCli() {
  const packageJsonPath = require.resolve("@yao-pkg/pkg/package.json")
  const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"))
  const binPath = typeof packageJson.bin === "string" ? packageJson.bin : packageJson.bin?.pkg

  if (!binPath) throw new Error("@yao-pkg/pkg does not expose the pkg CLI")
  return resolve(dirname(packageJsonPath), binPath)
}
