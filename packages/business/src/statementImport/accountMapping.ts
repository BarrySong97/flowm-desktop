const BANK_CODES: Array<[RegExp, string]> = [
  [/工商银行|中国工商银行|ICBC/i, "ICBC"],
  [/招商银行|CMB/i, "CMB"],
  [/建设银行|中国建设银行|CCB/i, "CCB"],
  [/中国银行|BOC/i, "BOC"],
  [/农业银行|中国农业银行|ABC/i, "ABC"],
  [/交通银行|BOCOM/i, "BOCOM"],
  [/邮储银行|邮政储蓄|PSBC/i, "PSBC"],
  [/平安银行|PAB/i, "PAB"],
  [/浦发银行|SPDB/i, "SPDB"],
  [/中信银行|CITIC/i, "CITIC"],
  [/兴业银行|CIB/i, "CIB"],
  [/民生银行|CMBC/i, "CMBC"],
  [/广发银行|CGB/i, "CGB"],
]

function bankCode(label: string) {
  return BANK_CODES.find(([pattern]) => pattern.test(label))?.[1] ?? "UnknownBank"
}

function cardTail(label: string) {
  return label.match(/\(?(\d{4})\)?/)?.[1] ?? null
}

export function mapAlipayAccount(paymentMethod: string) {
  const method = paymentMethod.trim()
  if (method.length === 0 || method === "/") {
    return {
      accountName: "Assets:Wallet:Alipay:Unknown",
      label: method || "支付宝未知账户",
    }
  }
  if (method.includes("余额宝")) {
    return {
      accountName: "Assets:Investments:Yuebao",
      label: method,
    }
  }
  if (method.includes("账户余额") || method.includes("余额")) {
    return {
      accountName: "Assets:Wallet:Alipay:Balance",
      label: method,
    }
  }
  if (method.includes("银行") || /\d{4}/.test(method)) {
    const suffix = cardTail(method)
    return {
      accountName: `Assets:Bank:${bankCode(method)}${suffix == null ? "" : `:${suffix}`}`,
      label: method,
    }
  }
  return {
    accountName: `Assets:Wallet:Alipay:${sanitizeSegment(method)}`,
    label: method,
  }
}

export function mapWeChatAccount(paymentMethod: string, type: string, status: string) {
  const method = paymentMethod.trim()
  const haystack = `${method} ${type} ${status}`
  if (method === "零钱" || status.includes("已存入零钱")) {
    return {
      accountName: "Assets:Wallet:WeChat:Balance",
      label: method || "微信零钱",
    }
  }
  if (method === "零钱通" || type.includes("零钱通")) {
    return {
      accountName: "Assets:Investments:WeChatChangePlus",
      label: method || "微信零钱通",
    }
  }
  if (haystack.includes("银行") || /\d{4}/.test(haystack)) {
    const suffix = cardTail(haystack)
    return {
      accountName: `Assets:Bank:${bankCode(haystack)}${suffix == null ? "" : `:${suffix}`}`,
      label: method || type,
    }
  }
  if (method.length === 0 || method === "/") {
    return {
      accountName: "Assets:Wallet:WeChat:Unknown",
      label: method || "微信未知账户",
    }
  }
  return {
    accountName: `Assets:Wallet:WeChat:${sanitizeSegment(method)}`,
    label: method,
  }
}

function sanitizeSegment(input: string) {
  return input.replace(/[^\p{L}\p{N}]+/gu, "_").replace(/^_+|_+$/g, "") || "Unknown"
}
