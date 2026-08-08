/**
 * @purpose Host Flowm's existing tRPC and SQLite stack as a long-lived Tauri sidecar.
 * @role    Newline-delimited JSON process boundary behind narrow Rust commands.
 * @deps    Node readline, the runtime-neutral tRPC transport, and TauriLedgerStore.
 * @gotcha  Stdout is protocol-only; diagnostics must be written to stderr.
 */

import { createInterface } from "node:readline"

import { createDesktopTrpcHandler, type DesktopTrpcRequest } from "../main/trpc/transport"
import { TauriLedgerStore } from "./ledger-store"

type SidecarRequest = {
  id: number
  action:
    | "trpc"
    | "databasePath"
    | "databaseExists"
    | "drainLedgerChanges"
    | "importLedger"
    | "ledgerPath"
  payload?: unknown
}

type SidecarResponse =
  | { id: number; ok: true; data: unknown }
  | { id: number; ok: false; error: { message: string } }

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required sidecar environment: ${name}`)
  return value
}

function writeProtocol(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value)}\n`)
}

function serializeError(error: unknown): { message: string } {
  return { message: error instanceof Error ? error.message : String(error) }
}

function requiredStringPayload(request: SidecarRequest): string {
  if (typeof request.payload !== "string" || request.payload.length === 0) {
    throw new Error(`${request.action} requires a non-empty string payload`)
  }
  return request.payload
}

async function main(): Promise<void> {
  const ledgerStore = new TauriLedgerStore({
    userDataDir: requiredEnvironment("FLOWM_SIDECAR_USER_DATA_DIR"),
    migrationsDir: requiredEnvironment("FLOWM_SIDECAR_MIGRATIONS_DIR"),
    resourcesDir: requiredEnvironment("FLOWM_SIDECAR_RESOURCES_DIR"),
  })
  await ledgerStore.init()

  const handleTrpc = createDesktopTrpcHandler(
    () => ({ api: ledgerStore.getApi(), ledgers: ledgerStore }),
    "sidecar",
  )
  writeProtocol({ kind: "ready" })

  const lines = createInterface({ input: process.stdin, crlfDelay: Infinity })
  for await (const line of lines) {
    let request: SidecarRequest
    try {
      request = JSON.parse(line) as SidecarRequest
    } catch (error) {
      console.error("[flowm-sidecar] Invalid JSON request", error)
      continue
    }

    let response: SidecarResponse
    try {
      let data: unknown
      switch (request.action) {
        case "trpc":
          data = await handleTrpc(request.payload as DesktopTrpcRequest)
          break
        case "databasePath":
          data = ledgerStore.getActiveFilePath()
          break
        case "databaseExists":
          data = ledgerStore.databaseExists()
          break
        case "drainLedgerChanges":
          data = ledgerStore.drainLedgerChanges()
          break
        case "importLedger":
          data = ledgerStore.importFromPath(requiredStringPayload(request))
          break
        case "ledgerPath":
          data = ledgerStore.ledgerPath(requiredStringPayload(request))
          break
      }
      response = { id: request.id, ok: true, data }
    } catch (error) {
      response = { id: request.id, ok: false, error: serializeError(error) }
    }
    writeProtocol(response)
  }

  ledgerStore.close()
}

void main().catch((error) => {
  writeProtocol({ kind: "fatal", error: serializeError(error) })
  process.exitCode = 1
})
