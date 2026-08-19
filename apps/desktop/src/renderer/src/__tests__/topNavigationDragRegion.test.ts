/**
 * @purpose Prevent the persistent top navigation from swallowing the native window drag surface.
 * @role    Source-level regression sensor for the Tauri drag/no-drag boundary.
 * @deps    Node file reads and Vitest assertions.
 * @gotcha  Containers must remain draggable; only concrete links and buttons may opt out.
 */

import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const desktopRoot = existsSync(resolve(process.cwd(), "src-tauri"))
  ? process.cwd()
  : resolve(process.cwd(), "apps/desktop")

const source = readFileSync(
  resolve(desktopRoot, "src/renderer/src/components/layout/TopNavigation.tsx"),
  "utf8",
)
const titleBarSource = readFileSync(
  resolve(desktopRoot, "src/renderer/src/components/layout/TitleBar.tsx"),
  "utf8",
)
const rootRouteSource = readFileSync(
  resolve(desktopRoot, "src/renderer/src/routes/__root.tsx"),
  "utf8",
)
const desktopCapability = readFileSync(
  resolve(desktopRoot, "src-tauri/capabilities/default.json"),
  "utf8",
)
describe("top navigation drag region", () => {
  it("keeps navigation containers draggable and concrete controls interactive", () => {
    expect(source.match(/data-tauri-drag-region/g)).toHaveLength(3)
    expect(source).toMatch(/<header[\s\S]+?className="drag-region/)
    expect(source).toMatch(/<nav[\s\S]+?className="drag-region/)
    expect(source).not.toMatch(/<nav[^>]+no-drag-region/)
    expect(source).not.toMatch(/<div className="no-drag-region flex h-full items-center gap-1">/)
    expect(source.match(/no-drag-region/g)).toHaveLength(3)
  })

  it("makes the title bar the outermost CSS drag shell", () => {
    expect(rootRouteSource).toContain("<TitleBar>")
    expect(rootRouteSource).toContain("</TitleBar>")
    expect(titleBarSource).toContain("data-window-drag-handle")
    expect(titleBarSource).toContain("drag-region h-6 shrink-0")
    expect(titleBarSource).not.toContain("startDragging")
    expect(titleBarSource).not.toContain("@tauri-apps/api/window")
    expect(titleBarSource).not.toContain("no-drag-region")
    expect(desktopCapability).toContain("core:window:allow-start-dragging")
    expect(source).toContain("h-[52px]")
    expect(source).toContain("px-7")
  })
})
