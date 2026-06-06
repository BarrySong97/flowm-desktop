import * as XLSX from "xlsx"
import { mapWeChatAccount } from "./accountMapping"
import { classifyStatementEntry, parseDirection } from "./classify"
import { summarizeEntries } from "./summary"
import type { NormalizedStatementEntry, StatementParseResult } from "./types"

const SOURCE = "wechat_personal_xlsx" as const

export function parseWeChatPersonalXlsx(input: Uint8Array | ArrayBuffer): StatementParseResult {
  const workbook = XLSX.read(input, { type: "array" })
  const sheetName = workbook.SheetNames[0]
  if (sheetName == null) throw new Error("微信账单文件没有工作表")
  const rows = XLSX.utils.sheet_to_json<Array<string | number>>(workbook.Sheets[sheetName], {
    header: 1,
    raw: true,
    defval: "",
  })
  const headerIndex = rows.findIndex((row) => String(row[0] ?? "").trim() === "交易时间")
  if (headerIndex < 0) {
    throw new Error("未找到微信支付账单表头")
  }
  const headers = rows[headerIndex].map((value) => String(value).trim())
  const entries = rows
    .slice(headerIndex + 1)
    .filter((row) => row.some((value) => String(value).trim().length > 0))
    .map((row) => normalizeWeChatRow(headers, row))
  return {
    source: SOURCE,
    entries,
    summary: summarizeEntries(entries),
  }
}

function normalizeWeChatRow(headers: string[], row: Array<string | number>): NormalizedStatementEntry {
  const record: Record<string, string> = {}
  headers.forEach((header, index) => {
    record[header] = cellToString(row[index])
  })
  const paymentMethod = record["支付方式"] ?? ""
  const type = record["交易类型"] ?? ""
  const status = record["当前状态"] ?? ""
  const account = mapWeChatAccount(paymentMethod, type, status)
  const direction = parseDirection(record["收/支"] ?? "")
  const occurredAt = normalizeWeChatDate(row[0])
  const classification = classifyStatementEntry({
    source: SOURCE,
    type,
    description: record["商品"] ?? "",
    direction,
    status,
    paymentMethod,
  })
  return {
    source: SOURCE,
    sourceAccountName: account.accountName,
    sourceSubAccountLabel: account.label,
    occurredAt,
    date: occurredAt.slice(0, 10),
    type,
    counterparty: emptyToNull(record["交易对方"]),
    counterpartyAccount: null,
    description: record["商品"] ?? "",
    direction,
    amountNumber: normalizeAmount(record["金额(元)"] ?? "0"),
    currency: "CNY",
    paymentMethod: emptyToNull(paymentMethod),
    status,
    externalId: emptyToNull(record["交易单号"]),
    merchantOrderId: emptyToNull(record["商户单号"]),
    note: emptyToNull(record["备注"]),
    classification: classification.classification,
    confidence: classification.confidence,
    raw: record,
  }
}

function normalizeWeChatDate(value: string | number | undefined) {
  if (typeof value === "number") {
    const ms = Date.UTC(1899, 11, 30) + value * 86_400_000
    const date = new Date(ms)
    const pad = (n: number) => String(n).padStart(2, "0")
    return [
      `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
      `T${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}+08:00`,
    ].join("")
  }
  const text = String(value ?? "").trim().replace(/\//g, "-")
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(text)) {
    return `${text.replace(" ", "T")}+08:00`
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return `${text}T00:00:00+08:00`
  }
  return text
}

function normalizeAmount(input: string) {
  const clean = input.replace(/[¥￥,\s]/g, "")
  const number = Number(clean)
  if (Number.isFinite(number)) return number.toFixed(2)
  return clean || "0.00"
}

function cellToString(value: string | number | undefined) {
  return value == null ? "" : String(value).trim()
}

function emptyToNull(input: string | undefined) {
  const value = input?.trim() ?? ""
  return value.length === 0 || value === "/" ? null : value
}
