/**
 * @purpose Implement subscriptions queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CreateSubscriptionInput, FlowmId, GenerateOccurrenceInput, ListSubscriptionOccurrencesInput, ListSubscriptionsInput, SubscriptionOccurrenceSummary, SubscriptionSummary, UpdateSubscriptionInput } from "../index"
import { AssetsApi } from "./assets"
import { addInterval, fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "./base"

export abstract class SubscriptionsApi extends AssetsApi {
  async listSubscriptions(input: ListSubscriptionsInput = {}): Promise<Result<SubscriptionSummary[]>> {
    try {
      const where = input.status ? "where status = ?" : ""
      const rows = await this.all(`select * from subscriptions ${where} order by next_charge_date asc`, input.status ? [input.status] : [])
      return ok(rows.map(this.mapSubscription))
    } catch (error) {
      return fail(error)
    }
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const id = newId("sub")
      const timestamp = nowIso()
      await this.run(
        `insert into subscriptions
          (id, name, merchant, amount, currency, billing_cycle, interval_count, next_charge_date,
           auto_renew, category_id, note, created_at, updated_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.name,
          input.merchant ?? null,
          input.amount,
          normalizeCurrency(input.currency),
          input.billingCycle,
          input.intervalCount ?? 1,
          input.nextChargeDate,
          input.autoRenew ?? true,
          input.categoryId == null ? null : toSqlId(input.categoryId),
          input.note ?? null,
          timestamp,
          timestamp,
        ],
      )
      return ok(this.mapSubscription((await this.one("select * from subscriptions where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async updateSubscription(input: UpdateSubscriptionInput): Promise<Result<SubscriptionSummary>> {
    try {
      const fields: string[] = ["updated_at = ?"]
      const params: SqlParam[] = [nowIso()]
      const map: Record<string, string> = {
        name: "name",
        merchant: "merchant",
        amount: "amount",
        currency: "currency",
        billingCycle: "billing_cycle",
        intervalCount: "interval_count",
        nextChargeDate: "next_charge_date",
        autoRenew: "auto_renew",
        status: "status",
        note: "note",
      }
      for (const [key, column] of Object.entries(map)) {
        const value = input[key as keyof UpdateSubscriptionInput]
        if (value !== undefined) {
          fields.push(`${column} = ?`)
          params.push(key === "currency" ? normalizeCurrency(value as string) : value as SqlParam)
        }
      }
      if (input.categoryId !== undefined) { fields.push("category_id = ?"); params.push(input.categoryId == null ? null : toSqlId(input.categoryId)) }
      params.push(toSqlId(input.id))
      await this.run(`update subscriptions set ${fields.join(", ")} where id = ?`, params)
      return ok(this.mapSubscription((await this.one("select * from subscriptions where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async archiveSubscription(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("update subscriptions set status = 'canceled', updated_at = ? where id = ?", [nowIso(), toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }

  async generateSubscriptionOccurrences(input: GenerateOccurrenceInput): Promise<Result<{ generated: number }>> {
    try {
      const params: SqlParam[] = input.id ? [toSqlId(input.id)] : []
      const where = input.id ? "where id = ? and status = 'active'" : "where status = 'active'"
      const subs = await this.all(`select * from subscriptions ${where}`, params)
      let generated = 0
      for (const sub of subs) {
        let due = sub.next_charge_date as string
        let safety = 0
        while (due <= input.throughDate && safety++ < 500) {
          const exists = await this.one("select id from subscription_occurrences where subscription_id = ? and due_date = ?", [sub.id as string, due])
          if (!exists) {
            await this.run(
              "insert into subscription_occurrences (id, subscription_id, due_date, amount, currency, created_at) values (?, ?, ?, ?, ?, ?)",
              [newId("subocc"), sub.id as string, due, sub.amount as string, sub.currency as string, nowIso()],
            )
            generated++
          }
          due = addInterval(due, sub.billing_cycle as string, Number(sub.interval_count ?? 1))
        }
      }
      return ok({ generated })
    } catch (error) {
      return fail(error)
    }
  }

  async listSubscriptionOccurrences(input: ListSubscriptionOccurrencesInput = {}): Promise<Result<SubscriptionOccurrenceSummary[]>> {
    try {
      const { where, params } = this.occurrenceWhere("subscription_id", input.subscriptionId, input.dateFrom, input.dateTo)
      const rows = await this.all(`select * from subscription_occurrences ${where} order by due_date asc`, params)
      return ok(rows.map(this.mapSubscriptionOccurrence))
    } catch (error) {
      return fail(error)
    }
  }


}
