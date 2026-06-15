/**
 * @purpose Implement imports persistence operations for the layered API facade.
 * @role    Infrastructure repository layer module used by use-case wrappers.
 * @deps    /db schema, Drizzle query builder, SQLite base capabilities, and shared API helpers.
 * @gotcha  Preserve Flowm layer boundaries and avoid raw SQL except targeted Drizzle sql fragments.
 */

import { and, desc, eq, type SQL } from "drizzle-orm"
import {
  cashflowEvents,
  statementImports,
  statementLines,
  type StatementImportRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  CashflowKind,
  ConvertStatementLinesInput,
  Direction,
  ImportNormalizedStatementEntriesInput,
  ImportStatementInput,
  ImportedBatchResult,
  ImportedEntrySummary,
  ListImportedEntriesInput,
  ListStatementImportsInput,
  ListStatementLinesInput,
  StatementImportSummary,
  StatementLineSummary,
} from "../../../index"
import { ReferenceApiRepository } from "./reference-api.repository"
import {
  DEFAULT_CURRENCY,
  fail,
  newId,
  normalizeCurrency,
  normalizeDirection,
  nowIso,
  ok,
} from "../../../shared/api-helpers"

export abstract class ImportsApiRepository extends ReferenceApiRepository {
  async importStatement(input: ImportStatementInput): Promise<Result<ImportedBatchResult>> {
    try {
      const importId = newId("imp")
      const timestamp = input.importedAt ?? nowIso()
      this.db
        .insert(statementImports)
        .values({
          id: importId,
          sourceName: input.sourceName,
          fileName: input.fileName ?? null,
          fileHash: input.fileHash ?? null,
          importedAt: timestamp,
          rawSummary: input.rawSummary ?? null,
          createdAt: timestamp,
        })
        .run()
      let inserted = 0
      let skipped = 0
      for (const line of input.lines) {
        const lineHash = `${line.externalId ?? ""}:${line.eventDate}:${line.amount}:${line.currency ?? DEFAULT_CURRENCY}:${line.counterparty ?? ""}`
        const exists = this.db
          .select({ id: statementLines.id })
          .from(statementLines)
          .where(and(eq(statementLines.importId, importId), eq(statementLines.lineHash, lineHash)))
          .get()
        if (exists) {
          skipped++
          continue
        }
        this.db
          .insert(statementLines)
          .values({
            id: newId("line"),
            importId,
            externalId: line.externalId ?? null,
            lineHash,
            occurredAt: line.occurredAt ?? null,
            eventDate: line.eventDate,
            counterparty: line.counterparty ?? null,
            description: line.description ?? null,
            amount: line.amount,
            currency: normalizeCurrency(line.currency),
            direction: normalizeDirection(line.direction),
            paymentMethod: line.paymentMethod ?? null,
            accountHint: line.accountHint ?? null,
            rawPayload: line.rawPayload ?? null,
            createdAt: timestamp,
          })
          .run()
        inserted++
      }
      return ok({ batchId: importId, inserted, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async importNormalizedStatementEntries(
    input: ImportNormalizedStatementEntriesInput,
  ): Promise<Result<ImportedBatchResult>> {
    return this.importStatement({
      sourceName: input.sourceName,
      importedAt: input.importedAt,
      fileName: input.fileName,
      fileHash: input.fileHash,
      rawSummary: input.summary as Record<string, unknown> | null,
      lines: input.entries.map((entry) => ({
        externalId: entry.externalId ?? null,
        occurredAt: entry.occurredAt ?? null,
        eventDate: entry.date,
        counterparty: entry.counterparty ?? null,
        description: entry.description ?? entry.note ?? null,
        amount: entry.amountNumber,
        currency: entry.currency,
        direction: entry.direction ?? "neutral",
        paymentMethod: entry.paymentMethod ?? null,
        accountHint: entry.sourceAccountName,
        rawPayload: entry.raw ?? null,
      })),
    })
  }

  async listStatementImports(
    input: ListStatementImportsInput = {},
  ): Promise<Result<StatementImportSummary[]>> {
    try {
      const conds: SQL[] = []
      if (input.sourceName) conds.push(eq(statementImports.sourceName, input.sourceName))
      if (input.status)
        conds.push(eq(statementImports.status, input.status as StatementImportRow["status"]))
      const rows = this.db
        .select()
        .from(statementImports)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(statementImports.importedAt))
        .all()
      return ok(rows.map((row) => this.mapStatementImport(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async listStatementLines(
    input: ListStatementLinesInput = {},
  ): Promise<Result<StatementLineSummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(rows.map((row) => this.mapStatementLine(row)))
    } catch (error) {
      return fail(error)
    }
  }

  async listImportedEntries(
    input: ListImportedEntriesInput = {},
  ): Promise<Result<ImportedEntrySummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(
        rows.map((row) => ({
          id: row.id,
          batchId: row.importId,
          sourceName: row.sourceName,
          fileName: row.fileName,
          externalId: row.externalId,
          merchantOrderId: null,
          occurredAt: row.occurredAt,
          date: row.eventDate,
          payee: row.counterparty,
          narration: row.description,
          amountNumber: row.amount,
          currency: row.currency,
          accountName: row.accountHint ?? row.sourceName,
          sourceSubAccountLabel: null,
          counterpartyAccount: null,
          paymentMethod: row.paymentMethod,
          direction: row.direction,
          classification: null,
          confidence: null,
          status: row.status as ImportedEntrySummary["status"],
          raw: row.rawPayload ?? null,
        })),
      )
    } catch (error) {
      return fail(error)
    }
  }

  async convertStatementLinesToCashflowEvents(
    input: ConvertStatementLinesInput = {},
  ): Promise<Result<{ created: number; skipped: number }>> {
    try {
      const rows = await this.statementLineRows({ importId: input.importId, status: "pending" })
      let created = 0
      let skipped = 0
      for (const line of rows) {
        const existing = this.db
          .select({ id: cashflowEvents.id })
          .from(cashflowEvents)
          .where(eq(cashflowEvents.statementLineId, line.id))
          .get()
        if (existing) {
          skipped++
          continue
        }
        const direction = line.direction as Direction
        const flowKind: CashflowKind =
          direction === "in" ? "income" : direction === "out" ? "expense" : "adjustment"
        const timestamp = nowIso()
        this.db
          .insert(cashflowEvents)
          .values({
            id: newId("cf"),
            statementLineId: line.id,
            eventDate: line.eventDate,
            occurredAt: line.occurredAt,
            title: line.counterparty,
            counterparty: line.counterparty,
            description: line.description,
            amount: line.amount,
            currency: line.currency,
            direction,
            flowKind,
            sourceKind: "import",
            sourceName: line.sourceName,
            paymentMethod: line.paymentMethod,
            accountHint: line.accountHint,
            classificationSource: "imported",
            createdAt: timestamp,
            updatedAt: timestamp,
          })
          .run()
        this.db
          .update(statementLines)
          .set({ status: "converted" })
          .where(eq(statementLines.id, line.id))
          .run()
        created++
      }
      return ok({ created, skipped })
    } catch (error) {
      return fail(error)
    }
  }
}
