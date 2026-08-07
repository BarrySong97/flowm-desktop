/**
 * @purpose Implement subscriptions persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, eq, type SQL } from "drizzle-orm"
import { subscriptions, type SubscriptionInsert, type SubscriptionRow } from "@flowm/db"
import { nextSubscriptionChargeDate, projectSubscriptionPlans, type Result } from "@flowm/shared"
import type {
  CreateSubscriptionInput,
  FlowmId,
  ListSubscriptionOccurrencesInput,
  ListSubscriptionsInput,
  SubscriptionOccurrenceSummary,
  SubscriptionSummary,
  UpdateSubscriptionInput,
} from "../../../index"
import { AssetsApiRepository } from "./assets-api.repository"
import { fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "../../../shared/api-helpers"

function localDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function addDaysKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export abstract class SubscriptionsApiRepository extends AssetsApiRepository {
  async listSubscriptions(
    input: ListSubscriptionsInput = {},
  ): Promise<Result<SubscriptionSummary[]>> {
    try {
      const rows = this.db
        .select()
        .from(subscriptions)
        .where(
          input.status
            ? eq(subscriptions.status, input.status as SubscriptionRow["status"])
            : undefined,
        )
        .orderBy(asc(subscriptions.nextChargeDate))
        .all()
      const today = localDateKey()
      return ok(
        rows
          .map((row) => this.mapSubscription(row))
          .sort((left, right) => {
            const leftNext = nextSubscriptionChargeDate(left, today) ?? "9999-12-31"
            const rightNext = nextSubscriptionChargeDate(right, today) ?? "9999-12-31"
            return leftNext.localeCompare(rightNext) || left.name.localeCompare(right.name)
          }),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const id = newId("sub")
      const timestamp = nowIso()
      this.db
        .insert(subscriptions)
        .values({
          id,
          name: input.name,
          merchant: input.merchant ?? null,
          amount: input.amount,
          currency: normalizeCurrency(input.currency),
          billingCycle: input.billingCycle,
          intervalCount: input.intervalCount ?? 1,
          nextChargeDate: input.nextChargeDate,
          autoRenew: input.autoRenew ?? true,
          categoryId: input.categoryId == null ? null : toSqlId(input.categoryId),
          note: input.note ?? null,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
        .run()
      return ok(
        this.mapSubscription(
          this.db.select().from(subscriptions).where(eq(subscriptions.id, id)).get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const set: Partial<SubscriptionInsert> = { updatedAt: nowIso() }
      if (input.name !== undefined) set.name = input.name
      if (input.merchant !== undefined) set.merchant = input.merchant
      if (input.amount !== undefined) set.amount = input.amount
      if (input.currency !== undefined) set.currency = normalizeCurrency(input.currency)
      if (input.billingCycle !== undefined) set.billingCycle = input.billingCycle
      if (input.intervalCount !== undefined) set.intervalCount = input.intervalCount
      if (input.nextChargeDate !== undefined) set.nextChargeDate = input.nextChargeDate
      if (input.autoRenew !== undefined) set.autoRenew = input.autoRenew
      if (input.status !== undefined) set.status = input.status as SubscriptionRow["status"]
      if (input.note !== undefined) set.note = input.note
      if (input.categoryId !== undefined)
        set.categoryId = input.categoryId == null ? null : toSqlId(input.categoryId)
      this.db
        .update(subscriptions)
        .set(set)
        .where(eq(subscriptions.id, toSqlId(input.id)))
        .run()
      return ok(
        this.mapSubscription(
          this.db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.id, toSqlId(input.id)))
            .get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async archiveSubscription(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .update(subscriptions)
        .set({ status: "canceled", updatedAt: nowIso() })
        .where(eq(subscriptions.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async listSubscriptionOccurrences(
    input: ListSubscriptionOccurrencesInput = {},
  ): Promise<Result<SubscriptionOccurrenceSummary[]>> {
    try {
      const conds: SQL[] = [eq(subscriptions.status, "active")]
      if (input.subscriptionId) conds.push(eq(subscriptions.id, toSqlId(input.subscriptionId)))
      const plans = this.db
        .select()
        .from(subscriptions)
        .where(and(...conds))
        .all()
      if (plans.length === 0) return ok([])
      const today = localDateKey()
      const dateFrom =
        input.dateFrom ??
        (input.dateTo ? plans.map((plan) => plan.nextChargeDate).sort()[0] : today)
      const dateTo = input.dateTo ?? addDaysKey(dateFrom, 366)
      return ok(projectSubscriptionPlans(plans, dateFrom, dateTo))
    } catch (error) {
      return fail(error)
    }
  }
}
