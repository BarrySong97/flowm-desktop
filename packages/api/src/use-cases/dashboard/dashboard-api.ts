/**
 * @purpose Implement dashboard facade-compatible use cases for the layered API.
 * @role    Use-case layer module called by the Flowm API facade chain.
 * @deps    shared API helpers, SQLite base capabilities, and domain-specific persistence paths.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { Result } from "@flowm/shared"
import type {
  AddDashboardCardInput,
  AssetSnapshotSummary,
  CreateDashboardViewInput,
  DashboardCard,
  DashboardLayoutEntry,
  DashboardSnapshot,
  DashboardView,
  FlowmApi,
  ListDashboardCardsInput,
  ListDashboardLayoutsInput,
  NetWorthInput,
  NetWorthSnapshot,
  SaveDashboardLayoutsInput,
  UpdateDashboardCardInput,
  UpdateDashboardViewInput,
  UpsertAssetSnapshotInput,
} from "../../index"
import { AgentLedgerApi } from "../agent-ledger/agent-ledger-api"
import { upsertAssetSnapshotFacade } from "../assets/assets-api"
import {
  DEFAULT_CURRENCY,
  fail,
  monthBounds,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
} from "../../shared/api-helpers"

export class FlowmSqliteApi extends AgentLedgerApi implements FlowmApi {
  private dashboardViews: DashboardView[] = [
    { id: "overview", slug: "overview", name: "Overview", position: 0, isDefault: true },
  ]
  private dashboardCards: DashboardCard[] = []
  private dashboardLayouts: DashboardLayoutEntry[] = []
  async upsertAssetSnapshot(
    input: UpsertAssetSnapshotInput,
  ): Promise<Result<AssetSnapshotSummary>> {
    return upsertAssetSnapshotFacade(this.assetRepository(), input)
  }

  /**
   * Net worth folds two debt sources into one liability figure: manually tracked
   * liability snapshots (handled by the assets layer) plus the outstanding
   * principal of active loans (a stock, not the payment schedule). Loans stay a
   * separate domain, so this cross-domain aggregation lives in the facade rather
   * than the assets repository.
   */
  override async getNetWorthSnapshot(input: NetWorthInput = {}): Promise<Result<NetWorthSnapshot>> {
    const base = await super.getNetWorthSnapshot(input)
    if (!base.success) return base
    const loansResult = await this.listLoans({ status: "active" })
    if (!loansResult.success) return base

    const settings = await this.getCurrencySettings()
    const displayCurrency = normalizeCurrency(
      input.displayCurrency ??
        (settings.success ? settings.data.displayCurrency : DEFAULT_CURRENCY),
    )
    const today = nowIso().slice(0, 10)
    const missingFx = [...base.data.missingFx]
    let loanLiability = 0
    for (const loan of loansResult.data) {
      // Outstanding principal is the balance-sheet liability — not the original
      // principal and not the remaining payments (which include future interest).
      const outstanding = Number(loan.currentPrincipalEstimate ?? loan.principalAmount ?? 0)
      if (outstanding <= 0) continue
      const currency = normalizeCurrency(loan.currency)
      const converted =
        currency === displayCurrency
          ? outstanding
          : await this.convertAmount(outstanding, currency, displayCurrency, today)
      if (converted == null) {
        missingFx.push({ assetItemId: loan.id, currency, date: today })
        continue
      }
      loanLiability += converted
    }

    if (loanLiability === 0 && missingFx.length === base.data.missingFx.length) return base

    const assetValue = Number(base.data.assetValue.number)
    const liabilityValue = Number(base.data.liabilityValue.number) + loanLiability
    return ok({
      netWorth: { number: (assetValue - liabilityValue).toFixed(2), currency: displayCurrency },
      assetValue: base.data.assetValue,
      liabilityValue: { number: liabilityValue.toFixed(2), currency: displayCurrency },
      missingFx,
    })
  }

  async getDashboardSnapshot(): Promise<Result<DashboardSnapshot>> {
    try {
      const netWorth = await this.getNetWorthSnapshot()
      const income = await this.getCashflowSummary({ metric: "income", ...monthBounds() })
      const expense = await this.getCashflowSummary({ metric: "everyday_spend", ...monthBounds() })
      const cashflow = await this.listCashflowEvents({ limit: 30 })
      const net = netWorth.success
        ? netWorth.data.netWorth
        : { number: "0.00", currency: DEFAULT_CURRENCY }
      const incomeAmount = income.success ? income.data.amount : "0.00"
      const expenseAmount = expense.success ? expense.data.amount : "0.00"
      return ok({
        metrics: {
          netWorth: net,
          cash: {
            number: netWorth.success ? netWorth.data.assetValue.number : "0.00",
            currency: net.currency,
          },
          incomeMtd: { number: incomeAmount, currency: DEFAULT_CURRENCY },
          expenseMtd: { number: expenseAmount, currency: DEFAULT_CURRENCY },
          savingsMtd: {
            number: (Number(incomeAmount) - Number(expenseAmount)).toFixed(2),
            currency: DEFAULT_CURRENCY,
          },
        },
        pnlStrip: [],
        dayFlow: cashflow.success
          ? cashflow.data.map((event) => ({
              id: event.id,
              time: event.eventDate,
              symbol: event.flowKind,
              category: event.categoryName ?? event.flowKind,
              account: event.sourceName ?? "",
              amountNumber: event.amount,
              currency: event.currency,
              kind:
                event.flowKind === "income"
                  ? "income"
                  : event.flowKind === "transfer"
                    ? "transfer"
                    : "expense",
            }))
          : [],
        cashflowEvents: cashflow.success
          ? (cashflow.data as unknown as Record<string, unknown>[])
          : [],
        holdings: [],
        accounts: [],
        generatedAt: nowIso(),
      })
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardViews(): Promise<Result<DashboardView[]>> {
    return ok(this.dashboardViews)
  }

  async createDashboardView(input: CreateDashboardViewInput): Promise<Result<DashboardView>> {
    const id = newId("view")
    const view = {
      id,
      slug: id,
      name: input.name,
      position: this.dashboardViews.length,
      isDefault: false,
    }
    this.dashboardViews.push(view)
    return ok(view)
  }

  async updateDashboardView(input: UpdateDashboardViewInput): Promise<Result<DashboardView>> {
    const existing = this.dashboardViews.find((view) => view.id === input.id)
    if (!existing) return fail(`Dashboard view ${input.id} not found`)
    if (input.name !== undefined) existing.name = input.name
    if (input.position !== undefined) existing.position = input.position
    return ok(existing)
  }

  async removeDashboardView(input: { id: string }): Promise<Result<void>> {
    this.dashboardViews = this.dashboardViews.filter((view) => view.id !== input.id)
    return ok(undefined)
  }

  async saveDashboardViewOrder(input: { ids: string[] }): Promise<Result<DashboardView[]>> {
    this.dashboardViews = this.dashboardViews
      .map((view) => ({
        ...view,
        position: input.ids.indexOf(view.id) < 0 ? view.position : input.ids.indexOf(view.id),
      }))
      .sort((a, b) => a.position - b.position)
    return ok(this.dashboardViews)
  }

  async listDashboardCards(input: ListDashboardCardsInput = {}): Promise<Result<DashboardCard[]>> {
    return ok(
      this.dashboardCards.filter((card) => input.viewId == null || card.viewId === input.viewId),
    )
  }

  async listDashboardLayouts(
    input: ListDashboardLayoutsInput = {},
  ): Promise<Result<DashboardLayoutEntry[]>> {
    const cardIds = new Set(
      this.dashboardCards
        .filter((card) => input.viewId == null || card.viewId === input.viewId)
        .map((card) => card.id),
    )
    return ok(this.dashboardLayouts.filter((layout) => cardIds.has(layout.cardId)))
  }

  async addDashboardCard(input: AddDashboardCardInput): Promise<Result<DashboardCard>> {
    const card: DashboardCard = {
      id: newId("card"),
      viewId: input.viewId,
      type: input.type,
      title: input.title ?? null,
      code: input.code ?? null,
      config: input.config ?? {},
      position: input.position ?? this.dashboardCards.length,
      hidden: false,
    }
    this.dashboardCards.push(card)
    this.dashboardLayouts.push(...input.layouts.map((layout) => ({ ...layout, cardId: card.id })))
    return ok(card)
  }

  async updateDashboardCard(input: UpdateDashboardCardInput): Promise<Result<DashboardCard>> {
    const card = this.dashboardCards.find((row) => row.id === input.id)
    if (!card) return fail(`Dashboard card ${input.id} not found`)
    if (input.title !== undefined) card.title = input.title
    if (input.code !== undefined) card.code = input.code
    if (input.config !== undefined) card.config = input.config
    if (input.hidden !== undefined) card.hidden = input.hidden
    return ok(card)
  }

  async removeDashboardCard(input: { id: string }): Promise<Result<void>> {
    this.dashboardCards = this.dashboardCards.filter((card) => card.id !== input.id)
    this.dashboardLayouts = this.dashboardLayouts.filter((layout) => layout.cardId !== input.id)
    return ok(undefined)
  }

  async saveDashboardLayouts(input: SaveDashboardLayoutsInput): Promise<Result<void>> {
    this.dashboardLayouts = [
      ...this.dashboardLayouts.filter(
        (layout) =>
          !input.rows.some(
            (row) => row.cardId === layout.cardId && row.breakpoint === layout.breakpoint,
          ),
      ),
      ...input.rows,
    ]
    return ok(undefined)
  }

  async resetDashboardLayout(): Promise<Result<void>> {
    this.dashboardLayouts = []
    return ok(undefined)
  }
}
