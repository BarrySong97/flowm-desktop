/**
 * @purpose Install the renderer-visible desktop bridge before React mounts.
 * @role    Tauri adapter exposing native commands through a browser-safe window contract.
 * @deps    Tauri command/app APIs and browser platform detection.
 * @gotcha  Keep data behind the narrow Rust command boundary; never import Node or SQLite here.
 */

import type { LedgerChangeEvent } from "@flowm/shared/ipc"

const LEDGER_CHANGE_POLL_MS = 1_000
type RendererLedgerChangeEvent = LedgerChangeEvent & { receivedAt: string }

function platform(): Window["flowm"]["platform"] {
  const userAgent = navigator.userAgent.toLowerCase()
  const isMac = userAgent.includes("mac")
  const isWindows = userAgent.includes("windows")
  const isLinux = !isMac && !isWindows

  return {
    isMac,
    isWindows,
    isLinux,
    name: isMac ? "darwin" : isWindows ? "win32" : "linux",
  }
}

async function invokeTauri<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import("@tauri-apps/api/core")
  return invoke<T>(command, args)
}

type DesktopTrpcRequest = Parameters<Window["flowm"]["trpcRequest"]>[0]

async function tauriTrpcRequest(request: DesktopTrpcRequest): Promise<unknown> {
  if (request.type === "mutation" && request.path === "ledgers.importFromFile") {
    const { open } = await import("@tauri-apps/plugin-dialog")
    const path = await open({
      title: "导入账本",
      multiple: false,
      directory: false,
      fileAccessMode: "scoped",
      filters: [{ name: "SQLite", extensions: ["sqlite3", "sqlite", "db"] }],
    })
    if (path == null) return { ok: true, data: null }
    const data = await invokeTauri("import_ledger", { path })
    return { ok: true, data }
  }

  if (request.type === "mutation" && request.path === "ledgers.reveal") {
    const id = (request.input as { id?: unknown } | null)?.id
    if (typeof id !== "string" || id.length === 0) {
      throw new Error("显示账本文件需要有效的账本 ID")
    }
    const path = await invokeTauri<string>("ledger_path", { id })
    const { revealItemInDir } = await import("@tauri-apps/plugin-opener")
    await revealItemInDir(path)
    return { ok: true, data: null }
  }

  return invokeTauri("trpc_request", { request })
}

export function installDesktopRuntimeBridge(): void {
  if (Object.prototype.hasOwnProperty.call(window, "flowm")) return

  if (!("__TAURI_INTERNALS__" in window)) {
    throw new Error("Flowm desktop bridge is unavailable outside Tauri")
  }

  window.flowm = {
    platform: platform(),
    getDatabasePath: () => invokeTauri<string | null>("get_database_path"),
    databaseExists: () => invokeTauri<boolean>("database_exists"),
    trpcRequest: tauriTrpcRequest,
    onLedgerChanged: (callback) => {
      let active = true
      let polling = false
      const poll = async () => {
        if (!active || polling) return
        polling = true
        try {
          const events = await invokeTauri<RendererLedgerChangeEvent[]>("drain_ledger_changes")
          if (active) events.forEach(callback)
        } catch {
          // Refresh hints are best-effort; the next poll retries while subscribed.
        } finally {
          polling = false
        }
      }
      const timer = window.setInterval(() => void poll(), LEDGER_CHANGE_POLL_MS)
      void poll()
      return () => {
        active = false
        window.clearInterval(timer)
      }
    },
    getAppVersion: async () => {
      const { getVersion } = await import("@tauri-apps/api/app")
      return getVersion()
    },
    openDownloadPage: async () => {
      const { openUrl } = await import("@tauri-apps/plugin-opener")
      await openUrl("https://github.com/BarrySong97/flowm-desktop/releases/latest")
    },
  }
}
