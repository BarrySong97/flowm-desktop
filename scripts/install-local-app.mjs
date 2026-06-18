#!/usr/bin/env node
/**
 * @purpose Package FlowM Desktop and install the built app on the local machine.
 * @role    Developer convenience script wrapping electron-builder output installation.
 * @deps    Node child_process/fs/path and the repository pnpm package script.
 * @gotcha  This installs the app bundle only; user data under Application Support is untouched.
 */

import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { spawnSync } from "node:child_process"

const __dirname = dirname(fileURLToPath(import.meta.url))
const repoRoot = join(__dirname, "..")
const appName = "FlowM.app"
const installPath = `/Applications/${appName}`

function printHelp() {
  console.log(`Usage: pnpm install:local [--open] [--restart]

Build and install FlowM Desktop on this Mac.

Options:
  --open       Open FlowM after installing.
  --restart   Quit FlowM before installing, then open it after installing.
  --help      Show this help.
`)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: "inherit",
    ...options,
  })
  if (result.error) {
    throw result.error
  }
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`)
  }
}

function findBuiltApp() {
  const candidates =
    process.arch === "arm64"
      ? ["apps/desktop/release/mac-arm64/FlowM.app", "apps/desktop/release/mac/FlowM.app"]
      : ["apps/desktop/release/mac/FlowM.app", "apps/desktop/release/mac-arm64/FlowM.app"]

  for (const candidate of candidates) {
    const fullPath = join(repoRoot, candidate)
    if (existsSync(fullPath)) return fullPath
  }

  throw new Error(`Built ${appName} was not found under apps/desktop/release`)
}

function quitAppIfRequested(shouldRestart) {
  if (!shouldRestart) return
  run("osascript", [
    "-e",
    'tell application "System Events" to if exists process "FlowM" then tell application "FlowM" to quit',
  ])
}

function openAppIfRequested(shouldOpen) {
  if (!shouldOpen) return
  run("open", ["-a", installPath])
}

function main() {
  const args = new Set(process.argv.slice(2))
  if (args.has("--help")) {
    printHelp()
    return
  }
  if (process.platform !== "darwin") {
    throw new Error("Local app installation is currently implemented for macOS only.")
  }

  const unknown = [...args].filter((arg) => !["--open", "--restart"].includes(arg))
  if (unknown.length > 0) {
    throw new Error(`Unknown option: ${unknown.join(", ")}`)
  }

  const shouldRestart = args.has("--restart")
  const shouldOpen = shouldRestart || args.has("--open")

  run("pnpm", ["package"])
  const builtApp = findBuiltApp()

  quitAppIfRequested(shouldRestart)
  run("ditto", [builtApp, installPath])
  openAppIfRequested(shouldOpen)

  console.log(`Installed ${builtApp} -> ${installPath}`)
  if (!shouldOpen) {
    console.log("Run `open -a /Applications/FlowM.app` to launch the installed app.")
  }
}

try {
  main()
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
}
