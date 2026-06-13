import type { AssetSnapshotType } from "@flowm/api"

export const CATEGORY_COLORS: Record<string, string> = {
  餐饮: "#e07b3a",
  交通: "#4a8fc4",
  购物: "#c46a9e",
  订阅: "#7c6ac4",
  娱乐: "#d4a017",
  居住: "#5bac8e",
  理财: "#2e86ab",
  通讯: "#5e9e9f",
  收入: "#14794a",
  其他: "#9caca3",
  转账: "#6b7d72",
}

export const BUDGET_CATEGORY_COLORS: Record<string, string> = {
  餐饮: "var(--c-food)",
  购物: "var(--c-shop)",
  交通: "var(--c-trans)",
  娱乐: "var(--c-fun)",
  其他: "var(--c-other)",
  订阅: "var(--c-sub)",
  居住: "var(--c-home)",
}

export const SOURCE_BADGES: Record<string, { bg: string; char: string }> = {
  支付宝: { bg: "#1677ff", char: "支" },
  微信: { bg: "#07c160", char: "微" },
  招商银行: { bg: "#c5242a", char: "招" },
  工商银行: { bg: "#d4071c", char: "工" },
  建设银行: { bg: "#00549e", char: "建" },
  中国移动: { bg: "#e60012", char: "移" },
}

export const ASSET_TYPE_LABELS: Record<AssetSnapshotType, string> = {
  cash: "现金",
  bank: "银行",
  wallet: "钱包",
  brokerage: "券商账户",
  investment: "投资",
  fund: "基金",
  stock: "股票",
  crypto: "数字资产",
  real_estate: "不动产",
  vehicle: "车辆",
  fixed_asset: "固定资产",
  liability: "负债",
  other: "其他",
}

export const ASSET_TYPES: AssetSnapshotType[] = [
  "cash",
  "bank",
  "wallet",
  "investment",
  "fund",
  "stock",
  "crypto",
  "real_estate",
  "vehicle",
  "fixed_asset",
  "liability",
  "other",
]

export const ASSET_GROUPS: Record<AssetSnapshotType, string> = {
  cash: "现金",
  bank: "现金",
  wallet: "现金",
  brokerage: "投资",
  investment: "投资",
  fund: "投资",
  stock: "投资",
  crypto: "投资",
  real_estate: "不动产",
  fixed_asset: "固定资产",
  vehicle: "固定资产",
  liability: "负债",
  other: "其他",
}

export const ASSET_GROUP_COLORS: Record<string, string> = {
  现金: "var(--accent)",
  投资: "#6c72cb",
  不动产: "#e07b39",
  固定资产: "#b37a5d",
  负债: "var(--red)",
  其他: "#8c8fa0",
}

export const SUBSCRIPTION_CATEGORY_COLORS: Record<"fun" | "sub" | "shop", string> = {
  fun: "var(--c-fun)",
  sub: "var(--c-sub)",
  shop: "var(--c-shop)",
}

export const CYCLE_LABELS: Record<string, string> = {
  monthly: "每月",
  yearly: "每年",
  weekly: "每周",
  custom: "自定义",
}

export function categoryColor(name?: string): string {
  return name ? (CATEGORY_COLORS[name] ?? CATEGORY_COLORS["其他"]) : CATEGORY_COLORS["其他"]
}
