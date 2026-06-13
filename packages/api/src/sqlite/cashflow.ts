import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CashflowBreakdownInput, CashflowBreakdownRow, CashflowEventSummary, CashflowSummary, CashflowSummaryInput, CreateCashflowEventInput, FlowmId, ListCashflowEventsInput, UpdateCashflowEventInput } from "../index"
import { ImportsApi } from "./imports"
import { DEFAULT_CURRENCY, fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class CashflowApi extends ImportsApi {
  async listCashflowEvents(input: ListCashflowEventsInput = {}): Promise<Result<CashflowEventSummary[]>> {
    try {
      const rows = await this.cashflowRows(input)
      return ok(await Promise.all(rows.map((row) => this.mapCashflowEvent(row))))
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowEvent(id: FlowmId): Promise<Result<CashflowEventSummary | null>> {
    try {
      const row = await this.one(`select ce.*, c.name as category_name from cashflow_events ce left join categories c on c.id = ce.category_id where ce.id = ?`, [toSqlId(id)])
      return ok(row ? await this.mapCashflowEvent(row) : null)
    } catch (error) {
      return fail(error)
    }
  }

  async createCashflowEvent(input: CreateCashflowEventInput): Promise<Result<CashflowEventSummary>> {
    try {
      const id = newId("cf")
      const timestamp = nowIso()
      await this.run(
        `insert into cashflow_events
          (id, event_date, occurred_at, title, counterparty, description, user_note, amount, currency, direction, flow_kind,
           category_id, source_kind, source_name, payment_method, account_hint, include_in_analytics, classification_source, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.eventDate,
          input.occurredAt ?? null,
          input.title ?? input.counterparty ?? null,
          input.counterparty ?? null,
          input.description ?? null,
          input.userNote ?? null,
          input.amount,
          normalizeCurrency(input.currency),
          input.direction,
          input.flowKind,
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.sourceKind ?? "manual",
          input.sourceName ?? null,
          input.paymentMethod ?? null,
          input.accountHint ?? null,
          input.includeInAnalytics ?? true,
          input.classificationSource ?? "manual",
          timestamp,
          timestamp,
        ],
      )
      if (input.tagIds) await this.setCashflowEventTags({ id, tagIds: input.tagIds })
      return ok((await this.getCashflowEvent(id)).success ? (await this.getCashflowEvent(id) as { success: true; data: CashflowEventSummary | null }).data! : (() => { throw new Error("created cashflow event not found") })())
    } catch (error) {
      return fail(error)
    }
  }

  async updateCashflowEvent(input: UpdateCashflowEventInput): Promise<Result<CashflowEventSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      if (input.eventDate !== undefined) { fields.push("event_date = ?"); params.push(input.eventDate) }
      if (input.title !== undefined) { fields.push("title = ?"); params.push(input.title) }
      if (input.counterparty !== undefined) { fields.push("counterparty = ?"); params.push(input.counterparty) }
      if (input.description !== undefined) { fields.push("description = ?"); params.push(input.description) }
      if (input.userNote !== undefined) { fields.push("user_note = ?"); params.push(input.userNote) }
      if (input.amount !== undefined) { fields.push("amount = ?"); params.push(input.amount) }
      if (input.currency !== undefined) { fields.push("currency = ?"); params.push(normalizeCurrency(input.currency)) }
      if (input.direction !== undefined) { fields.push("direction = ?"); params.push(input.direction) }
      if (input.flowKind !== undefined) { fields.push("flow_kind = ?"); params.push(input.flowKind) }
      if (input.categoryId !== undefined) { fields.push("category_id = ?"); params.push(input.categoryId == null ? null : toSqlId(input.categoryId)) }
      if (input.includeInAnalytics !== undefined) { fields.push("include_in_analytics = ?"); params.push(input.includeInAnalytics) }
      if (input.status !== undefined) { fields.push("status = ?"); params.push(input.status) }
      params.push(toSqlId(input.id))
      await this.run(`update cashflow_events set ${fields.join(", ")} where id = ?`, params)
      const event = await this.getCashflowEvent(input.id)
      if (!event.success || event.data == null) throw new Error(`Cashflow event ${input.id} not found`)
      return ok(event.data)
    } catch (error) {
      return fail(error)
    }
  }

  async ignoreCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update cashflow_events set status = 'ignored', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async deleteCashflowEvent(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update cashflow_events set status = 'deleted', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventCategory(input: { id: FlowmId; categoryId: FlowmId | null }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, categoryId: input.categoryId })
  }

  async setCashflowEventTags(input: { id: FlowmId; tagIds: FlowmId[] }): Promise<Result<void>> {
    try {
      await this.run("delete from cashflow_event_tags where cashflow_event_id = ?", [toSqlId(input.id)])
      for (const tagId of input.tagIds) {
        await this.run("insert or ignore into cashflow_event_tags (cashflow_event_id, tag_id) values (?, ?)", [toSqlId(input.id), toSqlId(tagId)])
      }
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async setCashflowEventAnalyticsIncluded(input: { id: FlowmId; includeInAnalytics: boolean }): Promise<Result<CashflowEventSummary>> {
    return this.updateCashflowEvent({ id: input.id, includeInAnalytics: input.includeInAnalytics })
  }

  async getCashflowSummary(input: CashflowSummaryInput = {}): Promise<Result<CashflowSummary>> {
    try {
      const metric = input.metric ?? "everyday_spend"
      if (metric === "net_cashflow") {
        const income = Number((await this.getCashflowSummary({ ...input, metric: "income" }) as { success: true; data: CashflowSummary }).data.amount)
        const spend = Number((await this.getCashflowSummary({ ...input, metric: "everyday_spend" }) as { success: true; data: CashflowSummary }).data.amount)
        return ok({ metric, amount: (income - spend).toFixed(2), currency: DEFAULT_CURRENCY })
      }
      const { where, params } = this.cashflowMetricWhere(metric, input)
      const row = await this.one(`select coalesce(sum(cast(amount as real)), 0) as total from cashflow_events ${where}`, params)
      return ok({ metric, amount: Number(row?.total ?? 0).toFixed(2), currency: DEFAULT_CURRENCY })
    } catch (error) {
      return fail(error)
    }
  }

  async getCashflowBreakdown(input: CashflowBreakdownInput = {}): Promise<Result<CashflowBreakdownRow[]>> {
    try {
      const groupBy = input.groupBy ?? "flow_kind"
      const { where, params } = this.cashflowMetricWhere(input.metric ?? "all_activity", input)
      const select = groupBy === "category"
        ? "coalesce(c.name, '未分类') as label, coalesce(ce.category_id, 'uncategorized') as key"
        : groupBy === "source"
          ? "coalesce(ce.source_name, 'unknown') as key, coalesce(ce.source_name, 'unknown') as label"
          : "ce.flow_kind as key, ce.flow_kind as label"
      const join = groupBy === "category" ? "left join categories c on c.id = ce.category_id" : ""
      const rows = await this.all(
        `select ${select}, coalesce(sum(cast(ce.amount as real)), 0) as amount
         from cashflow_events ce ${join} ${where.replace(/^where /, "where ")}
         group by key, label order by amount desc`,
        params,
      )
      return ok(rows.map((row) => ({
        key: String(row.key),
        label: String(row.label),
        amount: Number(row.amount ?? 0).toFixed(2),
        currency: DEFAULT_CURRENCY,
      })))
    } catch (error) {
      return fail(error)
    }
  }


}
