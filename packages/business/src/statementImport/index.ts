export * from "./types"
export * from "./alipayPersonalCsv"
export * from "./wechatPersonalXlsx"

import { parseAlipayPersonalCsv } from "./alipayPersonalCsv"
import { parseWeChatPersonalXlsx } from "./wechatPersonalXlsx"
import type { StatementParseResult, StatementSource } from "./types"

export function parseStatementFile(source: StatementSource, input: Uint8Array | ArrayBuffer | string): StatementParseResult {
  if (source === "alipay_personal_csv") {
    return parseAlipayPersonalCsv(typeof input === "string" ? input : new Uint8Array(input))
  }
  return parseWeChatPersonalXlsx(typeof input === "string" ? new TextEncoder().encode(input) : input)
}
