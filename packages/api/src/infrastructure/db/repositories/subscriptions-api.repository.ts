/**
 * @purpose Implement subscriptions persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, asc, eq, gte, lte, type SQL } from "drizzle-orm"
import {
  subscriptionOccurrences,
  subscriptions,
  type SubscriptionInsert,
  type SubscriptionRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CreateSubscriptionInput,
  FlowmId,
  GenerateOccurrenceInput,
  ListSubscriptionOccurrencesInput,
  ListSubscriptionsInput,
  SubscriptionOccurrenceSummary,
  SubscriptionSummary,
  UpdateSubscriptionInput,
} from "../../../index"
import { AssetsApiRepository } from "./assets-api.repository"
import {
  addInterval,
  fail,
  newId,
  normalizeCurrency,
  nowIso,
  ok,
  toSqlId,
} from "../../../shared/api-helpers"

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
      return ok(rows.map((row) => this.mapSubscription(row)))
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

  async generateSubscriptionOccurrences(
    input: GenerateOccurrenceInput,
  ): Promise<Result<{ generated: number }>> {
    try {
      const conds: SQL[] = [eq(subscriptions.status, "active")]
      if (input.id) conds.push(eq(subscriptions.id, toSqlId(input.id)))
      const subs = this.db
        .select()
        .from(subscriptions)
        .where(and(...conds))
        .all()
      let generated = 0
      for (const sub of subs) {
        let due = sub.nextChargeDate
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = this.db
            .select({ id: subscriptionOccurrences.id })
            .from(subscriptionOccurrences)
            .where(
              and(
                eq(subscriptionOccurrences.subscriptionId, sub.id),
                eq(subscriptionOccurrences.dueDate, due),
              ),
            )
            .get()
          if (!exists) {
            this.db
              .insert(subscriptionOccurrences)
              .values({
                id: newId("subocc"),
                subscriptionId: sub.id,
                dueDate: due,
                amount: sub.amount,
                currency: sub.currency,
                createdAt: nowIso(),
              })
              .run()
            generated++
          }
          due = addInterval(due, sub.billingCycle, sub.intervalCount ?? 1)
        }
      }
      return ok({ generated })
    } catch (error) {
      return fail(error)
    }
  }

  async listSubscriptionOccurrences(
    input: ListSubscriptionOccurrencesInput = {},
  ): Promise<Result<SubscriptionOccurrenceSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.subscriptionId)
        conds.push(eq(subscriptionOccurrences.subscriptionId, toSqlId(input.subscriptionId)))
      if (input.dateFrom) conds.push(gte(subscriptionOccurrences.dueDate, input.dateFrom))
      if (input.dateTo) conds.push(lte(subscriptionOccurrences.dueDate, input.dateTo))
      const rows = this.db
        .select()
        .from(subscriptionOccurrences)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(asc(subscriptionOccurrences.dueDate))
        .all()
      return ok(rows.map((row) => this.mapSubscriptionOccurrence(row)))
    } catch (error) {
      return fail(error)
    }
  }
}
