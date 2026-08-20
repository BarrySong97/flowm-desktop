/**
 * @purpose Install the renderer-visible desktop bridge before React mounts.
 * @role    Tauri adapter exposing native commands through a browser-safe window contract.
 * @deps    Tauri command/app APIs and browser platform detection.
 * @gotcha  Keep data behind the narrow Rust command boundary; never import Node or SQLite here.
 */

import type { LedgerChangeEvent } from "@flowm/shared/ipc"
import type { Update } from "@tauri-apps/plugin-updater"

const LEDGER_CHANGE_POLL_MS = 1_000
type RendererLedgerChangeEvent = LedgerChangeEvent & { receivedAt: string }
type RendererUpdateProgress = Parameters<Window["flowm"]["installUpdate"]>[0]

let pendingUpdate: Update | null = null

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
    checkForUpdate: async () => {
      if (!import.meta.env.PROD) {
        throw new Error("自动更新仅在正式安装版中可用")
      }

      await pendingUpdate?.close().catch(() => {})
      const { check } = await import("@tauri-apps/plugin-updater")
      pendingUpdate = await check()
      if (!pendingUpdate) return null

      return {
        currentVersion: pendingUpdate.currentVersion,
        version: pendingUpdate.version,
        date: pendingUpdate.date ?? null,
        body: pendingUpdate.body ?? null,
      }
    },
    installUpdate: async (onProgress: RendererUpdateProgress) => {
      if (!pendingUpdate) {
        throw new Error("没有可安装的更新，请先检查更新")
      }

      const update = pendingUpdate
      await update.downloadAndInstall((progress) => {
        if (progress.event === "Started") {
          onProgress({ event: "started", contentLength: progress.data.contentLength ?? null })
        } else if (progress.event === "Progress") {
          onProgress({ event: "progress", chunkLength: progress.data.chunkLength })
        } else {
          onProgress({ event: "finished" })
        }
      })

      pendingUpdate = null
      await update.close().catch(() => {})
      const { relaunch } = await import("@tauri-apps/plugin-process")
      await relaunch()
    },
    openDownloadPage: async () => {
      const { openUrl } = await import("@tauri-apps/plugin-opener")
      await openUrl("https://github.com/BarrySong97/flowm-desktop/releases/latest")
    },
  }
}
