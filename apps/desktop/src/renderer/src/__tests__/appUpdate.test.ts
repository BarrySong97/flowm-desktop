/**
 * @purpose Verify deterministic updater download progress calculation.
 * @role    Regression test for the shared renderer updater workflow.
 * @deps    Vitest and the app update helper.
 * @gotcha  Keep this test independent of a live Tauri runtime and release endpoint.
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"
import { updateProgressPercent } from "../lib/appUpdate"

const desktopRoot = existsSync(resolve(process.cwd(), "src-tauri"))
  ? process.cwd()
  : resolve(process.cwd(), "apps/desktop")

describe("updateProgressPercent", () => {
  it("returns a bounded whole-number percentage", () => {
    expect(updateProgressPercent({ downloaded: 25, contentLength: 100 })).toBe(25)
    expect(updateProgressPercent({ downloaded: 150, contentLength: 100 })).toBe(100)
  })

  it("returns null when the server does not report a usable length", () => {
    expect(updateProgressPercent({ downloaded: 25, contentLength: null })).toBeNull()
    expect(updateProgressPercent({ downloaded: 25, contentLength: 0 })).toBeNull()
  })
})

describe("Tauri updater configuration", () => {
  const tauriConfig = JSON.parse(
    readFileSync(resolve(desktopRoot, "src-tauri/tauri.conf.json"), "utf8"),
  )
  const capability = readFileSync(
    resolve(desktopRoot, "src-tauri/capabilities/default.json"),
    "utf8",
  )
  const rustSource = readFileSync(resolve(desktopRoot, "src-tauri/src/lib.rs"), "utf8")
  const rootRoute = readFileSync(resolve(desktopRoot, "src/renderer/src/routes/__root.tsx"), "utf8")
  const workflow = readFileSync(resolve(desktopRoot, "../../.github/workflows/release.yml"), "utf8")

  it("creates signed updater artifacts against the GitHub release feed", () => {
    expect(tauriConfig.bundle.createUpdaterArtifacts).toBe(true)
    expect(tauriConfig.plugins.updater.pubkey).toMatch(/^[A-Za-z0-9+/=]+$/)
    expect(tauriConfig.plugins.updater.endpoints).toEqual([
      "https://github.com/BarrySong97/flowm-desktop/releases/latest/download/latest.json",
    ])
  })

  it("registers only the updater and relaunch plugin capabilities used by the renderer", () => {
    expect(capability).toContain('"process:default"')
    expect(capability).toContain('"updater:default"')
    expect(rustSource).toContain("tauri_plugin_process::init()")
    expect(rustSource).toContain("tauri_plugin_updater::Builder::new().build()")
    expect(rootRoute).toContain("<AppUpdateTracker />")
  })

  it("requires the CI signing key and publishes updater metadata", () => {
    expect(workflow).toContain("TAURI_SIGNING_PRIVATE_KEY")
    expect(workflow).toContain("TAURI_SIGNING_PRIVATE_KEY_PASSWORD")
    expect(workflow).toContain("includeUpdaterJson: true")
    expect(workflow).toContain('for (const platform of ["darwin-aarch64", "windows-x86_64"])')
    expect(workflow).toContain("signature uses a different updater key")
  })
})
