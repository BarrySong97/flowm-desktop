/**
 * @purpose Own Flowm ledger files and the existing TypeScript data API inside the Tauri sidecar.
 * @role    Node-side ledger host behind the Tauri command boundary.
 * @deps    Node filesystem, better-sqlite3, Drizzle migrations, @flowm/api, and @flowm/db.
 * @gotcha  File picker and reveal operations remain native-shell work for FLOWM-8.
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, isAbsolute, join } from "node:path"
import type { Server } from "node:net"

import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { createFlowmApi, createFrankfurterFxProvider, type FlowmApi } from "@flowm/api"
import { seedDefaultCategories, seedPersonalStarterData } from "@flowm/api/default-seed"
import { schema, type Database as DrizzleDatabase } from "@flowm/db"
import type { LedgerChangeEvent } from "@flowm/shared/ipc"
import {
  startLocalLedgerChangeServer,
  type StartLocalLedgerChangeServerOptions,
} from "../main/local-ledger-change-server"
import type {
  ActiveLedger,
  LedgerListEntry,
  LedgerRecord,
  LedgerService,
} from "../main/trpc/ledger-service"

const PERSONAL_FILE = "flowm.sqlite3"
const DEMO_FILE = "flowm-demo.sqlite3"
const FORECAST_DAYS = 60
const MAX_PENDING_LEDGER_CHANGES = 100

type RendererLedgerChangeEvent = LedgerChangeEvent & { receivedAt: string }

interface LedgerRegistry {
  activeId: string
  ledgers: LedgerRecord[]
}

export interface TauriLedgerStoreOptions {
  userDataDir: string
  migrationsDir: string
  resourcesDir: string
  backgroundMaintenance?: boolean
  ledgerChangeServerStarter?: (
    options: StartLocalLedgerChangeServerOptions,
  ) => Promise<Server | null>
}

function nowIso(): string {
  return new Date().toISOString()
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDaysKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export class TauriLedgerStore implements LedgerService {
  private registry: LedgerRegistry | null = null
  private client: Database.Database | null = null
  private drizzleDb: DrizzleDatabase | null = null
  private api: FlowmApi | null = null
  private activeFilePath: string | null = null
  private ledgerChangeServer: Server | null = null
  private pendingLedgerChanges: RendererLedgerChangeEvent[] = []

  constructor(private readonly options: TauriLedgerStoreOptions) {}

  private registryPath(): string {
    return join(this.options.userDataDir, "flowm-ledgers.json")
  }

  private resolveFile(file: string): string {
    return isAbsolute(file) ? file : join(this.options.userDataDir, file)
  }

  async init(): Promise<void> {
    mkdirSync(this.options.userDataDir, { recursive: true })
    if (existsSync(this.registryPath())) {
      this.registry = JSON.parse(readFileSync(this.registryPath(), "utf8")) as LedgerRegistry
    } else {
      this.registry = await this.bootstrap()
      this.writeRegistry()
    }
    this.open(this.activeRecord())
    const startLedgerChangeServer =
      this.options.ledgerChangeServerStarter ?? startLocalLedgerChangeServer
    this.ledgerChangeServer = await startLedgerChangeServer({
      userDataDir: this.options.userDataDir,
      getActiveDbPath: () => this.activeFilePath,
      onLedgerChanged: (event) => {
        this.pendingLedgerChanges.push(event)
        if (this.pendingLedgerChanges.length > MAX_PENDING_LEDGER_CHANGES) {
          this.pendingLedgerChanges.shift()
        }
      },
      onListening: (socketPath) =>
        console.error("[flowm-sidecar] Local ledger-change socket listening:", socketPath),
    })
  }

  private async bootstrap(): Promise<LedgerRegistry> {
    const personalPath = this.resolveFile(PERSONAL_FILE)
    const personalExisted = existsSync(personalPath)
    const demoPath = this.resolveFile(DEMO_FILE)
    const demoResourcePath = join(this.options.resourcesDir, DEMO_FILE)

    if (!existsSync(demoPath) && existsSync(demoResourcePath)) {
      copyFileSync(demoResourcePath, demoPath)
    }
    if (!personalExisted) {
      await this.createLedgerFile(personalPath, true)
    }

    const personal: LedgerRecord = {
      id: crypto.randomUUID(),
      name: "我的账本",
      file: PERSONAL_FILE,
      isDemo: false,
      createdAt: nowIso(),
    }
    const demo: LedgerRecord = {
      id: "demo",
      name: "示例账本",
      file: DEMO_FILE,
      isDemo: true,
      createdAt: nowIso(),
    }

    return {
      activeId: personalExisted || !existsSync(demoPath) ? personal.id : demo.id,
      ledgers: [personal, demo],
    }
  }

  private async createLedgerFile(absPath: string, seedStarterData: boolean): Promise<void> {
    mkdirSync(dirname(absPath), { recursive: true })
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    const db = drizzle(client, { schema })
    migrate(db, { migrationsFolder: this.options.migrationsDir })
    if (seedStarterData) {
      await seedDefaultCategories(db)
      await seedPersonalStarterData(db)
    }
    client.close()
  }

  private open(record: LedgerRecord): void {
    this.closeConnection()
    const absPath = this.resolveFile(record.file)
    mkdirSync(dirname(absPath), { recursive: true })
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    this.client = client
    this.drizzleDb = drizzle(client, { schema })
    migrate(this.drizzleDb, { migrationsFolder: this.options.migrationsDir })
    const api = createFlowmApi(this.drizzleDb, { fxProvider: createFrankfurterFxProvider() })
    this.api = api
    this.activeFilePath = absPath

    if (this.options.backgroundMaintenance !== false) {
      void api.refreshExchangeRates().catch(() => {})
      const throughDate = addDaysKey(localDateKey(), FORECAST_DAYS)
      void api.generateLoanPaymentOccurrences({ throughDate }).catch(() => {})
    }
  }

  close(): void {
    this.ledgerChangeServer?.close()
    this.ledgerChangeServer = null
    this.closeConnection()
  }

  private closeConnection(): void {
    this.api = null
    this.drizzleDb = null
    this.client?.close()
    this.client = null
  }

  drainLedgerChanges(): RendererLedgerChangeEvent[] {
    return this.pendingLedgerChanges.splice(0)
  }

  private writeRegistry(): void {
    writeFileSync(this.registryPath(), JSON.stringify(this.registry, null, 2), "utf8")
  }

  private requireRegistry(): LedgerRegistry {
    if (this.registry == null) throw new Error("LedgerStore not initialized")
    return this.registry
  }

  private activeRecord(): LedgerRecord {
    const registry = this.requireRegistry()
    return registry.ledgers.find((ledger) => ledger.id === registry.activeId) ?? registry.ledgers[0]
  }

  private recordById(id: string): LedgerRecord {
    const record = this.requireRegistry().ledgers.find((ledger) => ledger.id === id)
    if (record == null) throw new Error(`Ledger ${id} not found`)
    return record
  }

  getApi(): FlowmApi {
    if (this.api == null) this.open(this.activeRecord())
    return this.api!
  }

  getActiveFilePath(): string | null {
    return this.activeFilePath
  }

  databaseExists(): boolean {
    return this.activeFilePath != null && existsSync(this.activeFilePath)
  }

  list(): LedgerListEntry[] {
    const registry = this.requireRegistry()
    return registry.ledgers.map((ledger) => ({
      id: ledger.id,
      name: ledger.name,
      isDemo: ledger.isDemo,
      active: ledger.id === registry.activeId,
    }))
  }

  getActive(): ActiveLedger {
    const record = this.activeRecord()
    return { id: record.id, name: record.name, isDemo: record.isDemo }
  }

  switchTo(id: string): void {
    const record = this.recordById(id)
    this.requireRegistry().activeId = id
    this.open(record)
    this.writeRegistry()
  }

  switchToPersonal(): void {
    const personal = this.requireRegistry().ledgers.find((ledger) => !ledger.isDemo)
    if (personal == null) throw new Error("No personal ledger available")
    this.switchTo(personal.id)
  }

  async create(name: string): Promise<LedgerRecord> {
    const id = crypto.randomUUID()
    const file = `ledger-${id}.sqlite3`
    await this.createLedgerFile(this.resolveFile(file), true)
    const record: LedgerRecord = {
      id,
      name: name.trim() || "新账本",
      file,
      isDemo: false,
      createdAt: nowIso(),
    }
    this.requireRegistry().ledgers.push(record)
    this.writeRegistry()
    return record
  }

  async importFromFile(): Promise<LedgerRecord | null> {
    throw new Error("Tauri 账本文件选择将在 FLOWM-8 接入")
  }

  importFromPath(absPath: string): LedgerRecord {
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    migrate(drizzle(client, { schema }), { migrationsFolder: this.options.migrationsDir })
    client.close()
    const record: LedgerRecord = {
      id: crypto.randomUUID(),
      name: basename(absPath),
      file: absPath,
      isDemo: false,
      createdAt: nowIso(),
    }
    this.requireRegistry().ledgers.push(record)
    this.writeRegistry()
    return record
  }

  ledgerPath(id: string): string {
    return this.resolveFile(this.recordById(id).file)
  }

  rename(id: string, name: string): void {
    this.recordById(id).name = name.trim() || "未命名账本"
    this.writeRegistry()
  }

  remove(id: string): void {
    const registry = this.requireRegistry()
    if (id === registry.activeId) throw new Error("无法删除当前正在使用的账本，请先切换到其他账本")
    if (registry.ledgers.length <= 1) throw new Error("至少需要保留一个账本")
    const record = this.recordById(id)
    registry.ledgers = registry.ledgers.filter((ledger) => ledger.id !== id)
    this.writeRegistry()
    if (!isAbsolute(record.file)) {
      const absPath = this.resolveFile(record.file)
      rmSync(absPath, { force: true })
      rmSync(`${absPath}-wal`, { force: true })
      rmSync(`${absPath}-shm`, { force: true })
    }
  }

  setDemo(id: string, isDemo: boolean): void {
    this.recordById(id).isDemo = isDemo
    this.writeRegistry()
  }

  revealInFinder(id: string): void {
    throw new Error(`Tauri 文件定位必须由原生壳执行：${basename(this.ledgerPath(id))}`)
  }
}
