/**
 * @purpose Provide a safe local CLI for agents to inspect and patch Flowm ledgers.
 * @role    Commander.js entry point over @flowm/api guarded business operations.
 * @deps    Commander.js, better-sqlite3, Drizzle migrations, @flowm/api, @flowm/db, and ledger registry paths.
 * @gotcha  This CLI accepts business patches only; it must not expose raw SQL or arbitrary table mutation.
 */

import { existsSync, readFileSync } from "node:fs"
import { createConnection } from "node:net"
import { homedir } from "node:os"
import { dirname, isAbsolute, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import BetterSqlite3 from "better-sqlite3"
import { Command, CommanderError, InvalidArgumentError, Option } from "commander"
import { drizzle } from "drizzle-orm/better-sqlite3"
import { migrate } from "drizzle-orm/better-sqlite3/migrator"
import {
  createFlowmApi,
  type AddAssetSnapshotInput,
  type AgentLedgerPatchInput,
  type CreateAssetItemInput,
  type FlowmApi,
  type FlowmId,
  type ListAssetItemsInput,
  type UpdateAssetItemInput,
  type UpdateAssetSnapshotInput,
} from "@flowm/api"
import { schema, type Database } from "@flowm/db"
import { getFlowmLedgerChangeSocketPath, type LedgerChangeEvent } from "@flowm/shared/ipc"

type ApiResult<T> = { success: true; data: T } | { success: false; error: string }

type LedgerRegistry = {
  activeId: string
  ledgers: Array<{ id: string; name: string; file: string; isDemo: boolean; createdAt: string }>
}

type GlobalOptions = {
  db?: string
}

type ResolvedLedgerPath = {
  dbPath: string
  activeLedger: LedgerRegistry["ledgers"][number] | null
  explicit: boolean
  userDataDir: string
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder = resolveMigrationsFolder()
const registryFileName = "flowm-ledgers.json"
const defaultDatabaseFileName = "flowm.sqlite3"

function resolveMigrationsFolder(): string {
  const candidates = [
    resolve(__dirname, "migrations"),
    resolve(__dirname, "../migrations"),
    resolve(__dirname, "../../db/migrations"),
  ]
  const found = candidates.find((candidate) => existsSync(candidate))
  if (!found) {
    throw new Error(`Flowm migrations folder not found. Checked: ${candidates.join(", ")}`)
  }
  return found
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2))
}

function platformDefaultUserDataDir(): string {
  if (process.platform === "darwin") {
    return join(homedir(), "Library", "Application Support", "com.flowm.desktop")
  }

  if (process.platform === "win32") {
    return join(process.env.APPDATA ?? join(homedir(), "AppData", "Roaming"), "com.flowm.desktop")
  }

  return join(process.env.XDG_CONFIG_HOME ?? join(homedir(), ".config"), "com.flowm.desktop")
}

function resolveUserDataDir(): string {
  return resolve(process.env.FLOWM_USER_DATA_DIR ?? platformDefaultUserDataDir())
}

function readActiveLedgerFromRegistry(userDataDir: string): {
  dbPath: string
  activeLedger: LedgerRegistry["ledgers"][number] | null
} {
  const registryPath = join(userDataDir, registryFileName)
  const fallbackDbPath = join(userDataDir, defaultDatabaseFileName)
  if (!existsSync(registryPath)) return { dbPath: fallbackDbPath, activeLedger: null }

  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as LedgerRegistry
  const activeLedger =
    registry.ledgers.find((ledger) => ledger.id === registry.activeId) ??
    registry.ledgers[0] ??
    null
  if (!activeLedger) return { dbPath: fallbackDbPath, activeLedger: null }

  const dbPath = isAbsolute(activeLedger.file)
    ? activeLedger.file
    : join(userDataDir, activeLedger.file)
  return { dbPath, activeLedger }
}

function resolveLedgerPath(options: GlobalOptions): ResolvedLedgerPath {
  const userDataDir = resolveUserDataDir()
  const explicitPath = options.db ?? process.env.FLOWM_DB_PATH
  if (explicitPath) {
    return {
      dbPath: resolve(explicitPath),
      activeLedger: null,
      explicit: true,
      userDataDir,
    }
  }

  return {
    ...readActiveLedgerFromRegistry(userDataDir),
    explicit: false,
    userDataDir,
  }
}

function openLedger(dbPath: string): { db: Database; api: FlowmApi; close: () => void } {
  if (!existsSync(dbPath)) {
    throw new Error(`Ledger database does not exist: ${dbPath}`)
  }

  const client = new BetterSqlite3(dbPath)
  client.pragma("foreign_keys = ON")
  const db = drizzle(client, { schema })
  migrate(db, { migrationsFolder })
  return { db, api: createFlowmApi(db), close: () => client.close() }
}

function unwrap<T>(result: ApiResult<T>): T {
  if (!result.success) throw new Error(result.error)
  return result.data
}

function readStdin(): Promise<string> {
  return new Promise((resolveText, reject) => {
    let data = ""
    process.stdin.setEncoding("utf8")
    process.stdin.on("data", (chunk) => {
      data += chunk
    })
    process.stdin.on("end", () => resolveText(data))
    process.stdin.on("error", reject)
  })
}

async function readPatch(path: string): Promise<AgentLedgerPatchInput> {
  const raw = path === "-" ? await readStdin() : readFileSync(resolve(path), "utf8")
  const parsed = JSON.parse(raw) as AgentLedgerPatchInput
  if (!Array.isArray(parsed.operations)) {
    throw new Error("Patch JSON must contain an operations array")
  }
  return parsed
}

async function withLedger<T>(
  dbPath: string,
  fn: (input: { db: Database; api: FlowmApi }) => Promise<T> | T,
): Promise<T> {
  const { db, api, close } = openLedger(dbPath)
  try {
    return await fn({ db, api })
  } finally {
    close()
  }
}

function parsePositiveInteger(value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError("must be a positive integer")
  }
  return parsed
}

function optionalText(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function optionalNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    throw new InvalidArgumentError("must be a finite number")
  }
  return parsed
}

function removeUndefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

function addCommitOption(command: Command): Command {
  return command
    .addOption(new Option("--dry-run", "Validate without writing").conflicts("commit"))
    .addOption(new Option("--commit", "Write the command").conflicts("dryRun"))
}

function shouldCommit(options: { commit?: boolean }): boolean {
  return options.commit === true
}

function printDryRun(dbPath: string, operation: string, input: unknown): void {
  printJson({
    dbPath,
    dryRun: true,
    operation,
    wouldWrite: input,
    message: "Pass --commit to write this change.",
  })
}

function debugIpc(message: string): void {
  if (process.env.FLOWM_CLI_DEBUG_IPC === "1") {
    console.error(message)
  }
}

async function notifyLedgerChanged(resolved: ResolvedLedgerPath, command: string): Promise<void> {
  const socketPath = getFlowmLedgerChangeSocketPath({
    platform: process.platform,
    userDataDir: resolved.userDataDir,
  })
  const payload: LedgerChangeEvent = {
    type: "ledger.changed",
    dbPath: resolved.dbPath,
    ledgerId: resolved.activeLedger?.id,
    source: "flowm-cli",
    command,
    pid: process.pid,
    changedAt: new Date().toISOString(),
  }

  await new Promise<void>((resolveNotify) => {
    const socket = createConnection(socketPath)
    let finished = false
    const timer = setTimeout(() => finish(new Error("Timed out connecting to app socket")), 400)
    const finish = (error?: Error) => {
      if (finished) return
      finished = true
      clearTimeout(timer)
      socket.destroy()
      if (error) {
        debugIpc(`[flowm-cli] App refresh notification skipped: ${error.message}`)
      }
      resolveNotify()
    }

    socket.once("connect", () => {
      socket.end(JSON.stringify(payload))
    })
    socket.once("error", finish)
    socket.once("close", () => finish())
  })
}

async function findAsset(api: FlowmApi, id: FlowmId) {
  const assets = unwrap(await api.listAssetItems({ includeArchived: true }))
  return assets.find((asset) => String(asset.id) === String(id)) ?? null
}

async function findAssetSnapshot(api: FlowmApi, id: FlowmId) {
  const snapshots = unwrap(await api.listAssetSnapshots())
  return snapshots.find((snapshot) => String(snapshot.id) === String(id)) ?? null
}

function makeProgram(): Command {
  const program = new Command()

  program
    .name("flowm-cli")
    .description("Safe local Flowm ledger interface for agents")
    .option("--db <path>", "SQLite ledger path")
    .showHelpAfterError()
    .exitOverride()

  program
    .command("ledger-info")
    .description("Show resolved ledger path and high-level ledger counts")
    .action(async () => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const exists = existsSync(resolved.dbPath)
      if (!exists) {
        printJson({
          dbPath: resolved.dbPath,
          exists,
          explicit: resolved.explicit,
          userDataDir: resolved.userDataDir,
          activeLedger: resolved.activeLedger,
        })
        return
      }

      await withLedger(resolved.dbPath, async ({ api }) => {
        const categories = unwrap(await api.listCategories({ includeArchived: true }))
        const assets = unwrap(await api.listAssetItems({ includeArchived: true }))
        const subscriptions = unwrap(await api.listSubscriptions())
        const loans = unwrap(await api.listLoans())
        printJson({
          dbPath: resolved.dbPath,
          exists: true,
          explicit: resolved.explicit,
          userDataDir: resolved.userDataDir,
          activeLedger: resolved.activeLedger,
          counts: {
            categories: categories.length,
            assets: assets.length,
            subscriptions: subscriptions.length,
            loans: loans.length,
          },
        })
      })
    })

  program
    .command("list-categories")
    .description("List all categories, including archived categories")
    .action(async () => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        printJson({ categories: unwrap(await api.listCategories({ includeArchived: true })) })
      })
    })

  program
    .command("list-assets")
    .description("List all assets, including archived assets")
    .option("--type <type>", "Filter by asset type")
    .option("--active-only", "Exclude archived assets")
    .action(async (options: { type?: ListAssetItemsInput["assetType"]; activeOnly?: boolean }) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        printJson({
          assets: unwrap(
            await api.listAssetItems({
              assetType: options.type,
              includeArchived: !options.activeOnly,
            }),
          ),
        })
      })
    })

  program
    .command("get-asset")
    .description("Get one asset item and its snapshots")
    .argument("<id>", "Asset item id")
    .action(async (id: string) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        const asset = await findAsset(api, id)
        if (!asset) throw new Error(`Asset not found: ${id}`)
        const snapshots = unwrap(await api.listAssetSnapshots({ assetItemId: id }))
        printJson({ asset, snapshots })
      })
    })

  addCommitOption(
    program
      .command("create-asset")
      .description("Create an asset item, defaulting to dry-run")
      .requiredOption("--name <name>", "Asset name")
      .requiredOption("--type <type>", "Asset type")
      .option("--institution <name>", "Institution or platform")
      .option("--currency <code>", "Default currency")
      .option("--valuation-method <method>", "Valuation method")
      .option("--display-order <n>", "Display order", optionalNumber)
      .option("--note <text>", "Asset note"),
  ).action(
    async (options: {
      name: string
      type: CreateAssetItemInput["assetType"]
      institution?: string
      currency?: string
      valuationMethod?: string
      displayOrder?: number
      note?: string
      commit?: boolean
    }) => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const { dbPath } = resolved
      const input = removeUndefined({
        name: options.name,
        assetType: options.type,
        institution: optionalText(options.institution),
        defaultCurrency: options.currency,
        valuationMethod: options.valuationMethod,
        displayOrder: options.displayOrder,
        note: optionalText(options.note),
      }) as CreateAssetItemInput
      if (!shouldCommit(options)) {
        printDryRun(dbPath, "create-asset", input)
        return
      }
      await withLedger(dbPath, async ({ api }) => {
        printJson({ dbPath, asset: unwrap(await api.createAssetItem(input)) })
      })
      await notifyLedgerChanged(resolved, "create-asset")
    },
  )

  addCommitOption(
    program
      .command("update-asset")
      .description("Update an asset item, defaulting to dry-run")
      .argument("<id>", "Asset item id")
      .option("--name <name>", "Asset name")
      .option("--type <type>", "Asset type")
      .option("--institution <name>", "Institution or platform")
      .option("--currency <code>", "Default currency")
      .option("--valuation-method <method>", "Valuation method")
      .option("--display-order <n>", "Display order", optionalNumber)
      .option("--note <text>", "Asset note"),
  ).action(
    async (
      id: string,
      options: {
        name?: string
        type?: UpdateAssetItemInput["assetType"]
        institution?: string
        currency?: string
        valuationMethod?: string
        displayOrder?: number
        note?: string
        commit?: boolean
      },
    ) => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const { dbPath } = resolved
      const input = removeUndefined({
        id,
        name: options.name,
        assetType: options.type,
        institution: optionalText(options.institution),
        defaultCurrency: options.currency,
        valuationMethod: options.valuationMethod,
        displayOrder: options.displayOrder,
        note: optionalText(options.note),
      }) as UpdateAssetItemInput
      await withLedger(dbPath, async ({ api }) => {
        const current = await findAsset(api, id)
        if (!current) throw new Error(`Asset not found: ${id}`)
        if (!shouldCommit(options)) {
          printJson({ dbPath, dryRun: true, operation: "update-asset", current, wouldWrite: input })
          return
        }
        printJson({ dbPath, asset: unwrap(await api.updateAssetItem(input)) })
      })
      if (shouldCommit(options)) {
        await notifyLedgerChanged(resolved, "update-asset")
      }
    },
  )

  addCommitOption(
    program
      .command("archive-asset")
      .description("Archive an asset item, defaulting to dry-run")
      .argument("<id>", "Asset item id"),
  ).action(async (id: string, options: { commit?: boolean }) => {
    const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
    const { dbPath } = resolved
    await withLedger(dbPath, async ({ api }) => {
      const current = await findAsset(api, id)
      if (!current) throw new Error(`Asset not found: ${id}`)
      if (!shouldCommit(options)) {
        printJson({ dbPath, dryRun: true, operation: "archive-asset", current })
        return
      }
      unwrap(await api.archiveAssetItem({ id }))
      printJson({ dbPath, archived: true, assetId: id })
    })
    if (shouldCommit(options)) {
      await notifyLedgerChanged(resolved, "archive-asset")
    }
  })

  program
    .command("list-asset-snapshots")
    .description("List asset snapshots")
    .option("--asset-id <id>", "Asset item id")
    .option("--account-name <name>", "Asset account name")
    .option("--latest-only", "Only return the latest snapshot per asset")
    .action(async (options: { assetId?: string; accountName?: string; latestOnly?: boolean }) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        printJson({
          snapshots: unwrap(
            await api.listAssetSnapshots({
              assetItemId: options.assetId,
              accountName: options.accountName,
              latestOnly: options.latestOnly,
            }),
          ),
        })
      })
    })

  program
    .command("get-asset-snapshot")
    .description("Get one asset snapshot")
    .argument("<id>", "Asset snapshot id")
    .action(async (id: string) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        const snapshot = await findAssetSnapshot(api, id)
        if (!snapshot) throw new Error(`Asset snapshot not found: ${id}`)
        printJson({ snapshot })
      })
    })

  addCommitOption(
    program
      .command("add-asset-snapshot")
      .description("Add an asset snapshot, defaulting to dry-run")
      .requiredOption("--asset-id <id>", "Asset item id")
      .requiredOption("--value <amount>", "Snapshot value amount")
      .option("--currency <code>", "Value currency")
      .option("--at <iso>", "Snapshot timestamp")
      .option("--quantity <amount>", "Quantity amount")
      .option("--quantity-unit <unit>", "Quantity unit")
      .option("--cost-basis <amount>", "Cost basis amount")
      .option("--cost-basis-currency <code>", "Cost basis currency")
      .option("--source <kind>", "Snapshot source kind")
      .option("--note <text>", "Snapshot note"),
  ).action(
    async (options: {
      assetId: string
      value: string
      currency?: string
      at?: string
      quantity?: string
      quantityUnit?: string
      costBasis?: string
      costBasisCurrency?: string
      source?: string
      note?: string
      commit?: boolean
    }) => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const { dbPath } = resolved
      const input = removeUndefined({
        assetItemId: options.assetId,
        valueAmount: options.value,
        valueCurrency: options.currency,
        snapshotAt: options.at,
        quantityAmount: optionalText(options.quantity),
        quantityUnit: optionalText(options.quantityUnit),
        costBasisAmount: optionalText(options.costBasis),
        costBasisCurrency: options.costBasisCurrency,
        sourceKind: options.source,
        note: optionalText(options.note),
      }) as AddAssetSnapshotInput
      await withLedger(dbPath, async ({ api }) => {
        const asset = await findAsset(api, options.assetId)
        if (!asset) throw new Error(`Asset not found: ${options.assetId}`)
        if (!shouldCommit(options)) {
          printJson({
            dbPath,
            dryRun: true,
            operation: "add-asset-snapshot",
            asset,
            wouldWrite: input,
          })
          return
        }
        printJson({ dbPath, snapshot: unwrap(await api.addAssetSnapshot(input)) })
      })
      if (shouldCommit(options)) {
        await notifyLedgerChanged(resolved, "add-asset-snapshot")
      }
    },
  )

  addCommitOption(
    program
      .command("update-asset-snapshot")
      .description("Update an asset snapshot, defaulting to dry-run")
      .argument("<id>", "Asset snapshot id")
      .option("--value <amount>", "Snapshot value amount")
      .option("--currency <code>", "Value currency")
      .option("--at <iso>", "Snapshot timestamp")
      .option("--quantity <amount>", "Quantity amount")
      .option("--quantity-unit <unit>", "Quantity unit")
      .option("--cost-basis <amount>", "Cost basis amount")
      .option("--cost-basis-currency <code>", "Cost basis currency")
      .option("--source <kind>", "Snapshot source kind")
      .option("--note <text>", "Snapshot note"),
  ).action(
    async (
      id: string,
      options: {
        value?: string
        currency?: string
        at?: string
        quantity?: string
        quantityUnit?: string
        costBasis?: string
        costBasisCurrency?: string
        source?: string
        note?: string
        commit?: boolean
      },
    ) => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const { dbPath } = resolved
      const input = removeUndefined({
        id,
        valueAmount: options.value,
        valueCurrency: options.currency,
        snapshotAt: options.at,
        quantityAmount: optionalText(options.quantity),
        quantityUnit: optionalText(options.quantityUnit),
        costBasisAmount: optionalText(options.costBasis),
        costBasisCurrency: options.costBasisCurrency,
        sourceKind: options.source,
        note: optionalText(options.note),
      }) as UpdateAssetSnapshotInput
      await withLedger(dbPath, async ({ api }) => {
        const current = await findAssetSnapshot(api, id)
        if (!current) throw new Error(`Asset snapshot not found: ${id}`)
        if (!shouldCommit(options)) {
          printJson({
            dbPath,
            dryRun: true,
            operation: "update-asset-snapshot",
            current,
            wouldWrite: input,
          })
          return
        }
        printJson({ dbPath, snapshot: unwrap(await api.updateAssetSnapshot(input)) })
      })
      if (shouldCommit(options)) {
        await notifyLedgerChanged(resolved, "update-asset-snapshot")
      }
    },
  )

  addCommitOption(
    program
      .command("delete-asset-snapshot")
      .description("Delete an asset snapshot, defaulting to dry-run")
      .argument("<id>", "Asset snapshot id"),
  ).action(async (id: string, options: { commit?: boolean }) => {
    const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
    const { dbPath } = resolved
    await withLedger(dbPath, async ({ api }) => {
      const current = await findAssetSnapshot(api, id)
      if (!current) throw new Error(`Asset snapshot not found: ${id}`)
      if (!shouldCommit(options)) {
        printJson({ dbPath, dryRun: true, operation: "delete-asset-snapshot", current })
        return
      }
      unwrap(await api.deleteAssetSnapshot({ id }))
      printJson({ dbPath, deleted: true, snapshotId: id })
    })
    if (shouldCommit(options)) {
      await notifyLedgerChanged(resolved, "delete-asset-snapshot")
    }
  })

  program
    .command("net-worth")
    .description("Show net worth from latest asset snapshots")
    .option("--as-of <iso>", "As-of timestamp")
    .option("--currency <code>", "Display currency")
    .action(async (options: { asOf?: string; currency?: string }) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        printJson({
          netWorth: unwrap(
            await api.getNetWorthSnapshot({
              asOf: options.asOf,
              displayCurrency: options.currency,
            }),
          ),
        })
      })
    })

  program
    .command("asset-change")
    .description("Show an asset value change summary")
    .argument("<asset-id>", "Asset item id")
    .option("--comparison <kind>", "Comparison window")
    .action(
      async (assetId: string, options: { comparison?: "previous" | "30d" | "90d" | "1y" }) => {
        const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
        await withLedger(dbPath, async ({ api }) => {
          printJson({
            change: unwrap(
              await api.getAssetChange({ assetItemId: assetId, comparison: options.comparison }),
            ),
          })
        })
      },
    )

  program
    .command("list-cashflow")
    .description("List cashflow events, optionally filtered by import source")
    .option("--source <name>", "Import source name")
    .option("--source-external-id <id>", "Import source external identifier")
    .option("--limit <n>", "Maximum number of rows", parsePositiveInteger, 50)
    .action(async (options: { source?: string; sourceExternalId?: string; limit: number }) => {
      const { dbPath } = resolveLedgerPath(program.opts<GlobalOptions>())
      await withLedger(dbPath, async ({ api }) => {
        printJson({
          cashflow: unwrap(
            await api.listCashflowEvents({
              sourceName: options.source,
              sourceExternalId: options.sourceExternalId,
              limit: options.limit,
            }),
          ),
        })
      })
    })

  program
    .command("apply-patch")
    .description("Apply a guarded business patch, defaulting to dry-run")
    .argument("<patch>", "Patch JSON file path, or '-' for stdin")
    .addOption(new Option("--dry-run", "Validate without writing").conflicts("commit"))
    .addOption(new Option("--commit", "Write the patch if validation passes").conflicts("dryRun"))
    .action(async (patchPath: string, options: { dryRun?: boolean; commit?: boolean }) => {
      const resolved = resolveLedgerPath(program.opts<GlobalOptions>())
      const { dbPath } = resolved
      const patch = await readPatch(patchPath)
      const dryRun = options.commit ? false : true
      let didCommit = false
      await withLedger(dbPath, async ({ api }) => {
        if (!dryRun) {
          const validation = unwrap(await api.applyAgentLedgerPatch({ ...patch, dryRun: true }))
          const rejected = validation.operations.some((operation) => operation.action === "reject")
          if (validation.conflicts > 0 || rejected) {
            printJson({ dbPath, result: validation })
            process.exitCode = 1
            return
          }
        }

        const result = unwrap(await api.applyAgentLedgerPatch({ ...patch, dryRun }))
        if (!dryRun) {
          const rejected = result.operations.some((operation) => operation.action === "reject")
          if (result.conflicts > 0 || rejected) {
            printJson({ dbPath, result })
            process.exitCode = 1
            return
          }
        }
        printJson({ dbPath, result })
        didCommit = !dryRun
      })
      if (didCommit) {
        await notifyLedgerChanged(resolved, "apply-patch")
      }
    })

  return program
}

async function main(argv: string[]): Promise<void> {
  await makeProgram().parseAsync(argv)
}

main(process.argv).catch((error: unknown) => {
  if (error instanceof CommanderError) {
    process.exitCode = error.exitCode
    return
  }

  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
