#!/usr/bin/env node
/**
 * @purpose Prepare a branded macOS Electron app bundle for desktop development.
 * @role    Dev-time script used by the desktop package's electron-vite commands.
 * @deps    Electron npm package layout, macOS Info.plist tooling, and filesystem copy APIs.
 * @gotcha  Keep this dev-only bundle separate from production package metadata and user data paths.
 */

import { chmodSync, copyFileSync, cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { createRequire } from "node:module"
import { execFileSync } from "node:child_process"

const APP_NAME = "FlowM"
const BUNDLE_ID = "com.flowm.desktop.dev"

const repoRoot = dirname(fileURLToPath(import.meta.url))
const desktopDir = join(repoRoot, "..", "apps", "desktop")
const requireFromDesktop = createRequire(pathToFileURL(join(desktopDir, "package.json")))
const electronPackageRoot = dirname(requireFromDesktop.resolve("electron"))
const sourceApp = join(electronPackageRoot, "dist", "Electron.app")
const devAppDir = join(desktopDir, ".electron-dev")
const targetApp = join(devAppDir, `${APP_NAME}.app`)
const sourceExecutable = join(targetApp, "Contents", "MacOS", "Electron")
const targetExecutable = join(targetApp, "Contents", "MacOS", APP_NAME)
const plistPath = join(targetApp, "Contents", "Info.plist")

function runPlistBuddy(args) {
  execFileSync("/usr/libexec/PlistBuddy", ["-c", args, plistPath], {
    stdio: ["ignore", "ignore", "pipe"],
  })
}

function setPlistValue(key, value) {
  try {
    runPlistBuddy(`Set :${key} ${value}`)
  } catch {
    runPlistBuddy(`Add :${key} string ${value}`)
  }
}

function ensureFreshDevApp() {
  if (!existsSync(sourceApp)) {
    throw new Error(`Electron.app not found at ${sourceApp}`)
  }

  mkdirSync(devAppDir, { recursive: true })
  rmSync(targetApp, { force: true, recursive: true })
  cpSync(sourceApp, targetApp, { recursive: true })
}

function prepareMacApp() {
  ensureFreshDevApp()

  setPlistValue("CFBundleName", APP_NAME)
  setPlistValue("CFBundleDisplayName", APP_NAME)
  setPlistValue("CFBundleExecutable", APP_NAME)
  setPlistValue("CFBundleIdentifier", BUNDLE_ID)

  copyFileSync(sourceExecutable, targetExecutable)
  const mode = statSync(sourceExecutable).mode
  chmodSync(targetExecutable, mode & 0o777)

  return targetExecutable
}

function resolveDefaultElectronExecutable() {
  const electronExecutable = requireFromDesktop("electron")
  if (typeof electronExecutable !== "string") {
    throw new Error("Unable to resolve Electron executable path")
  }
  return electronExecutable
}

const executable =
  process.platform === "darwin" ? prepareMacApp() : resolveDefaultElectronExecutable()
process.stdout.write(executable)
