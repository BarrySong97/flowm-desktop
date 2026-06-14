/**
 * @purpose Implement links queries and mutations for the SQLite-backed API facade.
 * @role    Product API service module called by the Electron main tRPC router.
 * @deps    @flowm/db schema, Drizzle query builder, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CreateObjectLinkInput, FlowmId, ListObjectLinksInput, ObjectLinkSummary } from "../index"
import { BudgetsApi } from "./budgets"
import { fail, newId, nowIso, ok, toSqlId } from "./base"

export abstract class LinksApi extends BudgetsApi {
  async listObjectLinks(input: ListObjectLinksInput = {}): Promise<Result<ObjectLinkSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.fromType) { conds.push("from_type = ?"); params.push(input.fromType) }
      if (input.fromId) { conds.push("from_id = ?"); params.push(toSqlId(input.fromId)) }
      if (input.toType) { conds.push("to_type = ?"); params.push(input.toType) }
      if (input.toId) { conds.push("to_id = ?"); params.push(toSqlId(input.toId)) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from object_links ${where} order by created_at desc`, params)
      return ok(rows.map(this.mapObjectLink))
    } catch (error) {
      return fail(error)
    }
  }

  async createObjectLink(input: CreateObjectLinkInput): Promise<Result<ObjectLinkSummary>> {
    try {
      const id = newId("link")
      await this.run(
        `insert into object_links (id, from_type, from_id, to_type, to_id, link_type, confidence, created_by, note, created_at)
         values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.fromType,
          toSqlId(input.fromId),
          input.toType,
          toSqlId(input.toId),
          input.linkType,
          input.confidence ?? null,
          input.createdBy ?? "user",
          input.note ?? null,
          nowIso(),
        ],
      )
      return ok(this.mapObjectLink((await this.one("select * from object_links where id = ?", [id]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async confirmObjectLink(input: { id: FlowmId }): Promise<Result<ObjectLinkSummary>> {
    try {
      await this.run("update object_links set link_type = 'confirmed_matches' where id = ?", [toSqlId(input.id)])
      return ok(this.mapObjectLink((await this.one("select * from object_links where id = ?", [toSqlId(input.id)]))!))
    } catch (error) {
      return fail(error)
    }
  }

  async removeObjectLink(input: { id: FlowmId }): Promise<Result<void>> {
    try {
      await this.run("delete from object_links where id = ?", [toSqlId(input.id)])
      return ok(undefined)
    } catch (error) {
      return fail(error)
    }
  }


}
