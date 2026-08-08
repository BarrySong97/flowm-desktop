/**
 * @purpose Prevent Windows sidecar packaging from regressing to unsupported command shims.
 * @role    Unit coverage for host-triple mapping and the direct Node pkg CLI invocation.
 * @deps    Vitest, Node filesystem helpers, Tauri config, and build-tauri-sidecar.mjs.
 * @gotcha  Inspect the generated command only; do not package a native executable in this test.
 */

import { existsSync, readFileSync } from "node:fs"
import { basename, dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

import { pkgTargetFor, sidecarBuildSpec } from "./build-tauri-sidecar.mjs"

const desktopDir = join(dirname(fileURLToPath(import.meta.url)), "..")

describe("Tauri sidecar build command", () => {
  it("invokes the pkg JavaScript CLI directly for Windows", () => {
    const spec = sidecarBuildSpec("x86_64-pc-windows-msvc", "22.23.2")

    expect(basename(spec.pkgArgs[0])).toBe("bin.js")
    expect(spec.pkgArgs).toContain("node22-win-x64")
    expect(spec.output).toMatch(/flowm-sidecar-x86_64-pc-windows-msvc\.exe$/)
    expect(spec.pkgArgs).not.toContain("pnpm.cmd")
  })

  it("keeps the Node 22 packaging invariant", () => {
    expect(() => pkgTargetFor("aarch64-apple-darwin", "24.1.0")).toThrow(
      "FlowM sidecars must be built with Node 22; found 24.1.0",
    )
  })

  it("keeps the Windows resource icon required by tauri-build", () => {
    const iconPath = join(desktopDir, "src-tauri", "icons", "icon.ico")
    const tauriConfig = JSON.parse(
      readFileSync(join(desktopDir, "src-tauri", "tauri.conf.json"), "utf8"),
    )

    expect(existsSync(iconPath)).toBe(true)
    expect(tauriConfig.bundle.icon).toContain("icons/icon.ico")
  })
})
