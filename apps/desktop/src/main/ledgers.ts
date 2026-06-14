/**
 * @purpose Resolve and switch between the primary user ledger and packaged demo ledger files.
 * @role    Main-process ledger path helper used before API/database services are exposed.
 * @deps    Node fs/path, Electron app paths, and packaged resources.
 * @gotcha  Never silently replace the user ledger with demo data; switching must be explicit.
 */

import { app, BrowserWindow, dialog } from "electron"
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { basename, dirname, isAbsolute, join } from "node:path"
import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"

import { createFlowmApi, type FlowmApi } from "@flowm/api"
import { seedDefaultCategories } from "@flowm/api/default-seed"
import { schema, type Database as DrizzleDatabase } from "@flowm/db"

const PERSONAL_FILE = "flowm.sqlite3"
const DEMO_FILE = "flowm-demo.sqlite3"

export interface LedgerRecord {
  id: string
  name: string
  /** Filename relative to userData for built-in/created ledgers, or an absolute path for imports. */
  file: string
  isDemo: boolean
  createdAt: string
}

interface LedgerRegistry {
  activeId: string
  ledgers: LedgerRecord[]
}

export interface LedgerListEntry {
  id: string
  name: string
  isDemo: boolean
  active: boolean
}

export interface ActiveLedger {
  id: string
  name: string
  isDemo: boolean
}

function nowIso(): string {
  return new Date().toISOString()
}

export class LedgerStore {
  private registry: LedgerRegistry | null = null
  private client: Database.Database | null = null
  private drizzleDb: DrizzleDatabase | null = null
  private api: FlowmApi | null = null
  private activeFilePath: string | null = null

  // ---- paths -------------------------------------------------------------

  private userDataDir(): string {
    return app.getPath("userData")
  }

  private registryPath(): string {
    return join(this.userDataDir(), "flowm-ledgers.json")
  }

  private resolveFile(file: string): string {
    return isAbsolute(file) ? file : join(this.userDataDir(), file)
  }

  private migrationsFolder(): string {
    if (app.isPackaged) {
      return join(process.resourcesPath, "migrations")
    }
    return join(app.getAppPath(), "../../packages/db/migrations")
  }

  private demoResourcePath(): string {
    if (app.isPackaged) {
      return join(process.resourcesPath, DEMO_FILE)
    }
    return join(app.getAppPath(), "resources", DEMO_FILE)
  }

  // ---- lifecycle ---------------------------------------------------------

  async init(): Promise<void> {
    mkdirSync(this.userDataDir(), { recursive: true })
    if (existsSync(this.registryPath())) {
      this.registry = JSON.parse(readFileSync(this.registryPath(), "utf8")) as LedgerRegistry
    } else {
      this.registry = await this.bootstrap()
      this.writeRegistry()
    }
    this.open(this.activeRecord())
  }

  /** First launch: materialize both built-in ledgers up front (never lazily on switch). */
  private async bootstrap(): Promise<LedgerRegistry> {
    const personalPath = this.resolveFile(PERSONAL_FILE)
    const personalExisted = existsSync(personalPath)

    // Demo: copy the bundled prebuilt sample ledger into userData.
    const demoPath = this.resolveFile(DEMO_FILE)
    if (!existsSync(demoPath) && existsSync(this.demoResourcePath())) {
      copyFileSync(this.demoResourcePath(), demoPath)
    }

    // Personal: create an empty, migrated, category-seeded ledger (unless one already exists).
    if (!personalExisted) {
      await this.createLedgerFile(personalPath, true)
    }

    const personal: LedgerRecord = { id: crypto.randomUUID(), name: "我的账本", file: PERSONAL_FILE, isDemo: false, createdAt: nowIso() }
    const demo: LedgerRecord = { id: "demo", name: "示例账本", file: DEMO_FILE, isDemo: true, createdAt: nowIso() }

    return {
      // Existing users (legacy flowm.sqlite3 present) keep their data active; fresh installs start on the demo.
      activeId: personalExisted ? personal.id : demo.id,
      ledgers: [personal, demo],
    }
  }

  /** Create a brand-new ledger file: migrate the schema and optionally seed default categories. */
  private async createLedgerFile(absPath: string, seedCategories: boolean): Promise<void> {
    mkdirSync(dirname(absPath), { recursive: true })
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    const db = drizzle(client, { schema })
    migrate(db, { migrationsFolder: this.migrationsFolder() })
    if (seedCategories) await seedDefaultCategories(db)
    client.close()
  }

  /** Open (or re-open) a ledger as the live connection and rebuild the FlowmApi. */
  private open(record: LedgerRecord): void {
    this.close()
    const absPath = this.resolveFile(record.file)
    mkdirSync(dirname(absPath), { recursive: true })
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    this.client = client
    this.drizzleDb = drizzle(client, { schema })
    migrate(this.drizzleDb, { migrationsFolder: this.migrationsFolder() })
    this.api = createFlowmApi(this.drizzleDb)
    this.activeFilePath = absPath
  }

  close(): void {
    this.api = null
    this.drizzleDb = null
    this.client?.close()
    this.client = null
  }

  private writeRegistry(): void {
    writeFileSync(this.registryPath(), JSON.stringify(this.registry, null, 2), "utf8")
  }

  // ---- accessors ---------------------------------------------------------

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

  list(): LedgerListEntry[] {
    const registry = this.requireRegistry()
    return registry.ledgers.map((ledger) => ({ id: ledger.id, name: ledger.name, isDemo: ledger.isDemo, active: ledger.id === registry.activeId }))
  }

  getActive(): ActiveLedger {
    const record = this.activeRecord()
    return { id: record.id, name: record.name, isDemo: record.isDemo }
  }

  // ---- mutations ---------------------------------------------------------

  switchTo(id: string): void {
    const record = this.recordById(id)
    this.requireRegistry().activeId = id
    this.open(record)
    this.writeRegistry()
  }

  /** Switch to the built-in personal ledger (the first non-demo ledger). Used by the banner CTA. */
  switchToPersonal(): void {
    const personal = this.requireRegistry().ledgers.find((ledger) => !ledger.isDemo)
    if (personal == null) throw new Error("No personal ledger available")
    this.switchTo(personal.id)
  }

  async create(name: string): Promise<LedgerRecord> {
    const id = crypto.randomUUID()
    const file = `ledger-${id}.sqlite3`
    await this.createLedgerFile(this.resolveFile(file), true)
    const record: LedgerRecord = { id, name: name.trim() || "新账本", file, isDemo: false, createdAt: nowIso() }
    this.requireRegistry().ledgers.push(record)
    this.writeRegistry()
    return record
  }

  async importFromFile(): Promise<LedgerRecord | null> {
    const options = {
      title: "导入账本",
      properties: ["openFile" as const],
      filters: [{ name: "SQLite", extensions: ["sqlite3", "sqlite", "db"] }],
    }
    const focused = BrowserWindow.getFocusedWindow()
    const result = focused ? await dialog.showOpenDialog(focused, options) : await dialog.showOpenDialog(options)
    if (result.canceled || result.filePaths.length === 0) return null
    const absPath = result.filePaths[0]
    // Bring an existing database up to the current schema; references the file in place.
    const client = new Database(absPath)
    client.pragma("foreign_keys = ON")
    migrate(drizzle(client, { schema }), { migrationsFolder: this.migrationsFolder() })
    client.close()
    const record: LedgerRecord = { id: crypto.randomUUID(), name: basename(absPath), file: absPath, isDemo: false, createdAt: nowIso() }
    this.requireRegistry().ledgers.push(record)
    this.writeRegistry()
    return record
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
    // Delete the underlying file only for internal (userData-relative) ledgers; never touch imported externals.
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
}
