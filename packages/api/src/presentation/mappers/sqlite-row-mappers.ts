/**
 * @purpose Map SQLite/Drizzle rows into renderer-facing API contract objects.
 * @role    Presentation mapper layer shared by thin API facade methods.
 * @deps    @flowm/db row types and shared/API contract types.
 * @gotcha  Mapping must preserve Flowm's cashflow, asset, and future obligation separation.
 */

import type {
  AssetItemRow,
  BudgetItemRow,
  BudgetPeriodRow,
  BudgetSetRow,
  CategoryRow,
  CurrencySettingsRow,
  ExchangeRateRow,
  LoanPaymentOccurrenceRow,
  LoanRow,
  ObjectLinkRow,
  StatementImportRow,
  StatementLineRow,
  SubscriptionOccurrenceRow,
  SubscriptionRow,
  TagRow,
} from "@flowm/db"
import type {
  AssetItemSummary,
  AssetSnapshotSummary,
  AssetSnapshotType,
} from "@flowm/shared/contracts"
import type {
  BudgetItemSummary,
  BudgetPeriodSummary,
  BudgetSetSummary,
  CategorySummary,
  CurrencySettingsSummary,
  ExchangeRateSummary,
  LoanPaymentOccurrenceSummary,
  LoanSummary,
  ObjectLinkSummary,
  StatementImportSummary,
  StatementLineSummary,
  SubscriptionOccurrenceSummary,
  SubscriptionSummary,
  TagSummary,
} from "../../index"
import type { AssetSnapshotWithItem } from "../../infrastructure/db/repositories/assets.repository"

export function mapCurrencySettings(row: CurrencySettingsRow): CurrencySettingsSummary {
  return {
    displayCurrency: row.displayCurrency,
    fxProvider: row.fxProvider,
    fxRequestPolicy: row.fxRequestPolicy,
    updatedAt: row.updatedAt,
    meta: row.meta ?? null,
  }
}

export function mapExchangeRate(row: ExchangeRateRow): ExchangeRateSummary {
  return {
    id: row.id,
    fromCurrency: row.fromCurrency,
    toCurrency: row.toCurrency,
    rateDate: row.rateDate,
    rate: row.rate,
    provider: row.provider,
    fetchedAt: row.fetchedAt,
    sourceDate: row.sourceDate,
    meta: row.meta ?? null,
  }
}

export function mapCategory(row: CategoryRow): CategorySummary {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parentId,
    categoryKind: row.categoryKind,
    kind: row.categoryKind,
    color: row.color,
    icon: row.icon,
    sortOrder: row.displayOrder,
    displayOrder: row.displayOrder,
    archived: row.archivedAt != null,
    archivedAt: row.archivedAt,
  }
}

export function mapTag(row: TagRow): TagSummary {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    archived: row.archivedAt != null,
  }
}

export function mapStatementImport(row: StatementImportRow): StatementImportSummary {
  return {
    id: row.id,
    sourceName: row.sourceName,
    fileName: row.fileName,
    fileHash: row.fileHash,
    importedAt: row.importedAt,
    status: row.status,
  }
}

export function mapStatementLine(row: StatementLineRow): StatementLineSummary {
  return {
    id: row.id,
    importId: row.importId,
    externalId: row.externalId,
    eventDate: row.eventDate,
    occurredAt: row.occurredAt,
    counterparty: row.counterparty,
    description: row.description,
    amount: row.amount,
    currency: row.currency,
    direction: row.direction,
    status: row.status,
  }
}

export function mapAssetItem(row: AssetItemRow): AssetItemSummary {
  return {
    id: row.id,
    name: row.name,
    assetType: row.assetType,
    institution: row.institution,
    defaultCurrency: row.defaultCurrency,
    valuationMethod: row.valuationMethod,
    archived: row.archivedAt != null,
    note: row.note,
  }
}

export function mapAssetSnapshot(row: AssetSnapshotWithItem): AssetSnapshotSummary {
  return {
    id: row.id,
    assetItemId: row.assetItemId,
    accountName: row.assetName,
    assetType: row.assetType === "brokerage" ? "investment" : (row.assetType as AssetSnapshotType),
    snapshotAt: row.snapshotAt,
    quantityNumber: row.quantityAmount,
    quantityCurrency: row.quantityUnit,
    quantityAmount: row.quantityAmount,
    quantityUnit: row.quantityUnit,
    valueNumber: row.valueAmount,
    valueCurrency: row.valueCurrency,
    source: row.sourceKind,
    note: row.note,
    meta: {
      costBasisAmount: row.costBasisAmount,
      costBasisCurrency: row.costBasisCurrency,
      institution: row.institution,
    },
  }
}

export function mapSubscription(row: SubscriptionRow): SubscriptionSummary {
  return {
    id: row.id,
    name: row.name,
    merchant: row.merchant,
    amount: row.amount,
    currency: row.currency,
    billingCycle: row.billingCycle,
    intervalCount: row.intervalCount,
    nextChargeDate: row.nextChargeDate,
    autoRenew: row.autoRenew,
    categoryId: row.categoryId,
    status: row.status,
    note: row.note,
  }
}

export function mapSubscriptionOccurrence(
  row: SubscriptionOccurrenceRow,
): SubscriptionOccurrenceSummary {
  return {
    id: row.id,
    subscriptionId: row.subscriptionId,
    dueDate: row.dueDate,
    amount: row.amount,
    currency: row.currency,
    status: row.status,
  }
}

export function mapLoan(row: LoanRow): LoanSummary {
  return {
    id: row.id,
    name: row.name,
    lender: row.lender,
    currency: row.currency,
    principalAmount: row.principalAmount,
    currentPrincipalEstimate: row.currentPrincipalEstimate,
    annualRateBps: row.annualRateBps,
    repaymentMethod: row.repaymentMethod,
    paymentAmount: row.paymentAmount,
    paymentDay: row.paymentDay,
    startDate: row.startDate,
    termMonths: row.termMonths,
    status: row.status,
    note: row.note,
  }
}

export function mapLoanPaymentOccurrence(
  row: LoanPaymentOccurrenceRow,
): LoanPaymentOccurrenceSummary {
  return {
    id: row.id,
    loanId: row.loanId,
    dueDate: row.dueDate,
    paymentAmount: row.paymentAmount,
    principalAmount: row.principalAmount,
    interestAmount: row.interestAmount,
    feeAmount: row.feeAmount,
    remainingPrincipalEstimate: row.remainingPrincipalEstimate,
    status: row.status,
  }
}

export function mapBudgetSet(row: BudgetSetRow): BudgetSetSummary {
  return { id: row.id, name: row.name, status: row.status }
}

export function mapBudgetPeriod(row: BudgetPeriodRow): BudgetPeriodSummary {
  return {
    id: row.id,
    budgetSetId: row.budgetSetId,
    periodKind: row.periodKind,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    currency: row.currency,
    status: row.status,
  }
}

export function mapBudgetItem(row: BudgetItemRow): BudgetItemSummary {
  return {
    id: row.id,
    budgetPeriodId: row.budgetPeriodId,
    name: row.name,
    itemKind: row.itemKind,
    plannedAmount: row.plannedAmount,
    currency: row.currency,
    categoryId: row.categoryId,
    color: row.color ?? null,
    status: row.status,
  }
}

export function mapObjectLink(row: ObjectLinkRow): ObjectLinkSummary {
  return {
    id: row.id,
    fromType: row.fromType,
    fromId: row.fromId,
    toType: row.toType,
    toId: row.toId,
    linkType: row.linkType,
    confidence: row.confidence,
    createdBy: row.createdBy,
    note: row.note,
  }
}
