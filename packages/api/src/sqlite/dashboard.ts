/**
 * @purpose Implement dashboard queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { Result } from "@flowm/shared"
import type { AddDashboardCardInput, CreateDashboardViewInput, CreateFinancialEventInput, CreateLoanInput, CreatePlanInput, DashboardCard, DashboardLayoutEntry, DashboardSnapshot, DashboardView, FinancialEventSummary, FlowQueryResult, FlowmApi, FlowmId, ListDashboardCardsInput, ListDashboardLayoutsInput, ListFinancialEventsInput, ListPlansInput, PlanSummary, RunFlowQueryInput, SaveDashboardLayoutsInput, UpdateDashboardCardInput, UpdateDashboardViewInput, UpdateFinancialEventInput, UpdatePlanInput } from "../index"
import { LinksApi } from "./links"
import { DEFAULT_CURRENCY, fail, monthBounds, newId, normalizeCashflowKind, normalizeDirection, nowIso, ok } from "./base"

export class FlowmSqliteApi extends LinksApi implements FlowmApi {
  private dashboardViews: DashboardView[] = [{ id: "overview", slug: "overview", name: "Overview", position: 0, isDefault: true }]
  private dashboardCards: DashboardCard[] = []
  private dashboardLayouts: DashboardLayoutEntry[] = []
  async getDashboardSnapshot(): Promise<Result<DashboardSnapshot>> {
    try {
      const netWorth = await this.getNetWorthSnapshot()
      const income = await this.getCashflowSummary({ metric: "income", ...monthBounds() })
      const expense = await this.getCashflowSummary({ metric: "everyday_spend", ...monthBounds() })
      const cashflow = await this.listCashflowEvents({ limit: 30 })
      const net = netWorth.success ? netWorth.data.netWorth : { number: "0.00", currency: DEFAULT_CURRENCY }
      const incomeAmount = income.success ? income.data.amount : "0.00"
      const expenseAmount = expense.success ? expense.data.amount : "0.00"
      return ok({
        metrics: {
          netWorth: net,
          cash: { number: netWorth.success ? netWorth.data.assetValue.number : "0.00", currency: net.currency },
          incomeMtd: { number: incomeAmount, currency: DEFAULT_CURRENCY },
          expenseMtd: { number: expenseAmount, currency: DEFAULT_CURRENCY },
          savingsMtd: { number: (Number(incomeAmount) - Number(expenseAmount)).toFixed(2), currency: DEFAULT_CURRENCY },
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
              kind: event.flowKind === "income" ? "income" : event.flowKind === "transfer" ? "transfer" : "expense",
            }))
          : [],
        transactions: cashflow.success ? cashflow.data as unknown as Record<string, unknown>[] : [],
        holdings: [],
        accounts: [],
        generatedAt: nowIso(),
      })
    } catch (error) {
      return fail(error)
    }
  }

  async listFinancialEvents(input: ListFinancialEventsInput = {}): Promise<Result<FinancialEventSummary[]>> {
    return this.listCashflowEvents({
      dateFrom: input.dateFrom,
      dateTo: input.dateTo,
      flowKind: input.flowKind ? normalizeCashflowKind(input.flowKind) : undefined,
      categoryId: input.categoryId,
      sourceName: input.source,
      limit: input.limit,
      offset: input.offset,
    })
  }

  async createFinancialEvent(input: CreateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    return this.createCashflowEvent({
      eventDate: input.date,
      occurredAt: input.occurredAt ?? null,
      title: input.counterparty ?? input.description ?? null,
      counterparty: input.counterparty ?? null,
      description: input.description ?? null,
      amount: input.amount,
      currency: input.currency,
      direction: normalizeDirection(input.direction),
      flowKind: normalizeCashflowKind(input.flowKind),
      categoryId: input.categoryId,
      accountHint: input.accountHint,
    })
  }

  async updateFinancialEvent(input: UpdateFinancialEventInput): Promise<Result<FinancialEventSummary>> {
    return this.updateCashflowEvent({
      id: input.id,
      flowKind: input.flowKind == null ? undefined : normalizeCashflowKind(input.flowKind),
      categoryId: input.categoryId,
      description: input.description,
    })
  }

  async removeFinancialEvent(input: { id: FlowmId }): Promise<Result<void>> {
    return this.deleteCashflowEvent(input)
  }

  async rebuildFinancialEventsFromImports(input?: { batchId?: FlowmId }): Promise<Result<{ created: number; skipped: number }>> {
    return this.convertStatementLinesToCashflowEvents({ importId: input?.batchId })
  }

  async listPlans(input: ListPlansInput = {}): Promise<Result<PlanSummary[]>> {
    try {
      const plans: PlanSummary[] = []
      if (input.planType == null || input.planType === "subscription") {
        const subs = await this.listSubscriptions({ status: input.status })
        if (subs.success) {
          plans.push(...subs.data.map((sub) => ({
            id: sub.id,
            planType: "subscription",
            name: sub.name,
            counterparty: sub.merchant,
            amount: sub.amount,
            currency: sub.currency,
            scheduleRule: `FREQ=${sub.billingCycle.toUpperCase()}`,
            startDate: sub.nextChargeDate,
            nextDueDate: sub.nextChargeDate,
            status: sub.status,
            categoryId: sub.categoryId,
            meta: { sourceDomain: "subscriptions" },
          })))
        }
      }
      if (input.planType == null || input.planType === "loan_repayment" || input.planType === "loan") {
        const loans = await this.listLoans({ status: input.status })
        if (loans.success) {
          plans.push(...loans.data.map((loan) => ({
            id: loan.id,
            planType: "loan_repayment",
            name: loan.name,
            counterparty: loan.lender,
            amount: loan.paymentAmount,
            currency: loan.currency,
            scheduleRule: "FREQ=MONTHLY",
            startDate: loan.startDate,
            nextDueDate: loan.startDate,
            status: loan.status,
            meta: { sourceDomain: "loans" },
          })))
        }
      }
      return ok(plans)
    } catch (error) {
      return fail(error)
    }
  }

  async createPlan(input: CreatePlanInput): Promise<Result<PlanSummary>> {
    if (input.planType === "loan_repayment" || input.planType === "loan") {
      const loan = await this.createLoan({
        name: input.name,
        lender: input.counterparty,
        amount: undefined as never,
        paymentAmount: input.amount,
        currency: input.currency,
        startDate: input.startDate,
        note: input.meta == null ? null : JSON.stringify(input.meta),
      } as CreateLoanInput)
      if (!loan.success) return fail(loan.error)
    } else {
      const sub = await this.createSubscription({
        name: input.name,
        merchant: input.counterparty,
        amount: input.amount,
        currency: input.currency,
        billingCycle: input.scheduleRule.includes("YEARLY") ? "yearly" : input.scheduleRule.includes("WEEKLY") ? "weekly" : "monthly",
        nextChargeDate: input.startDate,
        categoryId: input.categoryId,
        note: input.meta == null ? null : JSON.stringify(input.meta),
      })
      if (!sub.success) return fail(sub.error)
    }
    const plans = await this.listPlans({ planType: input.planType })
    if (!plans.success) return fail(plans.error)
    return ok(plans.data[plans.data.length - 1]!)
  }

  async updatePlan(input: UpdatePlanInput): Promise<Result<PlanSummary>> {
    const plan = (await this.listPlans()).success ? (await this.listPlans() as { success: true; data: PlanSummary[] }).data.find((row) => row.id === input.id) : null
    if (plan?.planType === "loan_repayment") {
      const updated = await this.updateLoan({ id: input.id, name: input.name, paymentAmount: input.amount, currency: input.currency, startDate: input.startDate, status: input.status })
      if (!updated.success) return fail(updated.error)
    } else {
      const updated = await this.updateSubscription({ id: input.id, name: input.name, merchant: input.counterparty, amount: input.amount, currency: input.currency, nextChargeDate: input.startDate, status: input.status })
      if (!updated.success) return fail(updated.error)
    }
    const plans = await this.listPlans()
    if (!plans.success) return fail(plans.error)
    return ok(plans.data.find((row) => row.id === input.id)!)
  }

  async generatePlanOccurrences(input: { planId?: FlowmId; throughDate: string }): Promise<Result<{ generated: number }>> {
    const sub = await this.generateSubscriptionOccurrences({ id: input.planId, throughDate: input.throughDate })
    const loan = await this.generateLoanPaymentOccurrences({ id: input.planId, throughDate: input.throughDate })
    return ok({ generated: (sub.success ? sub.data.generated : 0) + (loan.success ? loan.data.generated : 0) })
  }

  async runFlowQuery(input: RunFlowQueryInput): Promise<Result<FlowQueryResult>> {
    try {
      if (input.sql == null || input.sql.trim().length === 0) return ok({ rows: [], columns: [] })
      const rows = await this.all(input.sql)
      return ok({ rows: rows as Record<string, unknown>[], columns: rows[0] == null ? [] : Object.keys(rows[0]), total: undefined })
    } catch (error) {
      return fail(error)
    }
  }

  async listDashboardViews(): Promise<Result<DashboardView[]>> {
    return ok(this.dashboardViews)
  }

  async createDashboardView(input: CreateDashboardViewInput): Promise<Result<DashboardView>> {
    const id = newId("view")
    const view = { id, slug: id, name: input.name, position: this.dashboardViews.length, isDefault: false }
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
    this.dashboardViews = this.dashboardViews.map((view) => ({
      ...view,
      position: input.ids.indexOf(view.id) < 0 ? view.position : input.ids.indexOf(view.id),
    })).sort((a, b) => a.position - b.position)
    return ok(this.dashboardViews)
  }

  async listDashboardCards(input: ListDashboardCardsInput = {}): Promise<Result<DashboardCard[]>> {
    return ok(this.dashboardCards.filter((card) => input.viewId == null || card.viewId === input.viewId))
  }

  async listDashboardLayouts(input: ListDashboardLayoutsInput = {}): Promise<Result<DashboardLayoutEntry[]>> {
    const cardIds = new Set(this.dashboardCards.filter((card) => input.viewId == null || card.viewId === input.viewId).map((card) => card.id))
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
      ...this.dashboardLayouts.filter((layout) => !input.rows.some((row) => row.cardId === layout.cardId && row.breakpoint === layout.breakpoint)),
      ...input.rows,
    ]
    return ok(undefined)
  }

  async resetDashboardLayout(): Promise<Result<void>> {
    this.dashboardLayouts = []
    return ok(undefined)
  }


}
