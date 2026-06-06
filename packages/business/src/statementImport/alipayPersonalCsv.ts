import { mapAlipayAccount } from "./accountMapping"
import { classifyStatementEntry, parseDirection } from "./classify"
import { parseCsvRows, rowObject } from "./csv"
import { summarizeEntries } from "./summary"
import type { NormalizedStatementEntry, StatementParseResult } from "./types"

const SOURCE = "alipay_personal_csv" as const

export function parseAlipayPersonalCsv(input: Uint8Array | string): StatementParseResult {
  const text = typeof input === "string" ? input : decodeChineseCsv(input)
  const lines = text.split(/\r?\n/)
  const headerIndex = lines.findIndex((line) => line.trimStart().startsWith("交易时间,"))
  if (headerIndex < 0) {
    throw new Error("未找到支付宝交易明细表头")
  }
  const rows = parseCsvRows(lines.slice(headerIndex).join("\n")).filter((row) => row.some((field) => field.trim().length > 0))
  const headers = rows[0].map((header) => header.trim())
  const entries = rows.slice(1).map((row) => normalizeAlipayRow(rowObject(headers, row)))
  return {
    source: SOURCE,
    entries,
    summary: summarizeEntries(entries),
  }
}

function normalizeAlipayRow(row: Record<string, string>): NormalizedStatementEntry {
  const paymentMethod = row["收/付款方式"] || ""
  const account = mapAlipayAccount(paymentMethod)
  const direction = parseDirection(row["收/支"] ?? "")
  const occurredAt = normalizeDateTime(row["交易时间"] ?? "")
  const classification = classifyStatementEntry({
    source: SOURCE,
    type: row["交易分类"] ?? "",
    description: row["商品说明"] ?? "",
    direction,
    status: row["交易状态"] ?? "",
    paymentMethod,
  })
  return {
    source: SOURCE,
    sourceAccountName: account.accountName,
    sourceSubAccountLabel: account.label,
    occurredAt,
    date: occurredAt.slice(0, 10),
    type: row["交易分类"] ?? "",
    counterparty: emptyToNull(row["交易对方"]),
    counterpartyAccount: emptyToNull(row["对方账号"]),
    description: row["商品说明"] ?? "",
    direction,
    amountNumber: normalizeAmount(row["金额"] ?? "0"),
    currency: "CNY",
    paymentMethod: emptyToNull(paymentMethod),
    status: row["交易状态"] ?? "",
    externalId: emptyToNull(row["交易订单号"]),
    merchantOrderId: emptyToNull(row["商家订单号"]),
    note: emptyToNull(row["备注"]),
    classification: classification.classification,
    confidence: classification.confidence,
    raw: row,
  }
}

function decodeChineseCsv(input: Uint8Array) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(input)
  } catch {
    return new TextDecoder("gb18030").decode(input)
  }
}

function normalizeDateTime(input: string) {
  const value = input.trim().replace(/\//g, "-")
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) {
    return `${value.replace(" ", "T")}+08:00`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T00:00:00+08:00`
  }
  return value
}

function normalizeAmount(input: string) {
  const clean = input.replace(/[¥￥,\s]/g, "")
  const number = Number(clean)
  if (Number.isFinite(number)) return number.toFixed(2)
  return clean || "0.00"
}

function emptyToNull(input: string | undefined) {
  const value = input?.trim() ?? ""
  return value.length === 0 || value === "/" ? null : value
}
