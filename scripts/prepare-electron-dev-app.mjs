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

// APP_NAME is the space-free executable file name; APP_BUNDLE is the .app directory name
// (also space-free, distinct from production "FlowM.app" so macOS LaunchServices registers a
// separate app instead of serving the cached production name); APP_DISPLAY_NAME is the
// user-visible Dock/menu name and is intentionally different from production.
const APP_NAME = "FlowM"
const APP_BUNDLE = "FlowMDev"
const APP_DISPLAY_NAME = "FlowM Dev"
const BUNDLE_ID = "com.flowm.desktop.dev"

const repoRoot = dirname(fileURLToPath(import.meta.url))
const desktopDir = join(repoRoot, "..", "apps", "desktop")
const requireFromDesktop = createRequire(pathToFileURL(join(desktopDir, "package.json")))
const electronPackageRoot = dirname(requireFromDesktop.resolve("electron"))
const sourceApp = join(electronPackageRoot, "dist", "Electron.app")
const devAppDir = join(desktopDir, ".electron-dev")
const targetApp = join(devAppDir, `${APP_BUNDLE}.app`)
const sourceExecutable = join(targetApp, "Contents", "MacOS", "Electron")
const targetExecutable = join(targetApp, "Contents", "MacOS", APP_NAME)
const plistPath = join(targetApp, "Contents", "Info.plist")

const LSREGISTER =
  "/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/" +
  "LaunchServices.framework/Versions/A/Support/lsregister"

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

  // Wipe the whole dev-app dir so a stale bundle from an earlier name cannot linger.
  rmSync(devAppDir, { force: true, recursive: true })
  mkdirSync(devAppDir, { recursive: true })
  cpSync(sourceApp, targetApp, { recursive: true })
}

function refreshLaunchServices() {
  // Best-effort: force macOS to re-read the bundle name/identifier without a logout.
  try {
    execFileSync(LSREGISTER, ["-f", targetApp], { stdio: "ignore" })
  } catch {
    // Non-critical; the fresh, uniquely named bundle path already avoids the stale cache.
  }
}

function prepareMacApp() {
  ensureFreshDevApp()

  setPlistValue("CFBundleName", APP_DISPLAY_NAME)
  setPlistValue("CFBundleDisplayName", APP_DISPLAY_NAME)
  setPlistValue("CFBundleExecutable", APP_NAME)
  setPlistValue("CFBundleIdentifier", BUNDLE_ID)

  copyFileSync(sourceExecutable, targetExecutable)
  const mode = statSync(sourceExecutable).mode
  chmodSync(targetExecutable, mode & 0o777)

  refreshLaunchServices()

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
