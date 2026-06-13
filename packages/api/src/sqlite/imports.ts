import type { SqlParam } from "@flowm/db"
import type { Result } from "@flowm/shared"
import type { CashflowKind, ConvertStatementLinesInput, Direction, ImportNormalizedStatementEntriesInput, ImportStatementInput, ImportedBatchResult, ImportedEntrySummary, ListImportedEntriesInput, ListStatementImportsInput, ListStatementLinesInput, StatementImportSummary, StatementLineSummary } from "../index"
import { ReferenceApi } from "./reference"
import { DEFAULT_CURRENCY, fail, json, newId, normalizeCurrency, normalizeDirection, nowIso, ok, parseJsonObject } from "./base"

export abstract class ImportsApi extends ReferenceApi {
  async importStatement(input: ImportStatementInput): Promise<Result<ImportedBatchResult>> {
    try {
      const importId = newId("imp")
      const timestamp = input.importedAt ?? nowIso()
      await this.run(
        `insert into statement_imports (id, source_name, file_name, file_hash, imported_at, raw_summary, created_at)
         values (?, ?, ?, ?, ?, ?, ?)`,
        [importId, input.sourceName, input.fileName ?? null, input.fileHash ?? null, timestamp, json(input.rawSummary ?? null), timestamp],
      )
      let inserted = 0
      let skipped = 0
      for (const line of input.lines) {
        const lineHash = `${line.externalId ?? ""}:${line.eventDate}:${line.amount}:${line.currency ?? DEFAULT_CURRENCY}:${line.counterparty ?? ""}`
        const exists = await this.one("select id from statement_lines where import_id = ? and line_hash = ?", [importId, lineHash])
        if (exists) {
          skipped++
          continue
        }
        await this.run(
          `insert into statement_lines
            (id, import_id, external_id, line_hash, occurred_at, event_date, counterparty, description, amount, currency,
             direction, payment_method, account_hint, raw_payload, created_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            newId("line"),
            importId,
            line.externalId ?? null,
            lineHash,
            line.occurredAt ?? null,
            line.eventDate,
            line.counterparty ?? null,
            line.description ?? null,
            line.amount,
            normalizeCurrency(line.currency),
            normalizeDirection(line.direction),
            line.paymentMethod ?? null,
            line.accountHint ?? null,
            json(line.rawPayload ?? null),
            timestamp,
          ],
        )
        inserted++
      }
      return ok({ batchId: importId, inserted, skipped })
    } catch (error) {
      return fail(error)
    }
  }

  async importNormalizedStatementEntries(input: ImportNormalizedStatementEntriesInput): Promise<Result<ImportedBatchResult>> {
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

  async listStatementImports(input: ListStatementImportsInput = {}): Promise<Result<StatementImportSummary[]>> {
    try {
      const conds: string[] = []
      const params: SqlParam[] = []
      if (input.sourceName) { conds.push("source_name = ?"); params.push(input.sourceName) }
      if (input.status) { conds.push("status = ?"); params.push(input.status) }
      const where = conds.length ? `where ${conds.join(" and ")}` : ""
      const rows = await this.all(`select * from statement_imports ${where} order by imported_at desc`, params)
      return ok(rows.map(this.mapStatementImport))
    } catch (error) {
      return fail(error)
    }
  }

  async listStatementLines(input: ListStatementLinesInput = {}): Promise<Result<StatementLineSummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(rows.map(this.mapStatementLine))
    } catch (error) {
      return fail(error)
    }
  }

  async listImportedEntries(input: ListImportedEntriesInput = {}): Promise<Result<ImportedEntrySummary[]>> {
    try {
      const rows = await this.statementLineRows(input)
      return ok(rows.map((row) => ({
        id: row.id as string,
        batchId: row.import_id as string,
        sourceName: row.source_name as string,
        fileName: row.file_name as string | null,
        externalId: row.external_id as string | null,
        merchantOrderId: null,
        occurredAt: row.occurred_at as string | null,
        date: row.event_date as string,
        payee: row.counterparty as string | null,
        narration: row.description as string | null,
        amountNumber: row.amount as string,
        currency: row.currency as string,
        accountName: row.account_hint as string ?? row.source_name as string,
        sourceSubAccountLabel: null,
        counterpartyAccount: null,
        paymentMethod: row.payment_method as string | null,
        direction: row.direction as string,
        classification: null,
        confidence: null,
        status: row.status as ImportedEntrySummary["status"],
        raw: parseJsonObject(row.raw_payload),
      })))
    } catch (error) {
      return fail(error)
    }
  }

  async convertStatementLinesToCashflowEvents(input: ConvertStatementLinesInput = {}): Promise<Result<{ created: number; skipped: number }>> {
    try {
      const rows = await this.statementLineRows({ importId: input.importId, status: "pending" })
      let created = 0
      let skipped = 0
      for (const line of rows) {
        const existing = await this.one("select id from cashflow_events where statement_line_id = ?", [line.id as string])
        if (existing) {
          skipped++
          continue
        }
        const direction = line.direction as Direction
        const flowKind: CashflowKind = direction === "in" ? "income" : direction === "out" ? "expense" : "adjustment"
        const id = newId("cf")
        const timestamp = nowIso()
        await this.run(
          `insert into cashflow_events
            (id, statement_line_id, event_date, occurred_at, title, counterparty, description, amount, currency, direction,
             flow_kind, source_kind, source_name, payment_method, account_hint, classification_source, created_at, updated_at)
           values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'import', ?, ?, ?, 'imported', ?, ?)`,
          [
            id,
            line.id as string,
            line.event_date as string,
            line.occurred_at as string | null,
            line.counterparty as string | null,
            line.counterparty as string | null,
            line.description as string | null,
            line.amount as string,
            line.currency as string,
            direction,
            flowKind,
            line.source_name as string,
            line.payment_method as string | null,
            line.account_hint as string | null,
            timestamp,
            timestamp,
          ],
        )
        await this.run("update statement_lines set status = 'converted' where id = ?", [line.id as string])
        created++
      }
      return ok({ created, skipped })
    } catch (error) {
      return fail(error)
    }
  }


}
