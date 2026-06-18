/**
 * @purpose Apply agent-authored ledger patches through guarded domain operations.
 * @role    Infrastructure repository layer for rule-checked agent ledger writes.
 * @deps    /db schema, Drizzle query builder, facade contracts, and shared API helpers.
 * @gotcha  Expose business operations only; do not add raw table or SQL patch escape hatches here.
 */

import { and, eq, isNull, ne } from "drizzle-orm"
import {
  cashflowEvents,
  cashflowEventTags,
  categories,
  type CashflowEventRow,
  type CategoryRow,
} from "@flowm/db"
import type { Result } from "@flowm/shared"
import type {
  AgentClassifyCashflowOperation,
  AgentCreateCashflowOperation,
  AgentEnsureCategoryOperation,
  AgentLedgerOperationResult,
  AgentLedgerPatchInput,
  AgentLedgerPatchResult,
  Direction,
  FlowmId,
} from "../../../index"
import { LinksApiRepository } from "./links-api.repository"
import { fail, newId, normalizeCurrency, nowIso, ok, toSqlId } from "../../../shared/api-helpers"
import { categoryKindForFlowKind } from "../../../shared/api-helpers"

const CATEGORY_KINDS = new Set([
  "expense",
  "income",
  "transfer",
  "asset_movement",
  "debt",
  "adjustment",
  "neutral",
])

function normalizeOptionalText(value: string | null | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function operationReject(
  index: number,
  op: AgentLedgerOperationResult["op"],
  message: string,
): AgentLedgerOperationResult {
  return { index, op, action: "reject", message }
}

function sourceConflictFields(
  existing: CashflowEventRow,
  op: AgentCreateCashflowOperation,
): string[] {
  const fields: string[] = []
  const comparisons: Array<[string, string | null, string | null]> = [
    ["eventDate", existing.eventDate, op.eventDate],
    ["amount", existing.amount, op.amount],
    ["direction", existing.direction, op.direction],
    ["flowKind", existing.flowKind, op.flowKind],
    ["counterparty", existing.counterparty, op.counterparty ?? null],
  ]
  for (const [field, current, next] of comparisons) {
    if ((current ?? null) !== (next ?? null)) fields.push(field)
  }
  return fields
}

export abstract class AgentLedgerApiRepository extends LinksApiRepository {
  async applyAgentLedgerPatch(
    input: AgentLedgerPatchInput,
  ): Promise<Result<AgentLedgerPatchResult>> {
    try {
      const dryRun = input.dryRun !== false
      if (dryRun) return ok(this.applyAgentLedgerOperations(input, true))

      let result: AgentLedgerPatchResult | null = null
      this.db.transaction(() => {
        result = this.applyAgentLedgerOperations(input, false)
        if (
          result.conflicts > 0 ||
          result.operations.some((operation) => operation.action === "reject")
        ) {
          throw new Error("Agent ledger patch has conflicts or rejected operations")
        }
      })
      return ok(result!)
    } catch (error) {
      return fail(error)
    }
  }

  private applyAgentLedgerOperations(
    input: AgentLedgerPatchInput,
    dryRun: boolean,
  ): AgentLedgerPatchResult {
    const result: AgentLedgerPatchResult = {
      dryRun,
      created: 0,
      updated: 0,
      skipped: 0,
      conflicts: 0,
      warnings: [],
      operations: [],
    }

    input.operations.forEach((operation, index) => {
      const operationResult = this.applyAgentLedgerOperation(operation, index, dryRun)
      result.operations.push(operationResult)
      if (operationResult.action === "create") result.created += 1
      if (operationResult.action === "update") result.updated += 1
      if (operationResult.action === "skip") result.skipped += 1
      if (operationResult.action === "conflict") result.conflicts += 1
      if (operationResult.warnings) result.warnings.push(...operationResult.warnings)
    })

    return result
  }

  private applyAgentLedgerOperation(
    operation: AgentLedgerPatchInput["operations"][number],
    index: number,
    dryRun: boolean,
  ): AgentLedgerOperationResult {
    if (operation.op === "category.ensure") {
      return this.applyEnsureCategory(operation, index, dryRun)
    }
    if (operation.op === "cashflow.classify") {
      return this.applyClassifyCashflow(operation, index, dryRun)
    }
    return this.applyCreateCashflow(operation, index, dryRun)
  }

  private applyEnsureCategory(
    operation: AgentEnsureCategoryOperation,
    index: number,
    dryRun: boolean,
  ): AgentLedgerOperationResult {
    const name = operation.name.trim()
    if (!name) return operationReject(index, operation.op, "Category name is required")

    const kind = operation.categoryKind ?? "expense"
    if (!CATEGORY_KINDS.has(kind)) {
      return operationReject(index, operation.op, `Unsupported category kind: ${kind}`)
    }

    const existing = this.findCategory(name, kind)
    if (existing) {
      return {
        index,
        op: operation.op,
        action: "skip",
        targetType: "category",
        targetId: existing.id,
        message: `Category already exists: ${name}`,
      }
    }

    if (dryRun) {
      return {
        index,
        op: operation.op,
        action: "create",
        targetType: "category",
        message: `Would create category: ${name}`,
      }
    }

    const id = this.createCategoryRow({
      name,
      categoryKind: kind,
      color: operation.color ?? null,
      icon: operation.icon ?? null,
      displayOrder: operation.displayOrder ?? 0,
    })
    return {
      index,
      op: operation.op,
      action: "create",
      targetType: "category",
      targetId: id,
      message: `Created category: ${name}`,
    }
  }

  private applyCreateCashflow(
    operation: AgentCreateCashflowOperation,
    index: number,
    dryRun: boolean,
  ): AgentLedgerOperationResult {
    const sourceKind = operation.sourceKind ?? (operation.sourceExternalId ? "import" : "manual")
    const sourceName = normalizeOptionalText(operation.sourceName)
    const sourceExternalId = normalizeOptionalText(operation.sourceExternalId)
    const amount = Number(operation.amount)
    if (!Number.isFinite(amount) || amount < 0) {
      return operationReject(index, operation.op, "Cashflow amount must be a non-negative number")
    }
    if (sourceKind === "import" && (!sourceName || !sourceExternalId)) {
      return operationReject(
        index,
        operation.op,
        "Imported cashflow requires sourceName and sourceExternalId",
      )
    }
    if (sourceExternalId && !sourceName) {
      return operationReject(index, operation.op, "sourceExternalId requires sourceName")
    }

    if (sourceName && sourceExternalId) {
      const existing = this.findCashflowBySource(sourceName, sourceExternalId)
      if (existing) {
        const conflicts = sourceConflictFields(existing, operation)
        if (conflicts.length > 0) {
          return {
            index,
            op: operation.op,
            action: "conflict",
            targetType: "cashflow",
            targetId: existing.id,
            message: `Imported cashflow source id conflicts on: ${conflicts.join(", ")}`,
          }
        }
        return {
          index,
          op: operation.op,
          action: "skip",
          targetType: "cashflow",
          targetId: existing.id,
          message: "Imported cashflow already exists",
        }
      }
    }

    const warnings: string[] = []
    const categoryId = this.resolveCashflowCategory(operation, dryRun, warnings)
    if (categoryId === false) {
      return operationReject(
        index,
        operation.op,
        warnings[warnings.length - 1] ??
          `Category not found: ${operation.categoryName ?? operation.categoryId}`,
      )
    }

    if (dryRun) {
      return {
        index,
        op: operation.op,
        action: "create",
        targetType: "cashflow",
        message: "Would create cashflow event",
        warnings: warnings.length ? warnings : undefined,
      }
    }

    const id = newId("cf")
    const timestamp = nowIso()
    this.db
      .insert(cashflowEvents)
      .values({
        id,
        eventDate: operation.eventDate,
        occurredAt: operation.occurredAt ?? null,
        title: operation.title ?? operation.counterparty ?? null,
        counterparty: operation.counterparty ?? null,
        description: operation.description ?? null,
        userNote: operation.userNote ?? null,
        amount: operation.amount,
        currency: normalizeCurrency(operation.currency),
        direction: operation.direction as Direction,
        flowKind: operation.flowKind,
        categoryId: categoryId == null ? null : toSqlId(categoryId),
        sourceKind,
        sourceName,
        sourceExternalId,
        sourceFileHash: operation.sourceFileHash ?? null,
        importedAt: operation.importedAt ?? (sourceKind === "import" ? timestamp : null),
        paymentMethod: operation.paymentMethod ?? null,
        accountHint: operation.accountHint ?? null,
        includeInAnalytics: operation.includeInAnalytics ?? true,
        classificationSource:
          operation.classificationSource ?? (sourceKind === "import" ? "imported" : "manual"),
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .run()

    if (operation.tagIds) {
      for (const tagId of operation.tagIds) {
        this.db
          .insert(cashflowEventTags)
          .values({ cashflowEventId: id, tagId: toSqlId(tagId) })
          .onConflictDoNothing()
          .run()
      }
    }

    return {
      index,
      op: operation.op,
      action: "create",
      targetType: "cashflow",
      targetId: id,
      message: "Created cashflow event",
      warnings: warnings.length ? warnings : undefined,
    }
  }

  private applyClassifyCashflow(
    operation: AgentClassifyCashflowOperation,
    index: number,
    dryRun: boolean,
  ): AgentLedgerOperationResult {
    const target = this.findCashflowForClassification(operation)
    if (!target) {
      return operationReject(index, operation.op, "Cashflow not found for classification")
    }
    if (
      operation.id &&
      operation.sourceName &&
      operation.sourceExternalId &&
      ((target.sourceName ?? null) !== normalizeOptionalText(operation.sourceName) ||
        (target.sourceExternalId ?? null) !== normalizeOptionalText(operation.sourceExternalId))
    ) {
      return {
        index,
        op: operation.op,
        action: "conflict",
        targetType: "cashflow",
        targetId: target.id,
        message: "Cashflow id does not match source identity",
      }
    }

    const warnings: string[] = []
    const categoryId = this.resolveClassificationCategory(operation, target, dryRun, warnings)
    if (categoryId === false) {
      return operationReject(
        index,
        operation.op,
        warnings[warnings.length - 1] ??
          `Category not found: ${operation.categoryName ?? operation.categoryId}`,
      )
    }
    const classificationSource = operation.classificationSource ?? "rule"
    const nextCategoryId = categoryId == null ? null : toSqlId(categoryId)
    const sameCategory = (target.categoryId ?? null) === nextCategoryId
    const sameSource = target.classificationSource === classificationSource
    if (sameCategory && sameSource) {
      return {
        index,
        op: operation.op,
        action: "skip",
        targetType: "cashflow",
        targetId: target.id,
        message: "Cashflow classification already matches",
        warnings: warnings.length ? warnings : undefined,
      }
    }

    if (dryRun) {
      return {
        index,
        op: operation.op,
        action: "update",
        targetType: "cashflow",
        targetId: target.id,
        message: "Would update cashflow classification",
        warnings: warnings.length ? warnings : undefined,
      }
    }

    this.db
      .update(cashflowEvents)
      .set({
        categoryId: nextCategoryId,
        classificationSource,
        updatedAt: nowIso(),
      })
      .where(eq(cashflowEvents.id, target.id))
      .run()

    return {
      index,
      op: operation.op,
      action: "update",
      targetType: "cashflow",
      targetId: target.id,
      message: "Updated cashflow classification",
      warnings: warnings.length ? warnings : undefined,
    }
  }

  private resolveCashflowCategory(
    operation: AgentCreateCashflowOperation,
    dryRun: boolean,
    warnings: string[],
  ): FlowmId | null | false {
    const expectedCategoryKind = categoryKindForFlowKind(operation.flowKind)
    if (operation.categoryId !== undefined) {
      return this.resolveExplicitCategoryId(
        operation.categoryId,
        expectedCategoryKind,
        operation.flowKind,
        warnings,
      )
    }
    const categoryName = normalizeOptionalText(operation.categoryName)
    if (!categoryName) return null
    const categoryKind = operation.categoryKind ?? expectedCategoryKind
    if (categoryKind !== expectedCategoryKind) {
      warnings.push(
        `Category kind ${categoryKind} does not match ${operation.flowKind} cashflow; expected ${expectedCategoryKind}`,
      )
      return false
    }
    const existing = this.findCategory(categoryName, categoryKind)
    if (existing) return existing.id
    if (dryRun) {
      warnings.push(`Would create category: ${categoryName}`)
      return null
    }
    warnings.push(`Created category: ${categoryName}`)
    return this.createCategoryRow({
      name: categoryName,
      categoryKind,
      color: null,
      icon: null,
      displayOrder: 0,
    })
  }

  private resolveClassificationCategory(
    operation: AgentClassifyCashflowOperation,
    target: CashflowEventRow,
    dryRun: boolean,
    warnings: string[],
  ): FlowmId | null | false {
    const expectedCategoryKind = categoryKindForFlowKind(target.flowKind)
    if (operation.categoryId !== undefined) {
      return this.resolveExplicitCategoryId(
        operation.categoryId,
        expectedCategoryKind,
        target.flowKind,
        warnings,
      )
    }
    const categoryName = normalizeOptionalText(operation.categoryName)
    if (!categoryName) {
      warnings.push("No category was provided; classification will be cleared")
      return null
    }
    const categoryKind = operation.categoryKind ?? expectedCategoryKind
    if (!CATEGORY_KINDS.has(categoryKind)) {
      warnings.push(`Unsupported category kind: ${categoryKind}`)
      return false
    }
    if (categoryKind !== expectedCategoryKind) {
      warnings.push(
        `Category kind ${categoryKind} does not match ${target.flowKind} cashflow; expected ${expectedCategoryKind}`,
      )
      return false
    }
    const existing = this.findCategory(categoryName, categoryKind)
    if (existing) return existing.id
    if (dryRun) {
      warnings.push(`Would create category: ${categoryName}`)
      return null
    }
    warnings.push(`Created category: ${categoryName}`)
    return this.createCategoryRow({
      name: categoryName,
      categoryKind,
      color: null,
      icon: null,
      displayOrder: 0,
    })
  }

  private resolveExplicitCategoryId(
    categoryId: FlowmId | null,
    expectedCategoryKind: string,
    flowKind: string,
    warnings: string[],
  ): FlowmId | null | false {
    if (categoryId == null) return null
    const category = this.findAgentCategoryById(categoryId)
    if (!category) {
      warnings.push(`Category not found: ${categoryId}`)
      return false
    }
    if (category.categoryKind !== expectedCategoryKind) {
      warnings.push(
        `Category "${category.name}" is ${category.categoryKind}, cannot be used for ${flowKind} cashflow`,
      )
      return false
    }
    return category.id
  }

  private findCategory(name: string, categoryKind: string): CategoryRow | undefined {
    return this.db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.name, name),
          eq(categories.categoryKind, categoryKind as CategoryRow["categoryKind"]),
          isNull(categories.archivedAt),
        ),
      )
      .get()
  }

  private findAgentCategoryById(id: FlowmId): CategoryRow | undefined {
    return this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, toSqlId(id)), isNull(categories.archivedAt)))
      .get()
  }

  private createCategoryRow(input: {
    name: string
    categoryKind: string
    color: string | null
    icon: string | null
    displayOrder: number
  }): FlowmId {
    const id = newId("cat")
    const timestamp = nowIso()
    this.db
      .insert(categories)
      .values({
        id,
        name: input.name,
        categoryKind: input.categoryKind as CategoryRow["categoryKind"],
        color: input.color,
        icon: input.icon,
        displayOrder: input.displayOrder,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .run()
    return id
  }

  private findCashflowBySource(
    sourceName: string,
    sourceExternalId: string,
  ): CashflowEventRow | undefined {
    return this.db
      .select()
      .from(cashflowEvents)
      .where(
        and(
          eq(cashflowEvents.sourceName, sourceName),
          eq(cashflowEvents.sourceExternalId, sourceExternalId),
          ne(cashflowEvents.status, "deleted"),
        ),
      )
      .get()
  }

  private findCashflowForClassification(
    operation: AgentClassifyCashflowOperation,
  ): CashflowEventRow | undefined {
    if (operation.id) {
      return this.db
        .select()
        .from(cashflowEvents)
        .where(
          and(eq(cashflowEvents.id, toSqlId(operation.id)), ne(cashflowEvents.status, "deleted")),
        )
        .get()
    }

    const sourceName = normalizeOptionalText(operation.sourceName)
    const sourceExternalId = normalizeOptionalText(operation.sourceExternalId)
    if (!sourceName || !sourceExternalId) return undefined
    return this.findCashflowBySource(sourceName, sourceExternalId)
  }
}
