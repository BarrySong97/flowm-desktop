import React from "react"
import { Button } from "@heroui/react"
import { Dim } from "../components/ui/Dim"
import { ColorDot } from "../components/ui/ColorDot"
import { SectionTitle } from "../components/ui/SectionTitle"

const DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const CAT_COLOR: Record<string, string> = {
  餐饮: "#e07b3a", 交通: "#4a8fc4", 购物: "#c46a9e",
  订阅: "#7c6ac4", 娱乐: "#d4a017", 居住: "#5bac8e",
  理财: "#2e86ab", 通讯: "#5e9e9f", 收入: "#14794a",
  其他: "#9caca3", 转账: "#6b7d72",
}

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function seeded(n: number) {
  let s = (n * 1664525 + 1013904223) & 0x7fffffff
  return () => { s = (s * 1664525 + 1013904223) & 0x7fffffff; return s / 0x7fffffff }
}

function fakeTime(id: number) {
  const rng = seeded(id * 7)
  const h = 8 + Math.floor(rng() * 14)
  const m = Math.floor(rng() * 60)
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

function fakeTxId(id: number, date: string) {
  const rng = seeded(id * 13)
  const digits = date.replace(/-/g, "") + String(Math.floor(rng() * 1e8)).padStart(8, "0")
  return digits
}

function fakeOriginalDesc(counterparty: string, source: string) {
  if (source === "支付宝") return `支付宝-${counterparty}-商品消费`
  if (source === "微信") return `财付通-${counterparty}`
  return `${source}POS消费-${counterparty}`
}

function fakeImportDate(date: string) {
  const d = new Date(date)
  d.setDate(d.getDate() + 1)
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} 自动导入`
}

export interface Tx {
  id: number; date: string; counterparty: string
  flowKind: "income" | "expense" | "transfer"
  amount: number; categoryName: string; tag?: string; source: string
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "9px 0", borderBottom: "1px solid var(--hair-3)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--ink-4)", width: 72, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>{children}</span>
    </div>
  )
}

interface Props {
  tx: Tx
  allTxs: Tx[]
  onBack: () => void
}

export function TxDetailPanel({ tx, allTxs, onBack }: Props) {
  const isIncome = tx.flowKind === "income"
  const isTransfer = tx.flowKind === "transfer"
  const amtColor = isIncome ? "var(--accent)" : isTransfer ? "var(--ink-3)" : "var(--red)"
  const amtPrefix = isIncome ? "+" : isTransfer ? "" : "−"
  const flowLabel = isIncome ? "收入" : isTransfer ? "转账" : "支出"
  const catColor = CAT_COLOR[tx.categoryName] ?? CAT_COLOR["其他"]

  const dt = new Date(tx.date)
  const dayLabel = DAYS[dt.getDay()]
  const timeStr = fakeTime(tx.id)
  const txId = fakeTxId(tx.id, tx.date)
  const originalDesc = fakeOriginalDesc(tx.counterparty, tx.source)
  const importDate = fakeImportDate(tx.date)

  const recent = allTxs
    .filter((t) => t.counterparty === tx.counterparty && t.id !== tx.id)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  return (
    <div style={{ padding: "20px 24px 112px" }}>

      {/* Back + kicker */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 12 }}>
        <Button
          isIconOnly size="sm" variant="ghost" onPress={onBack}
          style={{ width: 24, height: 24, minWidth: 24, borderRadius: 5, marginLeft: -4 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--ink-4)", fontWeight: 500 }}>
          <ColorDot color={catColor} size={7} />
          {tx.categoryName} · {flowLabel}
        </div>
      </div>

      {/* Title + amount */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
          {tx.counterparty}
        </div>
        <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 26, fontWeight: 700, color: amtColor, whiteSpace: "nowrap" }}>
          {amtPrefix}¥{fmt(tx.amount, 1)}
        </div>
      </div>
      <Dim style={{ fontSize: 11, marginTop: 6 }}>
        {tx.date} · {dayLabel} {timeStr}
      </Dim>

      <div style={{ margin: "14px 0 0", borderTop: "1px solid var(--hair-2)" }} />

      {/* Info rows */}
      <InfoRow label="账户 / 卡">{tx.source}</InfoRow>
      <InfoRow label="类别">
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <ColorDot color={catColor} size={7} />
          <span>{tx.categoryName}</span>
          <span style={{ fontSize: 11, color: "var(--accent)", cursor: "pointer", marginLeft: 2 }}>改</span>
        </span>
      </InfoRow>
      <InfoRow label="原始描述">{originalDesc}</InfoRow>
      <InfoRow label="交易号">
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>{txId}</span>
      </InfoRow>
      <InfoRow label="来源">{tx.source}账单 · {importDate}</InfoRow>
      <InfoRow label="备注">
        <span style={{ color: "var(--accent)", cursor: "pointer" }}>+ 添加备注</span>
      </InfoRow>

      {/* Recent same merchant */}
      {recent.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ marginBottom: 8 }}><SectionTitle>同商户最近</SectionTitle></div>
          {recent.map((t) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--hair-3)" }}>
              <span style={{ fontSize: 11, color: "var(--ink-4)", width: 36, flexShrink: 0 }}>{t.date.slice(5)}</span>
              <span style={{ fontSize: 12, color: "var(--ink-3)", flex: 1 }}>{t.counterparty}</span>
              <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: t.flowKind === "income" ? "var(--accent)" : "var(--red)" }}>
                {t.flowKind === "income" ? "+" : "−"}{fmt(t.amount, 1)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 24, alignItems: "center", flexWrap: "wrap" }}>
        <Button size="sm" variant="outline" style={{ borderRadius: 5 }}>修改分类</Button>
        <Button size="sm" variant="outline" style={{ borderRadius: 5 }}>添加备注</Button>
        <Button size="sm" variant="outline" style={{ borderRadius: 5 }}>不计入统计</Button>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="danger-soft" style={{ borderRadius: 5 }}>删除</Button>
      </div>
    </div>
  )
}
