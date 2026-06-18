/**
 * @purpose Receive local ledger-change events from flowm-cli and notify renderer windows.
 * @role    Main-process local IPC server over Unix domain sockets or Windows named pipes.
 * @deps    Electron BrowserWindow, Node net/fs/path, and shared IPC contracts.
 * @gotcha  Socket events are best-effort refresh hints; database writes still go through API/CLI.
 */

import { BrowserWindow } from "electron"
import { chmodSync, existsSync, unlinkSync } from "node:fs"
import { createConnection, createServer, type Server, type Socket } from "node:net"
import { resolve } from "node:path"
import { getFlowmLedgerChangeSocketPath, type LedgerChangeEvent } from "@flowm/shared/ipc"

const LEDGER_CHANGED_CHANNEL = "flowm:ledger-changed"
const MAX_EVENT_BYTES = 64 * 1024
const STALE_SOCKET_PROBE_MS = 250

type StartLocalLedgerChangeServerOptions = {
  userDataDir: string
  getActiveDbPath: () => string | null
}

type ErrorWithCode = Error & { code?: string }

function isErrorWithCode(error: unknown): error is ErrorWithCode {
  return error instanceof Error && "code" in error
}

function normalizePath(path: string): string {
  const normalized = resolve(path)
  return process.platform === "win32" ? normalized.toLowerCase() : normalized
}

function isLedgerChangeEvent(value: unknown): value is LedgerChangeEvent {
  if (value == null || typeof value !== "object") return false
  const event = value as Partial<LedgerChangeEvent>
  return (
    event.type === "ledger.changed" &&
    typeof event.dbPath === "string" &&
    typeof event.source === "string" &&
    typeof event.command === "string" &&
    typeof event.pid === "number" &&
    typeof event.changedAt === "string"
  )
}

function isEventForActiveLedger(
  event: LedgerChangeEvent,
  getActiveDbPath: () => string | null,
): boolean {
  const activeDbPath = getActiveDbPath()
  if (activeDbPath == null) return false
  return normalizePath(event.dbPath) === normalizePath(activeDbPath)
}

function broadcastLedgerChange(event: LedgerChangeEvent): void {
  const payload = { ...event, receivedAt: new Date().toISOString() }
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send(LEDGER_CHANGED_CHANNEL, payload)
    }
  }
}

function handleSocket(socket: Socket, getActiveDbPath: () => string | null): void {
  let raw = ""
  socket.setEncoding("utf8")

  socket.on("data", (chunk) => {
    raw += chunk
    if (raw.length > MAX_EVENT_BYTES) {
      socket.destroy()
    }
  })

  socket.on("end", () => {
    const text = raw.trim()
    if (text.length === 0) return

    try {
      const parsed = JSON.parse(text) as unknown
      if (!isLedgerChangeEvent(parsed)) return
      if (!isEventForActiveLedger(parsed, getActiveDbPath)) return
      broadcastLedgerChange(parsed)
    } catch {
      // Invalid local IPC payloads are ignored. This socket is a refresh hint only.
    }
  })
}

function listen(server: Server, socketPath: string): Promise<void> {
  return new Promise((resolveListen, reject) => {
    const onError = (error: Error) => {
      cleanup()
      reject(error)
    }
    const onListening = () => {
      cleanup()
      resolveListen()
    }
    const cleanup = () => {
      server.off("error", onError)
      server.off("listening", onListening)
    }

    server.once("error", onError)
    server.once("listening", onListening)
    server.listen(socketPath)
  })
}

function canReplaceUnixSocket(socketPath: string): Promise<boolean> {
  if (process.platform === "win32" || !existsSync(socketPath)) {
    return Promise.resolve(false)
  }

  return new Promise((resolveProbe) => {
    const probe = createConnection(socketPath)
    let settled = false
    const finish = (canReplace: boolean) => {
      if (settled) return
      settled = true
      probe.destroy()
      resolveProbe(canReplace)
    }

    probe.setTimeout(STALE_SOCKET_PROBE_MS, () => finish(true))
    probe.once("connect", () => finish(false))
    probe.once("error", () => finish(true))
  })
}

function removeUnixSocket(socketPath: string): void {
  if (process.platform !== "win32" && existsSync(socketPath)) {
    unlinkSync(socketPath)
  }
}

export async function startLocalLedgerChangeServer({
  userDataDir,
  getActiveDbPath,
}: StartLocalLedgerChangeServerOptions): Promise<Server | null> {
  const socketPath = getFlowmLedgerChangeSocketPath({
    platform: process.platform,
    userDataDir,
  })
  const server = createServer((socket) => handleSocket(socket, getActiveDbPath))

  try {
    await listen(server, socketPath)
  } catch (error) {
    if (!isErrorWithCode(error) || error.code !== "EADDRINUSE") {
      console.warn("[flowm] Local ledger-change socket failed:", error)
      return null
    }

    if (!(await canReplaceUnixSocket(socketPath))) {
      console.warn("[flowm] Local ledger-change socket already in use:", socketPath)
      return null
    }

    removeUnixSocket(socketPath)
    try {
      await listen(server, socketPath)
    } catch (retryError) {
      console.warn("[flowm] Local ledger-change socket retry failed:", retryError)
      return null
    }
  }

  if (process.platform !== "win32") {
    try {
      chmodSync(socketPath, 0o600)
    } catch (error) {
      console.warn("[flowm] Could not restrict ledger-change socket permissions:", error)
    }
  }

  server.on("error", (error) => {
    console.warn("[flowm] Local ledger-change socket error:", error)
  })
  server.on("close", () => removeUnixSocket(socketPath))

  console.info("[flowm] Local ledger-change socket listening:", socketPath)
  return server
}
