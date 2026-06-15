/**
 * @purpose Implement links persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, desc, eq, type SQL } from "drizzle-orm"
import { objectLinks } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CreateObjectLinkInput,
  FlowmId,
  ListObjectLinksInput,
  ObjectLinkSummary,
} from "../../../index"
import { BudgetsApiRepository } from "./budgets-api.repository"
import { fail, newId, nowIso, ok, toSqlId } from "../../../shared/api-helpers"

export abstract class LinksApiRepository extends BudgetsApiRepository {
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
      return ok(
        this.mapObjectLink(this.db.select().from(objectLinks).where(eq(objectLinks.id, id)).get()!),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>> {
    try {
      this.db
        .update(objectLinks)
        .set({ linkType: "confirmed_matches" })
        .where(eq(objectLinks.id, toSqlId(input.id)))
        .run()
      return ok(
        this.mapObjectLink(
          this.db
            .select()
            .from(objectLinks)
            .where(eq(objectLinks.id, toSqlId(input.id)))
            .get()!,
        ),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async removeObjectLink(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      this.db
        .delete(objectLinks)
        .where(eq(objectLinks.id, toSqlId(input.id)))
        .run()
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }
}
