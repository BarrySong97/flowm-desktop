// Mock data for homepage — used when store has no real data yet
// Source: fd-data.jsx design file

export const MOCK_DAILY_BARS = [
  120, 0, 340, 86, 52, 1299, 0, 210, 45, 860, 33, 520, 98, 0, 186,
  402, 75, 640, 0, 55, 2553, 39, 98, 0, 1299, 52, 9889, 238, 34, 260,
]

export const MOCK_NET_TREND = [
  243.1, 245.8, 248.0, 250.4, 252.9, 255.1,
  258.6, 261.0, 263.7, 264.9, 266.8, 268.4,
].map((v) => v * 10000)

export const MOCK_TOTAL_ASSETS = 4_558_071
export const MOCK_LIQUID_ASSETS = 119_311
export const MOCK_TOTAL_LIAB = 1_873_640
export const MOCK_NET_WORTH = MOCK_TOTAL_ASSETS - MOCK_TOTAL_LIAB

export const MOCK_MONTH_IN = 30_228
export const MOCK_MONTH_OUT = 19_908
export const MOCK_MONTH_NET = MOCK_MONTH_IN - MOCK_MONTH_OUT
export const MOCK_MONTHLY_FIXED = 12_587

export const MOCK_UPCOMING = [
  { d: "06-11", name: "爱奇艺 黄金", amt: 25,    kind: "订阅" as const },
  { d: "06-14", name: "ChatGPT Plus", amt: 145,  kind: "订阅" as const },
  { d: "06-19", name: "iCloud 200G",  amt: 21,   kind: "订阅" as const },
  { d: "06-21", name: "威尔士健身",   amt: 299,  kind: "订阅" as const },
  { d: "06-25", name: "消费贷 月供",  amt: 2180, kind: "贷款" as const },
  { d: "07-06", name: "房贷 月供",    amt: 9850, kind: "贷款" as const },
]

export const MOCK_BUDGETS = [
  { cat: "餐饮", spent: 3284, limit: 4000 },
  { cat: "购物", spent: 1940, limit: 1800 },
  { cat: "交通", spent: 1150, limit: 1400 },
  { cat: "娱乐", spent: 680,  limit: 1200 },
  { cat: "其他", spent: 612,  limit: 900  },
  { cat: "订阅", spent: 206,  limit: 600  },
]

export const MOCK_TX: { date: string; counterparty: string; description: string; categoryName: string; flowKind: string; amount: string }[] = [
  { date: "2025-06-07", counterparty: "盒马鲜生",       description: "", categoryName: "餐饮", flowKind: "expense", amount: "218.40" },
  { date: "2025-06-07", counterparty: "滴滴出行",       description: "", categoryName: "交通", flowKind: "expense", amount: "34.00"  },
  { date: "2025-06-06", counterparty: "招商银行 房贷",  description: "", categoryName: "居住", flowKind: "expense", amount: "9850.00"},
  { date: "2025-06-06", counterparty: "星巴克",         description: "", categoryName: "餐饮", flowKind: "expense", amount: "39.00"  },
  { date: "2025-06-05", counterparty: "京东 · 显示器", description: "", categoryName: "购物", flowKind: "expense", amount: "1299.00"},
  { date: "2025-06-05", counterparty: "基金定投",       description: "", categoryName: "理财", flowKind: "expense", amount: "2000.00"},
  { date: "2025-06-04", counterparty: "公司工资",       description: "", categoryName: "收入", flowKind: "income",  amount: "28600.00"},
  { date: "2025-06-04", counterparty: "美团外卖",       description: "", categoryName: "餐饮", flowKind: "expense", amount: "52.50"  },
  { date: "2025-06-03", counterparty: "12306 高铁票",  description: "", categoryName: "交通", flowKind: "expense", amount: "553.00" },
  { date: "2025-06-03", counterparty: "爱奇艺 黄金",   description: "", categoryName: "订阅", flowKind: "expense", amount: "25.00"  },
  { date: "2025-06-02", counterparty: "万达影城",       description: "", categoryName: "娱乐", flowKind: "expense", amount: "98.00"  },
  { date: "2025-06-02", counterparty: "全家便利店",     description: "", categoryName: "餐饮", flowKind: "expense", amount: "23.50"  },
  { date: "2025-06-01", counterparty: "国家电网 电费", description: "", categoryName: "居住", flowKind: "expense", amount: "186.30" },
  { date: "2025-05-31", counterparty: "余额宝收益",     description: "", categoryName: "理财", flowKind: "income",  amount: "28.60"  },
  { date: "2025-05-30", counterparty: "优衣库",         description: "", categoryName: "购物", flowKind: "expense", amount: "396.00" },
]
