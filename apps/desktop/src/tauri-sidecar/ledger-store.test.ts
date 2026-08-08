/**
 * @purpose Verify the Tauri sidecar reuses Flowm's data API and local refresh protocol.
 * @role    Integration regression for isolated SQLite, tRPC reads/writes, and CLI refresh hints.
 * @deps    Vitest, Node sockets, shared IPC/tRPC contracts, and TauriLedgerStore.
 * @gotcha  Run through Node 22 so better-sqlite3 matches the packaged sidecar ABI.
 */

import { mkdtempSync, mkdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"

import { afterEach, describe, expect, it } from "vitest"
import type { LedgerChangeEvent } from "@flowm/shared/ipc"

import { createDesktopTrpcHandler } from "../main/trpc/transport"
import { TauriLedgerStore } from "./ledger-store"

const temporaryDirectories: string[] = []

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true })
  }
})

describe("TauriLedgerStore", () => {
  it("serves existing tRPC reads and writes through one isolated SQLite ledger", async () => {
    const root = mkdtempSync(join(tmpdir(), "flowm-tauri-sidecar-test-"))
    temporaryDirectories.push(root)
    const resourcesDir = join(root, "resources")
    mkdirSync(resourcesDir)
    let emitLedgerChange: ((event: LedgerChangeEvent & { receivedAt: string }) => void) | null =
      null

    const store = new TauriLedgerStore({
      userDataDir: join(root, "user-data"),
      migrationsDir: resolve(import.meta.dirname, "../../../../packages/db/migrations"),
      resourcesDir,
      backgroundMaintenance: false,
      ledgerChangeServerStarter: async (options) => {
        emitLedgerChange = options.onLedgerChanged
        return null
      },
    })
    try {
      await store.init()

      expect(store.databaseExists()).toBe(true)
      expect(store.getActive()).toMatchObject({ name: "我的账本", isDemo: false })

      const request = createDesktopTrpcHandler(
        () => ({ api: store.getApi(), ledgers: store }),
        "test-sidecar",
      )
      const created = await request({
        type: "mutation",
        path: "reference.createCategory",
        input: { name: "Tauri Bridge Test", categoryKind: "expense" },
      })
      expect(created.ok).toBe(true)

      const listed = await request({
        type: "query",
        path: "reference.categories",
        input: { categoryKind: "expense" },
      })
      expect(listed.ok).toBe(true)
      if (listed.ok) {
        expect(listed.data).toEqual(
          expect.arrayContaining([expect.objectContaining({ name: "Tauri Bridge Test" })]),
        )
      }

      const dbPath = store.getActiveFilePath()!
      const event: LedgerChangeEvent = {
        type: "ledger.changed",
        dbPath,
        source: "flowm-cli",
        command: "tauri-sidecar-test",
        pid: process.pid,
        changedAt: new Date().toISOString(),
      }
      expect(emitLedgerChange).not.toBeNull()
      emitLedgerChange!({ ...event, receivedAt: new Date().toISOString() })
      expect(store.drainLedgerChanges()).toEqual([
        expect.objectContaining({ command: "tauri-sidecar-test", dbPath }),
      ])
    } finally {
      store.close()
    }
  })
})
