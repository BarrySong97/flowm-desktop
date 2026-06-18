/**
 * @purpose Implement cashflow persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, desc, eq, getTableColumns, gte, lte, sql, type SQL } from "drizzle-orm"
import {
  cashflowEventTags,
  cashflowEvents,
  categories,
  type CashflowEventInsert,
  type CashflowEventRow,
  type CategoryRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CashflowBreakdownInput,
  CashflowBreakdownRow,
  CashflowEventSummary,
  CashflowSummary,
  CashflowSummaryInput,
  CreateCashflowEventInput,
  FlowmId,
  ListCashflowEventsInput,
  MonthlyCashflowTrendInput,
  MonthlyCashflowTrendRow,
  UpdateCashflowEventInput,
} from "../../../index"
import { ImportsApiRepository } from "./imports-api.repository"
import {
  DEFAULT_CURRENCY,
  categoryKindForFlowKind,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  sumReal,
  toSqlId,
} from "../../../shared/api-helpers"

function addMonthsKey(monthKey: string, months: number): string {
  const [year, month] = monthKey.split("-").map(Number)
  const date = new Date(Date.UTC(year, month - 1 + months, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
}

function monthStartKey(monthKey: string): string {
  return `${monthKey}-01`
}

export abstract class CashflowApiRepository extends ImportsApiRepository {
  async listCashflowEvents(
    input: ListCashflowEventsInput = {},
  ): Promise<Result<CashflowEventSummary[]>> {
    try {
      const rows = await this.cashflowRows(input)
      return ok(await Promise.all(rows.map((row) => this.mapCashflowEvent(row))))
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowEvent(id: FlowmId): Promise<Result<CashflowEventSummary | null>> {
    try {
      const row = this.db
        .select({ ...getTableColumns(cashflowEvents), categoryName: categories.name })
        .from(cashflowEvents)
        .leftJoin(categories, eq(categories.id, cashflowEvents.categoryId))
        .where(eq(cashflowEvents.id, toSqlId(id)))
        .get()
      return ok(row ? await this.mapCashflowEvent(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createCashflowEvent(
    input: CreateCashflowEventInput,
  ): Promise<Result<CashflowEventSummary>> {
    try {
      this.assertCategoryMatchesFlowKind(input.flowKind, input.categoryId)
      const id = newId("cf")
      const timestamp = nowIso()
      this.db
        .insert(cashflowEvents)
        .values({
          id,
          eventDate: input.eventDate,
          occurredAt: input.occurredAt ?? null,
          title: input.title ?? input.counterparty ?? null,
          counterparty: input.counterparty ?? null,
          description: input.description ?? null,
          userNote: input.userNote ?? null,
          amount: input.amount,
          currency: normalizeCurrency(input.currency),
          direction: input.direction,
          flowKind: input.flowKind,
          categoryId: input.categoryId == null ? null : toSqlId(input.categoryId),
          sourceKind: input.sourceKind ?? "manual",
          sourceName: input.sourceName ?? null,
          sourceExternalId: input.sourceExternalId ?? null,
          sourceFileHash: input.sourceFileHash ?? null,
          importedAt: input.importedAt ?? null,
          paymentMethod: input.paymentMethod ?? null,
          accountHint: input.accountHint ?? null,
          includeInAnalytics: input.includeInAnalytics ?? true,
          classificationSource: input.classificationSource ?? "manual",
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      if (input.tagIds) await this.setCashflowEventTags({ id, tagIds: input.tagIds })
      const created = await this.getCashflowEvent(id)
      if (!created.success || created.data == null)
        throw new Error("created cashflow event not found")
      return ok(created.data)
    } catch (error) {
      return fail(error)
    }
  }

  async updateCashflowEvent(
    input: UpdateCashflowEventInput,
  ): Promise<Result<CashflowEventSummary>> {
    try {
      const current = this.findCashflowEventForUpdate(input.id)
      if (!current) throw new Error(`Cashflow event ${input.id} not found`)
      if (input.flowKind !== undefined || input.categoryId !== undefined) {
        this.assertCategoryMatchesFlowKind(
          input.flowKind ?? current.flowKind,
          input.categoryId !== undefined ? input.categoryId : current.categoryId,
        )
      }
      const set: Partial<CashflowEventInsert> = { updatedAt: nowIso() }
      if (input.eventDate !== undefined) set.eventDate = input.eventDate
      if (input.title !== undefined) set.title = input.title
      if (input.counterparty !== undefined) set.counterparty = input.counterparty
      if (input.description !== undefined) set.description = input.description
      if (input.userNote !== undefined) set.userNote = input.userNote
      if (input.amount !== undefined) set.amount = input.amount
      if (input.currency !== undefined) set.currency = normalizeCurrency(input.currency)
      if (input.direction !== undefined) set.direction = input.direction
      if (input.flowKind !== undefined) set.flowKind = input.flowKind
      if (input.categoryId !== undefined)
        set.categoryId = input.categoryId == null ? null : toSqlId(input.categoryId)
      if (input.includeInAnalytics !== undefined) set.includeInAnalytics = input.includeInAnalytics
      if (input.status !== undefined) set.status = input.status
      this.db
        .update(cashflowEvents)
        .set(set)
        .where(eq(cashflowEvents.id, toSqlId(input.id)))
        .run()
      const event = await this.getCashflowEvent(input.id)
      if (!event.success || event.data == null)
        throw new Error(`Cashflow event ${input.id} not found`)
      return ok(event.data)
    } catch (error) {
      return fail(error)
    }
  }

  async ignoreCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(cashflowEvents)
        .set({ status: "ignored", updatedAt: nowIso() })
        .where(eq(cashflowEvents.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async deleteCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(cashflowEvents)
        .set({ status: "deleted", updatedAt: nowIso() })
        .where(eq(cashflowEvents.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventCategory(input: {
    id: FlowmId
    categoryId: FlowmId | null
  }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, categoryId: input.categoryId })
  }

  async setCashflowEventTags(input: { id: FlowmId; tagIds: FlowmId[] }): Promise<Result<void>> {
    try {
      this.db
        .delete(cashflowEventTags)
        .where(eq(cashflowEventTags.cashflowEventId, toSqlId(input.id)))
        .run()
      for (const tagId of input.tagIds) {
        this.db
          .insert(cashflowEventTags)
          .values({ cashflowEventId: toSqlId(input.id), tagId: toSqlId(tagId) })
          .onConflictDoNothing()
          .run()
      }
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventAnalyticsIncluded(input: {
    id: FlowmId
    includeInAnalytics: boolean
  }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, includeInAnalytics: input.includeInAnalytics })
  }

  async getCashflowSummary(input: CashflowSummaryInput = {}): Promise<Result<CashflowSummary>> {
    try {
      const metric = input.metric ?? "everyday_spend"
      if (metric === "net_cashflow") {
        const income = Number(
          (
            (await this.getCashflowSummary({ ...input, metric: "income" })) as {
              success: true
              data: CashflowSummary
            }
          ).data.amount,
        )
        const spend = Number(
          (
            (await this.getCashflowSummary({ ...input, metric: "everyday_spend" })) as {
              success: true
              data: CashflowSummary
            }
          ).data.amount,
        )
        return ok({ metric, amount: (income - spend).toFixed(2), currency: DEFAULT_CURRENCY })
      }
      const total = this.sumCashflowAmount(this.cashflowMetricWhere(metric, input))
      return ok({ metric, amount: total.toFixed(2), currency: DEFAULT_CURRENCY })
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowBreakdown(
    input: CashflowBreakdownInput = {},
  ): Promise<Result<CashflowBreakdownRow[]>> {
    try {
      const groupBy = input.groupBy ?? "flow_kind"
      const where = this.cashflowMetricWhere(input.metric ?? "all_activity", input)
      const keyExpr: SQL<string> =
        groupBy === "category"
          ? sql<string>`coalesce(${cashflowEvents.categoryId}, 'uncategorized')`
          : groupBy === "source"
            ? sql<string>`coalesce(${cashflowEvents.sourceName}, 'unknown')`
            : sql<string>`${cashflowEvents.flowKind}`
      const labelExpr: SQL<string> =
        groupBy === "category"
          ? sql<string>`coalesce(${categories.name}, '未分类')`
          : groupBy === "source"
            ? sql<string>`coalesce(${cashflowEvents.sourceName}, 'unknown')`
            : sql<string>`${cashflowEvents.flowKind}`
      const amountExpr = sumReal(cashflowEvents.amount)
      const rows = this.db
        .select({ key: keyExpr, label: labelExpr, amount: amountExpr })
        .from(cashflowEvents)
        .leftJoin(categories, eq(categories.id, cashflowEvents.categoryId))
        .where(where)
        .groupBy(keyExpr, labelExpr)
        .orderBy(desc(amountExpr))
        .all()
      return ok(
        rows.map((row) => ({
          key: String(row.key),
          label: String(row.label),
          amount: Number(row.amount ?? 0).toFixed(2),
          currency: DEFAULT_CURRENCY,
        })),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async getMonthlyCashflowTrend(
    input: MonthlyCashflowTrendInput = {},
  ): Promise<Result<MonthlyCashflowTrendRow[]>> {
    try {
      const months = Math.max(1, Math.min(36, Math.floor(input.months ?? 12)))
      const dateTo = input.dateTo ?? new Date().toISOString().slice(0, 10)
      const dateFrom =
        input.dateFrom ?? monthStartKey(addMonthsKey(dateTo.slice(0, 7), -(months - 1)))
      const monthExpr = sql<string>`substr(${cashflowEvents.eventDate}, 1, 7)`
      const incomeExpr = sql<number>`coalesce(sum(case when ${cashflowEvents.flowKind} = 'income' and ${cashflowEvents.direction} = 'in' then cast(${cashflowEvents.amount} as real) else 0 end), 0)`
      const expenseExpr = sql<number>`coalesce(sum(case when ${cashflowEvents.flowKind} = 'expense' and ${cashflowEvents.direction} = 'out' then cast(${cashflowEvents.amount} as real) else 0 end), 0)`
      const conds: SQL[] = [
        eq(cashflowEvents.status, "active"),
        gte(cashflowEvents.eventDate, dateFrom),
        lte(cashflowEvents.eventDate, dateTo),
      ]
      if (!input.includeIgnored) conds.push(eq(cashflowEvents.includeInAnalytics, true))

      const rows = this.db
        .select({
          month: monthExpr,
          income: incomeExpr,
          expense: expenseExpr,
        })
        .from(cashflowEvents)
        .where(and(...conds))
        .groupBy(monthExpr)
        .orderBy(asc(monthExpr))
        .all()

      const byMonth = new Map(
        rows.map((row) => [
          String(row.month),
          { income: Number(row.income ?? 0), expense: Number(row.expense ?? 0) },
        ]),
      )
      const startMonth = dateFrom.slice(0, 7)
      return ok(
        Array.from({ length: months }, (_, index) => {
          const month = addMonthsKey(startMonth, index)
          const values = byMonth.get(month) ?? { income: 0, expense: 0 }
          const net = values.income - values.expense
          return {
            month,
            income: values.income.toFixed(2),
            expense: values.expense.toFixed(2),
            net: net.toFixed(2),
            currency: DEFAULT_CURRENCY,
          }
        }),
      )
    } catch (error) {
      return fail(error)
    }
  }

  private findCashflowEventForUpdate(id: FlowmId): CashflowEventRow | undefined {
    return this.db
      .select()
      .from(cashflowEvents)
      .where(eq(cashflowEvents.id, toSqlId(id)))
      .get()
  }

  private findCategoryById(id: FlowmId): CategoryRow | undefined {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.id, toSqlId(id)))
      .get()
  }

  private assertCategoryMatchesFlowKind(
    flowKind: CashflowEventRow["flowKind"] | string,
    categoryId: FlowmId | null | undefined,
  ): void {
    if (categoryId == null) return
    const category = this.findCategoryById(categoryId)
    if (!category) throw new Error(`Category not found: ${categoryId}`)

    const expectedKind = categoryKindForFlowKind(flowKind)
    if (category.categoryKind !== expectedKind) {
      throw new Error(
        `Category "${category.name}" is ${category.categoryKind}, cannot be used for ${flowKind} cashflow`,
      )
    }
  }
}
