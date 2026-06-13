import { create } from "zustand"
import {
  type AddDashboardCardInput,
  type AssetSnapshotSummary,
  type CreatePlanInput,
  type CurrencySettingsSummary,
  type DashboardCard,
  type DashboardLayoutEntry,
  type DashboardSnapshot,
  type DashboardView,
  type ExchangeRateSummary,
  type FlowmApi,
  type ImportedBatchResult,
  type ImportedEntrySummary,
  type ImportNormalizedStatementEntriesInput,
  type PlanSummary,
  type UpdateDashboardCardInput,
  type UpdateCurrencySettingsInput,
  type UpdatePlanInput,
  type UpsertAssetSnapshotInput,
} from "@flowm/api"
import { i18n } from "../../i18n"
import { parseFlowmCommand } from "../commands/parser"
import { flowmPerfLog, flowmPerfMeasure, summarizeValue } from "../debug/perf"
import { routeLoopLog } from "../debug/routeLoop"

export interface CommandLogEntry {
  time: string
  who: "USR" | "SYS" | "AI"
  message: string
}

export interface FlowmState {
  snapshot: DashboardSnapshot
  status: "booting" | "live" | "offline" | "error"
  error: string | null
  commandInput: string
  commandLog: CommandLogEntry[]
  dashboardCards: DashboardCard[]
  dashboardLayouts: DashboardLayoutEntry[]
  dashboardViews: DashboardView[]
  activeDashboardViewId: string | null
  importedEntries: ImportedEntrySummary[]
  assetSnapshots: AssetSnapshotSummary[]
  plans: PlanSummary[]
  currencySettings: CurrencySettingsSummary | null
  exchangeRates: ExchangeRateSummary[]
  editingCardId: string | null
  setCommandInput: (value: string) => void
  loadSnapshot: () => Promise<void>
  runCommand: (raw: string) => Promise<void>
  addDashboardCard: (input: Omit<AddDashboardCardInput, "viewId">) => Promise<DashboardCard | null>
  updateDashboardCard: (input: UpdateDashboardCardInput) => Promise<void>
  removeDashboardCard: (id: string) => Promise<void>
  saveDashboardLayouts: (rows: DashboardLayoutEntry[]) => Promise<void>
  setActiveDashboardView: (id: string) => Promise<void>
  createDashboardView: (name: string) => Promise<void>
  updateDashboardView: (input: { id: string; name?: string; position?: number }) => Promise<void>
  removeDashboardView: (id: string) => Promise<void>
  saveDashboardViewOrder: (ids: string[]) => Promise<void>
  setEditingCardId: (id: string | null) => void
  importNormalizedStatementEntries: (input: ImportNormalizedStatementEntriesInput) => Promise<ImportedBatchResult | null>
  loadImportedEntries: () => Promise<void>
  loadAssetSnapshots: () => Promise<void>
  loadAssetSnapshotHistory: (accountName: string) => Promise<AssetSnapshotSummary[]>
  upsertAssetSnapshot: (input: UpsertAssetSnapshotInput) => Promise<void>
  removeAssetSnapshot: (id: AssetSnapshotSummary["id"]) => Promise<void>
  loadCurrencySettings: () => Promise<void>
  updateCurrencySettings: (input: UpdateCurrencySettingsInput) => Promise<void>
  refreshExchangeRates: () => Promise<void>
  loadPlans: () => Promise<void>
  createPlan: (input: CreatePlanInput) => Promise<void>
  updatePlan: (input: UpdatePlanInput) => Promise<void>
}

type ApiFactory = () => FlowmApi

let apiFactory: ApiFactory = () => { throw new Error("FlowmApi factory not initialized") }

const ACTIVE_DASHBOARD_VIEW_KEY = "flowm.activeDashboardViewId"

export const emptyDashboardSnapshot: DashboardSnapshot = {
  metrics: {
    netWorth: { number: "0", currency: "CNY" },
    cash: { number: "0", currency: "CNY" },
    incomeMtd: { number: "0", currency: "CNY" },
    expenseMtd: { number: "0", currency: "CNY" },
    savingsMtd: { number: "0", currency: "CNY" },
  },
  pnlStrip: [],
  dayFlow: [],
  transactions: [],
  holdings: [],
  accounts: [],
  generatedAt: new Date(0).toISOString(),
}

function readStoredDashboardViewId(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(ACTIVE_DASHBOARD_VIEW_KEY)
  } catch {
    return null
  }
}

function storeDashboardViewId(id: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(ACTIVE_DASHBOARD_VIEW_KEY, id)
  } catch {
    // Local storage is best-effort; the in-memory active view still works.
  }
}

function chooseDashboardViewId(views: DashboardView[], preferred: string | null): string | null {
  if (views.length === 0) return null
  if (preferred != null && views.some((view) => view.id === preferred)) return preferred
  return views[0]?.id ?? null
}

function nowLabel() {
  return new Date().toTimeString().slice(0, 8)
}

function log(who: CommandLogEntry["who"], message: string): CommandLogEntry {
  return { who, message, time: nowLabel() }
}

function expectApiResult<T>(result: Awaited<ReturnType<FlowmApi["getDashboardSnapshot"]>> | { success: true; data: T } | { success: false; error: string }) {
  if (result.success) return result.data as T
  throw new Error(result.error)
}

async function executeParsedCommand(_api: FlowmApi, raw: string) {
  const parsed = parseFlowmCommand(raw)
  if (!parsed.success || parsed.command == null) {
    throw new Error(parsed.error ?? "Invalid command")
  }
  switch (parsed.command.kind) {
    case "refresh":
      return i18n.t("command.log.refreshed")
    default:
      throw new Error(`Unknown command: ${parsed.command.kind}`)
  }
}

async function profiledStoreCall<T>(label: string, action: () => Promise<T>): Promise<T> {
  const startedAt = performance.now()
  flowmPerfLog("store", "call.start", { label })
  try {
    const result = await action()
    flowmPerfMeasure("store", "call.end", startedAt, {
      label,
      result: summarizeValue(result),
    })
    return result
  } catch (error) {
    flowmPerfMeasure("store", "call.error", startedAt, {
      label,
      error: error instanceof Error ? error.message : String(error),
    })
    throw error
  }
}

export function setFlowmApiFactory(factory: ApiFactory) {
  apiFactory = factory
}

export const useFlowmStore = create<FlowmState>((set, get) => ({
  snapshot: emptyDashboardSnapshot,
  status: "booting",
  error: null,
  commandInput: "",
  commandLog: [
    log("SYS", i18n.t("command.log.boot")),
    log("AI", i18n.t("command.log.hint")),
  ],
  dashboardCards: [],
  dashboardLayouts: [],
  dashboardViews: [],
  activeDashboardViewId: null,
  importedEntries: [],
  assetSnapshots: [],
  plans: [],
  currencySettings: null,
  exchangeRates: [],
  editingCardId: null,
  setCommandInput: (value) => set({ commandInput: value }),
  setEditingCardId: (id) => set({ editingCardId: id }),
  loadSnapshot: async () => {
    routeLoopLog("flowmStore.loadSnapshot.start", {
      cards: get().dashboardCards.length,
      layouts: get().dashboardLayouts.length,
    })
    try {
      const api = apiFactory()
      const snapshot = expectApiResult<DashboardSnapshot>(
        await profiledStoreCall("getDashboardSnapshot", () => api.getDashboardSnapshot()),
      )
      const dashboardViews = expectApiResult(await profiledStoreCall("listDashboardViews", () => api.listDashboardViews()))
      const activeDashboardViewId =
        chooseDashboardViewId(dashboardViews, get().activeDashboardViewId) ??
        chooseDashboardViewId(dashboardViews, readStoredDashboardViewId())
      if (activeDashboardViewId != null) storeDashboardViewId(activeDashboardViewId)
      const dashboardCards = activeDashboardViewId == null
        ? []
        : expectApiResult(await profiledStoreCall("listDashboardCards", () => api.listDashboardCards({ viewId: activeDashboardViewId })))
      const dashboardLayouts = activeDashboardViewId == null
        ? []
        : expectApiResult(await profiledStoreCall("listDashboardLayouts", () => api.listDashboardLayouts({ viewId: activeDashboardViewId })))
      const importedEntries = expectApiResult(await profiledStoreCall("listImportedEntries", () => api.listImportedEntries({ limit: 200 })))
      const assetSnapshots = expectApiResult(await profiledStoreCall("listAssetSnapshots.latest", () => api.listAssetSnapshots({ latestOnly: true })))
      const plans = expectApiResult(await profiledStoreCall("listPlans", () => api.listPlans()))
      const currencySettings = expectApiResult(await profiledStoreCall("getCurrencySettings", () => api.getCurrencySettings()))
      const exchangeRates = expectApiResult(await profiledStoreCall("listExchangeRates", () => api.listExchangeRates({ limit: 50 })))
      const setStartedAt = performance.now()
      set({
        snapshot,
        status: "live",
        error: null,
        dashboardCards,
        dashboardLayouts,
        dashboardViews,
        activeDashboardViewId,
        importedEntries,
        assetSnapshots,
        plans,
        currencySettings,
        exchangeRates,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.syncOk"))].slice(-80),
      })
      flowmPerfMeasure("store", "set.loadSnapshot", setStartedAt, {
        importedEntries: importedEntries.length,
        assetSnapshots: assetSnapshots.length,
        plans: plans.length,
        exchangeRates: exchangeRates.length,
      })
      routeLoopLog("flowmStore.loadSnapshot.set", {
        cards: dashboardCards.length,
        layouts: dashboardLayouts.length,
        views: dashboardViews.length,
        activeDashboardViewId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        snapshot: emptyDashboardSnapshot,
        status: message.includes("Electron") ? "offline" : "error",
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.sqliteOffline", { message }))].slice(-80),
      })
      routeLoopLog("flowmStore.loadSnapshot.error", { message })
    }
  },
  runCommand: async (raw) => {
    const trimmed = raw.trim()
    if (trimmed.length === 0) return
    set({ commandInput: "", commandLog: [...get().commandLog, log("USR", trimmed)].slice(-80) })
    try {
      const api = apiFactory()
      const message = await executeParsedCommand(api, trimmed)
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({
        snapshot,
        status: "live",
        error: null,
        commandLog: [...get().commandLog, log("SYS", message)].slice(-80),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  addDashboardCard: async (input) => {
    try {
      const api = apiFactory()
      const viewId = get().activeDashboardViewId
      if (viewId == null) throw new Error("No active dashboard view")
      const card = expectApiResult(await api.addDashboardCard({ ...input, viewId }))
      set({
        dashboardCards: [...get().dashboardCards, card],
        dashboardLayouts: [
          ...get().dashboardLayouts.filter((entry) => entry.cardId !== card.id),
          ...input.layouts.map((entry) => ({ ...entry, cardId: card.id })),
        ],
      })
      return card
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
      return null
    }
  },
  updateDashboardCard: async (input) => {
    try {
      const api = apiFactory()
      const card = expectApiResult(await api.updateDashboardCard(input))
      set({
        dashboardCards: get().dashboardCards.map((existing) =>
          existing.id === card.id ? card : existing,
        ),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  removeDashboardCard: async (id) => {
    try {
      const api = apiFactory()
      expectApiResult(await api.removeDashboardCard({ id }))
      set({
        dashboardCards: get().dashboardCards.filter((card) => card.id !== id),
        dashboardLayouts: get().dashboardLayouts.filter((entry) => entry.cardId !== id),
        editingCardId: get().editingCardId === id ? null : get().editingCardId,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  saveDashboardLayouts: async (rows) => {
    if (rows.length === 0) return
    const viewId = get().activeDashboardViewId
    if (viewId == null) return
    const existing = get().dashboardLayouts
    const equal = layoutsEqual(existing, rows)
    routeLoopLog("flowmStore.saveDashboardLayouts.start", {
      equal,
      incoming: rows.length,
      existing: existing.length,
      first: rows[0],
    })
    if (equal) return
    set({
      dashboardLayouts: mergeLayouts(existing, rows),
    })
    routeLoopLog("flowmStore.saveDashboardLayouts.set", {
      incoming: rows.length,
      existing: existing.length,
    })
    try {
      const api = apiFactory()
      expectApiResult(await api.saveDashboardLayouts({ viewId, rows }))
      routeLoopLog("flowmStore.saveDashboardLayouts.api.ok", { rows: rows.length })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
      routeLoopLog("flowmStore.saveDashboardLayouts.api.error", { message })
    }
  },
  setActiveDashboardView: async (id) => {
    try {
      const api = apiFactory()
      const dashboardCards = expectApiResult(await api.listDashboardCards({ viewId: id }))
      const dashboardLayouts = expectApiResult(await api.listDashboardLayouts({ viewId: id }))
      storeDashboardViewId(id)
      set({
        activeDashboardViewId: id,
        dashboardCards,
        dashboardLayouts,
        editingCardId: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  createDashboardView: async (name) => {
    try {
      const api = apiFactory()
      const view = expectApiResult(await api.createDashboardView({ name }))
      const dashboardViews = [...get().dashboardViews, view].sort((a, b) => a.position - b.position)
      storeDashboardViewId(view.id)
      set({
        dashboardViews,
        activeDashboardViewId: view.id,
        dashboardCards: [],
        dashboardLayouts: [],
        editingCardId: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  updateDashboardView: async (input) => {
    try {
      const api = apiFactory()
      const view = expectApiResult(await api.updateDashboardView(input))
      set({
        dashboardViews: get().dashboardViews
          .map((existing) => existing.id === view.id ? view : existing)
          .sort((a, b) => a.position - b.position),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  removeDashboardView: async (id) => {
    try {
      const api = apiFactory()
      const previousViews = get().dashboardViews
      const removedIndex = previousViews.findIndex((view) => view.id === id)
      expectApiResult(await api.removeDashboardView({ id }))
      const dashboardViews = expectApiResult(await api.listDashboardViews())
      const adjacentFallback =
        removedIndex < 0
          ? null
          : dashboardViews[Math.min(removedIndex, dashboardViews.length - 1)]?.id ?? dashboardViews[0]?.id ?? null
      const fallback = chooseDashboardViewId(
        dashboardViews,
        get().activeDashboardViewId === id ? adjacentFallback : get().activeDashboardViewId,
      )
      const dashboardCards = fallback == null ? [] : expectApiResult(await api.listDashboardCards({ viewId: fallback }))
      const dashboardLayouts = fallback == null ? [] : expectApiResult(await api.listDashboardLayouts({ viewId: fallback }))
      if (fallback != null) storeDashboardViewId(fallback)
      set({
        dashboardViews,
        activeDashboardViewId: fallback,
        dashboardCards,
        dashboardLayouts,
        editingCardId: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  saveDashboardViewOrder: async (ids) => {
    try {
      const api = apiFactory()
      const dashboardViews = expectApiResult(await api.saveDashboardViewOrder({ ids }))
      set({ dashboardViews })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  importNormalizedStatementEntries: async (input) => {
    try {
      const api = apiFactory()
      const result = expectApiResult(await api.importNormalizedStatementEntries(input))
      const importedEntries = expectApiResult(await api.listImportedEntries({ limit: 200 }))
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({
        importedEntries,
        snapshot,
        commandLog: [
          ...get().commandLog,
          log("SYS", i18n.t("imports.toast.imported", { inserted: result.inserted, skipped: result.skipped })),
        ].slice(-80),
      })
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
      return null
    }
  },
  loadImportedEntries: async () => {
    try {
      const api = apiFactory()
      const importedEntries = expectApiResult(await api.listImportedEntries({ limit: 200 }))
      set({ importedEntries })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  loadAssetSnapshots: async () => {
    try {
      const api = apiFactory()
      const assetSnapshots = expectApiResult(await api.listAssetSnapshots({ latestOnly: true }))
      set({ assetSnapshots })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  loadAssetSnapshotHistory: async (accountName) => {
    try {
      const api = apiFactory()
      return expectApiResult(await api.listAssetSnapshots({ accountName, latestOnly: false }))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
      return []
    }
  },
  upsertAssetSnapshot: async (input) => {
    try {
      const api = apiFactory()
      expectApiResult(await api.upsertAssetSnapshot(input))
      const assetSnapshots = expectApiResult(await api.listAssetSnapshots({ latestOnly: true }))
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({ assetSnapshots, snapshot })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  removeAssetSnapshot: async (id) => {
    try {
      const api = apiFactory()
      expectApiResult(await api.removeAssetSnapshot({ id }))
      const assetSnapshots = expectApiResult(await api.listAssetSnapshots({ latestOnly: true }))
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({ assetSnapshots, snapshot })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  loadCurrencySettings: async () => {
    try {
      const api = apiFactory()
      const currencySettings = expectApiResult(await api.getCurrencySettings())
      const exchangeRates = expectApiResult(await api.listExchangeRates({ limit: 50 }))
      set({ currencySettings, exchangeRates })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  updateCurrencySettings: async (input) => {
    try {
      const api = apiFactory()
      const currencySettings = expectApiResult(await api.updateCurrencySettings(input))
      expectApiResult(await api.refreshExchangeRates())
      const exchangeRates = expectApiResult(await api.listExchangeRates({ limit: 50 }))
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({ currencySettings, exchangeRates, snapshot })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  refreshExchangeRates: async () => {
    try {
      const api = apiFactory()
      expectApiResult(await api.refreshExchangeRates({ force: true }))
      const exchangeRates = expectApiResult(await api.listExchangeRates({ limit: 50 }))
      const snapshot = expectApiResult<DashboardSnapshot>(await api.getDashboardSnapshot())
      set({ exchangeRates, snapshot })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  loadPlans: async () => {
    try {
      const api = apiFactory()
      const plans = expectApiResult(await api.listPlans())
      set({ plans })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  createPlan: async (input) => {
    try {
      const api = apiFactory()
      expectApiResult(await api.createPlan(input))
      const plans = expectApiResult(await api.listPlans())
      set({ plans })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
  updatePlan: async (input) => {
    try {
      const api = apiFactory()
      expectApiResult(await api.updatePlan(input))
      const plans = expectApiResult(await api.listPlans())
      set({ plans })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      set({
        error: message,
        commandLog: [...get().commandLog, log("SYS", i18n.t("command.log.error", { message }))].slice(-80),
      })
    }
  },
}))

function layoutsEqual(
  existing: DashboardLayoutEntry[],
  incoming: DashboardLayoutEntry[],
): boolean {
  if (incoming.length === 0) return true
  const map = new Map<string, DashboardLayoutEntry>()
  for (const entry of existing) {
    map.set(`${entry.cardId}::${entry.breakpoint}`, entry)
  }
  for (const next of incoming) {
    const current = map.get(`${next.cardId}::${next.breakpoint}`)
    if (current == null) return false
    if (
      current.x !== next.x ||
      current.y !== next.y ||
      current.w !== next.w ||
      current.h !== next.h
    ) {
      return false
    }
  }
  return true
}

function mergeLayouts(
  existing: DashboardLayoutEntry[],
  incoming: DashboardLayoutEntry[],
): DashboardLayoutEntry[] {
  const map = new Map<string, DashboardLayoutEntry>()
  for (const entry of existing) {
    map.set(`${entry.cardId}::${entry.breakpoint}`, entry)
  }
  for (const entry of incoming) {
    map.set(`${entry.cardId}::${entry.breakpoint}`, entry)
  }
  return [...map.values()]
}
