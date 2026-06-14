/**
 * @purpose Implement links queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, desc, eq, type SQL } from "drizzle-orm"
import { objectLinks } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CreateObjectLinkInput, FlowmId, ListObjectLinksInput, ObjectLinkSummary } from "../index"
import { BudgetsApi } from "./budgets"
import { fail, newId, nowIso, ok, toSqlId } from "./base"

export abstract class LinksApi extends BudgetsApi {
  async listObjectLinks(input: ListObjectLinksInput = {}): Promise<Result<ObjectLinkSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.fromType) conds.push(eq(objectLinks.fromType, input.fromType))
      if (input.fromId) conds.push(eq(objectLinks.fromId, toSqlId(input.fromId)))
      if (input.toType) conds.push(eq(objectLinks.toType, input.toType))
      if (input.toId) conds.push(eq(objectLinks.toId, toSqlId(input.toId)))
      const rows = this.db
        .select()
        .from(objectLinks)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(objectLinks.createdAt))
        .all()
      return ok(rows.map((row) => this.mapObjectLink(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async createObjectLink(input: CreateObjectLinkInput): Promise<Result<ObjectLinkSummary>> {
    try {
      const id = newId("link")
      this.db
        .insert(objectLinks)
        .values({
          id,
          fromType: input.fromType,
          fromId: toSqlId(input.fromId),
          toType: input.toType,
          toId: toSqlId(input.toId),
          linkType: input.linkType,
          confidence: input.confidence ?? null,
          createdBy: input.createdBy ?? "user",
          note: input.note ?? null,
          createdAt: nowIso(),
        })
        .run()
      return ok(this.mapObjectLink(this.db.select().from(objectLinks).where(eq(objectLinks.id, id)).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>> {
    try {
      this.db.update(objectLinks).set({ linkType: "confirmed_matches" }).where(eq(objectLinks.id, toSqlId(input.id))).run()
      return ok(this.mapObjectLink(this.db.select().from(objectLinks).where(eq(objectLinks.id, toSqlId(input.id))).get()!))
    } catch (error) {
      return fail(error)
    }
  }

  async removeObjectLink(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db.delete(objectLinks).where(eq(objectLinks.id, toSqlId(input.id))).run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }
}
