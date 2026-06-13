import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { BudgetItemSummary, BudgetPeriodSummary, BudgetProgressRow, BudgetReferenceProgressInput, BudgetReferenceProgressRow, BudgetSetSummary, BusinessRecord, CreateBudgetInput, CreateBudgetItemInput, CreateBudgetPeriodInput, CreateBudgetSetInput, ListBudgetItemsInput, ListBudgetPeriodsInput, UpdateBudgetItemInput } from "../index"
import { LoansApi } from "./loans"
import { fail, monthBounds, newId, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class BudgetsApi extends LoansApi {
  async listBudgetSets(): Promise<Result<BudgetSetSummary[]>> {
    try {
      const rows = await this.all("select * from budget_sets order by created_at asc")
      return ok(rows.map(this.mapBudgetSet))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetSet(input: CreateBudgetSetInput): Promise<Result<BudgetSetSummary>> {
    try {
      const id = newId("bset")
      const timestamp = nowIso()
      await this.run("insert into budget_sets (id, name, created_at, updated_at) values (?, ?, ?, ?)", [id, input.name, timestamp, timestamp])
      return ok(this.mapBudgetSet((await this.one("select * from budget_sets where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetPeriods(input: ListBudgetPeriodsInput = {}): Promise<Result<BudgetPeriodSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.budgetSetId) { conds.push("budget_set_id = ?"); params.push(toSqlId(input.budgetSetId)) }
      if (input.status) { conds.push("status = ?"); params.push(input.status) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from budget_periods ${where} order by period_start desc`, params)
      return ok(rows.map(this.mapBudgetPeriod))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetPeriod(input: CreateBudgetPeriodInput): Promise<Result<BudgetPeriodSummary>> {
    try {
      const id = newId("bper")
      await this.run(
        `insert into budget_periods (id, budget_set_id, period_kind, period_start, period_end, currency)
         values (?, ?, ?, ?, ?, ?)`,
        [id, toSqlId(input.budgetSetId), input.periodKind, input.periodStart, input.periodEnd, normalizeCurrency(input.currency)],
      )
      return ok(this.mapBudgetPeriod((await this.one("select * from budget_periods where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetItems(input: ListBudgetItemsInput = {}): Promise<Result<BudgetItemSummary[]>> {
    try {
      const where = input.budgetPeriodId ? "where budget_period_id = ?" : ""
      const rows = await this.all(`select * from budget_items ${where} order by name asc`, input.budgetPeriodId ? [toSqlId(input.budgetPeriodId)] : [])
      return ok(rows.map(this.mapBudgetItem))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetItem(input: CreateBudgetItemInput): Promise<Result<BudgetItemSummary>> {
    try {
      const id = newId("bitem")
      await this.run(
        `insert into budget_items (id, budget_period_id, name, item_kind, planned_amount, currency, category_id, color)
         values (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          toSqlId(input.budgetPeriodId),
          input.name,
          input.itemKind ?? "spending_limit",
          input.plannedAmount,
          normalizeCurrency(input.currency),
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.color ?? null,
        ],
      )
      for (const scope of input.scopes ?? []) {
        await this.run(
          "insert into budget_item_scopes (id, budget_item_id, scope_kind, scope_value) values (?, ?, ?, ?)",
          [newId("bscope"), id, scope.scopeKind === "all_consumption" ? "flow_kind" : scope.scopeKind, scope.scopeKind === "all_consumption" ? "expense" : scope.scopeValue ?? null],
        )
      }
      return ok(this.mapBudgetItem((await this.one("select * from budget_items where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateBudgetItem(input: UpdateBudgetItemInput): Promise<Result<BudgetItemSummary>> {
    try {
      const sets: string[] = []
      const params: SqlParam[] = []
      if (input.name !== undefined) { sets.push("name = ?"); params.push(input.name) }
      if (input.plannedAmount !== undefined) { sets.push("planned_amount = ?"); params.push(input.plannedAmount) }
      if (input.currency !== undefined) { sets.push("currency = ?"); params.push(normalizeCurrency(input.currency)) }
      if (input.color !== undefined) { sets.push("color = ?"); params.push(input.color) }
      if (sets.length) {
        params.push(toSqlId(input.id))
        await this.run(`update budget_items set ${sets.join(", ")} where id = ?`, params)
      }
      const row = await this.one("select * from budget_items where id = ?", [toSqlId(input.id)])
      if (!row) throw new Error(`Budget item ${input.id} not found`)
      return ok(this.mapBudgetItem(row))
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetReferenceProgress(input: BudgetReferenceProgressInput): Promise<Result<BudgetReferenceProgressRow[]>> {
    try {
      const items = await this.all("select * from budget_items where budget_period_id = ? and status = 'active' order by name asc", [toSqlId(input.budgetPeriodId)])
      const period = await this.one("select * from budget_periods where id = ?", [toSqlId(input.budgetPeriodId)])
      if (!period) throw new Error(`Budget period ${input.budgetPeriodId} not found`)
      const rows: BudgetReferenceProgressRow[] = []
      for (const item of items) {
        const { where, params } = await this.budgetUsageWhere(item, period)
        const used = await this.one(`select coalesce(sum(cast(amount as real)), 0) as total from cashflow_events ${where}`, params)
        const budgeted = Number(item.planned_amount ?? 0)
        const referenceUsed = Number(used?.total ?? 0)
        rows.push({
          budgetItemId: item.id as string,
          budgetName: item.name as string,
          budgeted: budgeted.toFixed(2),
          referenceUsed: referenceUsed.toFixed(2),
          remaining: (budgeted - referenceUsed).toFixed(2),
          currency: item.currency as string,
          color: (item.color as string | null) ?? null,
        })
      }
      return ok(rows)
    } catch (error) {
      return fail(error)
    }
  }

  async createBudget(input: CreateBudgetInput): Promise<Result<BusinessRecord>> {
    try {
      const set = await this.createBudgetSet({ name: input.name })
      if (!set.success) throw new Error(set.error)
      const bounds = monthBounds(input.periodStart?.slice(0, 7))
      const period = await this.createBudgetPeriod({
        budgetSetId: set.data.id,
        periodKind: input.periodKind ?? "monthly",
        periodStart: input.periodStart ?? bounds.start,
        periodEnd: input.periodEnd ?? bounds.end,
        currency: input.currency,
      })
      if (!period.success) throw new Error(period.error)
      const item = await this.createBudgetItem({
        budgetPeriodId: period.data.id,
        name: input.name,
        plannedAmount: input.amount,
        currency: input.currency,
        scopes: input.scopes,
      })
      if (!item.success) throw new Error(item.error)
      return ok({ id: item.data.id })
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetProgress(input: { period?: string } = {}): Promise<Result<BudgetProgressRow[]>> {
    try {
      const bounds = monthBounds(input.period)
      const periods = await this.all(
        "select * from budget_periods where period_start <= ? and period_end >= ? and status = 'active'",
        [bounds.end, bounds.start],
      )
      const output: BudgetProgressRow[] = []
      for (const period of periods) {
        const progress = await this.getBudgetReferenceProgress({ budgetPeriodId: period.id as string })
        if (!progress.success) throw new Error(progress.error)
        for (const row of progress.data) {
          output.push({
            budgetId: row.budgetItemId,
            name: row.budgetName,
            tag: null,
            spent: row.referenceUsed,
            budgeted: row.budgeted,
            remaining: row.remaining,
            currency: row.currency,
          })
        }
      }
      return ok(output)
    } catch (error) {
      return fail(error)
    }
  }


}
