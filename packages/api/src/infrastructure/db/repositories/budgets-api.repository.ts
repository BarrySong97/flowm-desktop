/**
 * @purpose Implement budgets persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, desc, eq, type SQL } from "drizzle-orm"
import {
  budgetItemScopes,
  budgetItems,
  budgetPeriods,
  budgetSets,
  type BudgetItemInsert,
  type BudgetItemScopeRow,
  type BudgetPeriodRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  BudgetItemSummary,
  BudgetPeriodSummary,
  BudgetReferenceProgressInput,
  BudgetReferenceProgressRow,
  BudgetSetSummary,
  CreateBudgetItemInput,
  CreateBudgetPeriodInput,
  CreateBudgetSetInput,
  FlowmId,
  ListBudgetItemsInput,
  ListBudgetPeriodsInput,
  UpdateBudgetItemInput,
} from "../../../index"
import { LoansApiRepository } from "./loans-api.repository"
import { fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "../../../shared/api-helpers"

export abstract class BudgetsApiRepository extends LoansApiRepository {
  async listBudgetSets(): Promise<Result<BudgetSetSummary[]>> {
    try {
      const rows = this.db.select().from(budgetSets).orderBy(asc(budgetSets.createdAt)).all()
      return ok(rows.map((row) => this.mapBudgetSet(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetSet(input: CreateBudgetSetInput): Promise<Result<BudgetSetSummary>> {
    try {
      const id = newId("bset")
      const timestamp = nowIso()
      this.db
        .insert(budgetSets)
        .values({ id, name: input.name, createdAt: timestamp, updatedAt: timestamp })
        .run()
      return ok(
        this.mapBudgetSet(this.db.select().from(budgetSets).where(eq(budgetSets.id, id)).get()!),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetPeriods(
    input: ListBudgetPeriodsInput = {},
  ): Promise<Result<BudgetPeriodSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.budgetSetId) conds.push(eq(budgetPeriods.budgetSetId, toSqlId(input.budgetSetId)))
      if (input.status)
        conds.push(eq(budgetPeriods.status, input.status as BudgetPeriodRow["status"]))
      const rows = this.db
        .select()
        .from(budgetPeriods)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(budgetPeriods.periodStart))
        .all()
      return ok(rows.map((row) => this.mapBudgetPeriod(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetPeriod(input: CreateBudgetPeriodInput): Promise<Result<BudgetPeriodSummary>> {
    try {
      const id = newId("bper")
      this.db
        .insert(budgetPeriods)
        .values({
          id,
          budgetSetId: toSqlId(input.budgetSetId),
          periodKind: input.periodKind,
          periodStart: input.periodStart,
          periodEnd: input.periodEnd,
          currency: normalizeCurrency(input.currency),
        })
        .run()
      return ok(
        this.mapBudgetPeriod(
          this.db.select().from(budgetPeriods).where(eq(budgetPeriods.id, id)).get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async listBudgetItems(input: ListBudgetItemsInput = {}): Promise<Result<BudgetItemSummary[]>> {
    try {
      const rows = this.db
        .select()
        .from(budgetItems)
        .where(
          input.budgetPeriodId
            ? eq(budgetItems.budgetPeriodId, toSqlId(input.budgetPeriodId))
            : undefined,
        )
        .orderBy(asc(budgetItems.name))
        .all()
      return ok(rows.map((row) => this.mapBudgetItem(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createBudgetItem(input: CreateBudgetItemInput): Promise<Result<BudgetItemSummary>> {
    try {
      const id = newId("bitem")
      this.db
        .insert(budgetItems)
        .values({
          id,
          budgetPeriodId: toSqlId(input.budgetPeriodId),
          name: input.name,
          itemKind: input.itemKind ?? "spending_limit",
          plannedAmount: input.plannedAmount,
          currency: normalizeCurrency(input.currency),
          categoryId: input.categoryId == null ? null : toSqlId(input.categoryId),
          color: input.color ?? null,
        })
        .run()
      for (const scope of input.scopes ?? []) {
        const scopeKind = (
          scope.scopeKind === "all_consumption" ? "flow_kind" : scope.scopeKind
        ) as BudgetItemScopeRow["scopeKind"]
        const scopeValue =
          scope.scopeKind === "all_consumption" ? "expense" : (scope.scopeValue ?? null)
        this.db
          .insert(budgetItemScopes)
          .values({ id: newId("bscope"), budgetItemId: id, scopeKind, scopeValue })
          .run()
      }
      return ok(
        this.mapBudgetItem(this.db.select().from(budgetItems).where(eq(budgetItems.id, id)).get()!),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async updateBudgetItem(input: UpdateBudgetItemInput): Promise<Result<BudgetItemSummary>> {
    try {
      const set: Partial<BudgetItemInsert> = {}
      if (input.name !== undefined) set.name = input.name
      if (input.plannedAmount !== undefined) set.plannedAmount = input.plannedAmount
      if (input.currency !== undefined) set.currency = normalizeCurrency(input.currency)
      if (input.color !== undefined) set.color = input.color
      if (Object.keys(set).length > 0) {
        this.db
          .update(budgetItems)
          .set(set)
          .where(eq(budgetItems.id, toSqlId(input.id)))
          .run()
      }
      // Replace the item's scopes wholesale when provided (the budget's bound categories).
      if (input.scopes !== undefined) {
        const itemId = toSqlId(input.id)
        this.db.delete(budgetItemScopes).where(eq(budgetItemScopes.budgetItemId, itemId)).run()
        for (const scope of input.scopes) {
          const scopeKind = (
            scope.scopeKind === "all_consumption" ? "flow_kind" : scope.scopeKind
          ) as BudgetItemScopeRow["scopeKind"]
          const scopeValue =
            scope.scopeKind === "all_consumption" ? "expense" : (scope.scopeValue ?? null)
          this.db
            .insert(budgetItemScopes)
            .values({ id: newId("bscope"), budgetItemId: itemId, scopeKind, scopeValue })
            .run()
        }
      }
      const row = this.db
        .select()
        .from(budgetItems)
        .where(eq(budgetItems.id, toSqlId(input.id)))
        .get()
      if (!row) throw new Error(`Budget item ${input.id} not found`)
      return ok(this.mapBudgetItem(row))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveBudgetItem(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(budgetItems)
        .set({ status: "archived" })
        .where(eq(budgetItems.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async getBudgetReferenceProgress(
    input: BudgetReferenceProgressInput,
  ): Promise<Result<BudgetReferenceProgressRow[]>> {
    try {
      const items = this.db
        .select()
        .from(budgetItems)
        .where(
          and(
            eq(budgetItems.budgetPeriodId, toSqlId(input.budgetPeriodId)),
            eq(budgetItems.status, "active"),
          ),
        )
        .orderBy(asc(budgetItems.name))
        .all()
      const period = this.db
        .select()
        .from(budgetPeriods)
        .where(eq(budgetPeriods.id, toSqlId(input.budgetPeriodId)))
        .get()
      if (!period) throw new Error(`Budget period ${input.budgetPeriodId} not found`)
      const rows: BudgetReferenceProgressRow[] = []
      for (const item of items) {
        const where = await this.budgetUsageWhere(item, period)
        const budgeted = Number(item.plannedAmount ?? 0)
        const referenceUsed = this.sumCashflowAmount(where)
        const categoryIds = new Set<string>()
        if (item.categoryId != null) categoryIds.add(item.categoryId)
        for (const scope of this.db
          .select()
          .from(budgetItemScopes)
          .where(eq(budgetItemScopes.budgetItemId, item.id))
          .all()) {
          if (
            (scope.scopeKind === "category" || scope.scopeKind === "category_tree") &&
            scope.scopeValue
          ) {
            categoryIds.add(scope.scopeValue)
          }
        }
        rows.push({
          budgetItemId: item.id,
          budgetName: item.name,
          budgeted: budgeted.toFixed(2),
          referenceUsed: referenceUsed.toFixed(2),
          remaining: (budgeted - referenceUsed).toFixed(2),
          currency: item.currency,
          color: item.color ?? null,
          categoryIds: Array.from(categoryIds),
        })
      }
      return ok(rows)
    } catch (error) {
      return fail(error)
    }
  }
}
