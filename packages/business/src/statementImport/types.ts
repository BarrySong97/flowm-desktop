export type StatementSource = "alipay_personal_csv" | "wechat_personal_xlsx"

export type StatementDirection = "income" | "expense" | "neutral"

export type StatementClassification =
  | "external_expense_candidate"
  | "platform_income_candidate"
  | "personal_transfer_candidate"
  | "gift_candidate"
  | "refund_candidate"
  | "internal_transfer_candidate"
  | "investment_income_candidate"
  | "investment_buy_candidate"
  | "investment_refund_candidate"
  | "closed_or_failed"
  | "ambiguous"

export interface NormalizedStatementEntry {
  source: StatementSource
  sourceAccountName: string
  sourceSubAccountLabel: string
  occurredAt: string
  date: string
  type: string
  counterparty: string | null
  counterpartyAccount: string | null
  description: string
  direction: StatementDirection
  amountNumber: string
  currency: "CNY"
  paymentMethod: string | null
  status: string
  externalId: string | null
  merchantOrderId: string | null
  note: string | null
  classification: StatementClassification
  confidence: number
  raw: Record<string, unknown>
}

export interface StatementParseSummary {
  total: number
  income: number
  expense: number
  neutral: number
  ignored: number
  byClassification: Record<StatementClassification, number>
  byAccount: Record<string, number>
}

export interface StatementParseResult {
  source: StatementSource
  entries: NormalizedStatementEntry[]
  summary: StatementParseSummary
}

export interface ClassificationInput {
  source: StatementSource
  type: string
  description: string
  direction: StatementDirection
  status: string
  paymentMethod: string | null
}
