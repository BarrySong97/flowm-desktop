import { beforeEach, describe, expect, it, vi } from "vitest"
import type { DashboardSnapshot, FlowmApi } from "@flowm/api"
import { i18n } from "../i18n"
import { emptyDashboardSnapshot, setFlowmApiFactory, useFlowmStore } from "../lib/stores/flowmStore"

function ok<T>(data: T) {
  return { success: true as const, data }
}

function createMockApi(snapshot: DashboardSnapshot = emptyDashboardSnapshot): FlowmApi {
  const api = {
    initializeFlowm: vi.fn(async () => ok(undefined)),
    getDashboardSnapshot: vi.fn(async () => ok(snapshot)),
    createBudget: vi.fn(async () => ok({ id: 1 })),
    getBudgetProgress: vi.fn(async () => ok([])),
    importNormalizedStatementEntries: vi.fn(async () => ok({ batchId: 1, inserted: 1, skipped: 0 })),
    listImportedEntries: vi.fn(async () => ok([])),
    listAssetSnapshots: vi.fn(async () => ok([])),
    upsertAssetSnapshot: vi.fn(async () => ok({
      id: 1,
      assetItemId: "asset_1",
      accountName: "Assets:Bank:Checking",
      assetType: "bank" as const,
      snapshotAt: new Date(0).toISOString(),
      quantityNumber: null,
      quantityCurrency: null,
      quantityAmount: null,
      quantityUnit: null,
      valueNumber: "100.00",
      valueCurrency: "CNY",
      source: "manual",
      note: null,
      meta: null,
    })),
    removeAssetSnapshot: vi.fn(async () => ok(undefined)),
    getCurrencySettings: vi.fn(async () => ok({
      displayCurrency: "CNY",
      fxProvider: "frankfurter",
      fxRequestPolicy: "on_demand_foreign_currency_only",
      updatedAt: new Date(0).toISOString(),
      meta: null,
    })),
    updateCurrencySettings: vi.fn(async () => ok({
      displayCurrency: "CNY",
      fxProvider: "frankfurter",
      fxRequestPolicy: "on_demand_foreign_currency_only",
      updatedAt: new Date(0).toISOString(),
      meta: null,
    })),
    listExchangeRates: vi.fn(async () => ok([])),
    refreshExchangeRates: vi.fn(async () => ok({
      requested: 0,
      fetched: 0,
      skipped: 0,
      failed: 0,
      unsupported: 0,
    })),
    listDashboardViews: vi.fn(async () => ok([
      {
        id: "overview",
        name: "总览",
        slug: "overview",
        position: 0,
        isDefault: true,
        createdAt: new Date(0).toISOString(),
        updatedAt: new Date(0).toISOString(),
      },
    ])),
    createDashboardView: vi.fn(async () => ok({
      id: "view_1",
      name: "Custom",
      slug: "custom",
      position: 1,
      isDefault: false,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    })),
    updateDashboardView: vi.fn(async () => ok({
      id: "overview",
      name: "Overview",
      slug: "overview",
      position: 0,
      isDefault: true,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    })),
    removeDashboardView: vi.fn(async () => ok(undefined)),
    saveDashboardViewOrder: vi.fn(async () => ok([])),
    listDashboardCards: vi.fn(async () => ok([])),
    listDashboardLayouts: vi.fn(async () => ok([])),
    addDashboardCard: vi.fn(async () => ok({
      id: "card_1",
      viewId: "overview",
      type: "kpi",
      title: null,
      code: null,
      config: {},
      position: 0,
      hidden: false,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    })),
    updateDashboardCard: vi.fn(async () => ok({
      id: "card_1",
      viewId: "overview",
      type: "kpi",
      title: null,
      code: null,
      config: {},
      position: 0,
      hidden: false,
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
    })),
    removeDashboardCard: vi.fn(async () => ok(undefined)),
    saveDashboardLayouts: vi.fn(async () => ok(undefined)),
    resetDashboardLayout: vi.fn(async () => ok(undefined)),
    // No-Ledger model methods
    listFinancialEvents: vi.fn(async () => ok([])),
    createFinancialEvent: vi.fn(async () => ok({
      id: 1,
      statementLineId: null,
      eventDate: "2024-01-01",
      date: "2024-01-01",
      occurredAt: null,
      title: null,
      counterparty: null,
      description: null,
      userNote: null,
      flowKind: "expense",
      amount: "0",
      currency: "CNY",
      direction: "out" as const,
      categoryId: null,
      categoryName: null,
      sourceKind: "manual",
      sourceName: null,
      source: "manual",
      includeInAnalytics: true,
      status: "active" as const,
      classificationSource: "manual",
      tags: [],
      createdAt: new Date(0).toISOString(),
    })),
    updateFinancialEvent: vi.fn(async () => ok({
      id: 1,
      statementLineId: null,
      eventDate: "2024-01-01",
      date: "2024-01-01",
      occurredAt: null,
      title: null,
      counterparty: null,
      description: null,
      userNote: null,
      flowKind: "expense",
      amount: "0",
      currency: "CNY",
      direction: "out" as const,
      categoryId: null,
      categoryName: null,
      sourceKind: "manual",
      sourceName: null,
      source: "manual",
      includeInAnalytics: true,
      status: "active" as const,
      classificationSource: "manual",
      tags: [],
      createdAt: new Date(0).toISOString(),
    })),
    removeFinancialEvent: vi.fn(async () => ok(undefined)),
    rebuildFinancialEventsFromImports: vi.fn(async () => ok({ created: 0, skipped: 0 })),
    listCategories: vi.fn(async () => ok([])),
    createCategory: vi.fn(async () => ok({
      id: 1, name: "Test", categoryKind: "expense", kind: "expense", sortOrder: 0, displayOrder: 0, archived: false,
    })),
    updateCategory: vi.fn(async () => ok({
      id: 1, name: "Test", categoryKind: "expense", kind: "expense", sortOrder: 0, displayOrder: 0, archived: false,
    })),
    archiveCategory: vi.fn(async () => ok(undefined)),
    listPlans: vi.fn(async () => ok([])),
    createPlan: vi.fn(async () => ok({
      id: 1, planType: "subscription", name: "Test", amount: "0", currency: "CNY",
      scheduleRule: "FREQ=MONTHLY", startDate: "2024-01-01", status: "active",
    })),
    updatePlan: vi.fn(async () => ok({
      id: 1, planType: "subscription", name: "Test", amount: "0", currency: "CNY",
      scheduleRule: "FREQ=MONTHLY", startDate: "2024-01-01", status: "active",
    })),
    generatePlanOccurrences: vi.fn(async () => ok({ generated: 0 })),
    runFlowQuery: vi.fn(async () => ok({ rows: [], columns: [] })),
  } satisfies Partial<FlowmApi>
  return api as unknown as FlowmApi
}

describe("flowmStore", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en-US")
    window.localStorage.clear()
    useFlowmStore.setState({
      snapshot: emptyDashboardSnapshot,
      status: "booting",
      error: null,
      commandInput: "",
      commandLog: [],
      dashboardViews: [],
      activeDashboardViewId: null,
      dashboardCards: [],
      dashboardLayouts: [],
      importedEntries: [],
      assetSnapshots: [],
      plans: [],
      currencySettings: null,
      exchangeRates: [],
    })
  })

  it("loads snapshots through api facade", async () => {
    const api = createMockApi()
    setFlowmApiFactory(() => api)
    await useFlowmStore.getState().loadSnapshot()
    expect(api.initializeFlowm).not.toHaveBeenCalled()
    expect(api.getDashboardSnapshot).toHaveBeenCalled()
    expect(api.listDashboardViews).toHaveBeenCalled()
    expect(api.listDashboardCards).toHaveBeenCalledWith({ viewId: "overview" })
    expect(api.listPlans).toHaveBeenCalled()
    expect(useFlowmStore.getState().status).toBe("live")
  })

  it("switches dashboard views through api facade", async () => {
    const api = createMockApi()
    setFlowmApiFactory(() => api)
    await useFlowmStore.getState().loadSnapshot()
    await useFlowmStore.getState().setActiveDashboardView("overview")
    expect(api.listDashboardCards).toHaveBeenLastCalledWith({ viewId: "overview" })
    expect(useFlowmStore.getState().activeDashboardViewId).toBe("overview")
  })

  it("runs refresh command without touching db directly", async () => {
    const api = createMockApi()
    setFlowmApiFactory(() => api)
    await useFlowmStore.getState().runCommand("REFRESH")
    expect(api.getDashboardSnapshot).toHaveBeenCalled()
    expect(useFlowmStore.getState().status).toBe("live")
  })

  it("creates and updates plans through api facade", async () => {
    const api = createMockApi()
    setFlowmApiFactory(() => api)
    await useFlowmStore.getState().createPlan({
      planType: "subscription",
      name: "iCloud",
      amount: "21.00",
      scheduleRule: "FREQ=MONTHLY",
      startDate: "2026-06-01",
    })
    expect(api.createPlan).toHaveBeenCalledWith({
      planType: "subscription",
      name: "iCloud",
      amount: "21.00",
      scheduleRule: "FREQ=MONTHLY",
      startDate: "2026-06-01",
    })

    await useFlowmStore.getState().updatePlan({ id: 1, status: "paused" })
    expect(api.updatePlan).toHaveBeenCalledWith({ id: 1, status: "paused" })
    expect(api.listPlans).toHaveBeenCalledTimes(2)
  })
})
