import type { ClassificationInput, StatementClassification, StatementDirection } from "./types"

export function parseDirection(value: string): StatementDirection {
  if (value.includes("收入")) return "income"
  if (value.includes("支出")) return "expense"
  return "neutral"
}

export function classifyStatementEntry(input: ClassificationInput): {
  classification: StatementClassification
  confidence: number
} {
  const text = `${input.type} ${input.description} ${input.status} ${input.paymentMethod ?? ""}`
  if (/关闭|失败|已全额退款|交易取消|支付失败/.test(input.status)) {
    return { classification: "closed_or_failed", confidence: 95 }
  }
  if (input.source === "alipay_personal_csv") {
    return classifyAlipay(input, text)
  }
  return classifyWeChat(input, text)
}

function classifyAlipay(input: ClassificationInput, text: string) {
  const investmentLike = input.type.includes("投资理财") || /蚂蚁财富|基金|股票|ETF|QDII|纳斯达克|混合/.test(text)
  if (investmentLike) {
    if (/收益发放|收益/.test(text)) {
      return { classification: "investment_income_candidate" as const, confidence: 90 }
    }
    if (/买入退款|退款成功/.test(text)) {
      return { classification: "investment_refund_candidate" as const, confidence: 88 }
    }
    if (/买入|申购/.test(text)) {
      return { classification: "investment_buy_candidate" as const, confidence: 84 }
    }
    if (/自动转入|转账收款到余额宝|单次转入|余额宝/.test(text)) {
      return { classification: "internal_transfer_candidate" as const, confidence: 78 }
    }
  }
  if (hasRefundSignal(text)) {
    return { classification: "refund_candidate" as const, confidence: 85 }
  }
  if (input.type.includes("转账红包")) {
    if (/红包/.test(input.description)) return { classification: "gift_candidate" as const, confidence: 85 }
    return { classification: "personal_transfer_candidate" as const, confidence: 80 }
  }
  if (input.direction === "expense") {
    return { classification: "external_expense_candidate" as const, confidence: 78 }
  }
  if (input.direction === "income") {
    return { classification: "platform_income_candidate" as const, confidence: 68 }
  }
  return { classification: "ambiguous" as const, confidence: 40 }
}

function classifyWeChat(input: ClassificationInput, text: string) {
  if (hasRefundSignal(text)) {
    return { classification: "refund_candidate" as const, confidence: 85 }
  }
  if (/零钱通转出|转入零钱通|零钱通/.test(input.type)) {
    return { classification: "internal_transfer_candidate" as const, confidence: 82 }
  }
  if (/红包/.test(text)) {
    return { classification: "gift_candidate" as const, confidence: 84 }
  }
  if (/转账/.test(input.type)) {
    return { classification: "personal_transfer_candidate" as const, confidence: 80 }
  }
  if ((/商户消费|扫二维码付款/.test(input.type) || input.direction === "expense") && input.direction === "expense") {
    return { classification: "external_expense_candidate" as const, confidence: input.type.includes("商户消费") ? 88 : 72 }
  }
  if (input.direction === "income") {
    return { classification: "platform_income_candidate" as const, confidence: 65 }
  }
  return { classification: "ambiguous" as const, confidence: 40 }
}

function hasRefundSignal(text: string) {
  const normalized = text.replace(/不退款|不可退款|不能退款|不支持退款/g, "")
  return /退款|退回/.test(normalized)
}
