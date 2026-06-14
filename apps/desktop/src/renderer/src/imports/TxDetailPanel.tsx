/**
 * @purpose Render and manage imported cashflow tx detail panel workflow.
 * @role    Renderer feature surface for statement lines and cashflow details.
 * @deps    React, tRPC import/cashflow queries, and table/detail UI.
 * @gotcha  Imports describe past cashflow and must not update asset balances automatically.
 */

import React from "react"
import { Button } from "@heroui/react"
import { useConfirm } from "../components/ui/ConfirmModal"
import { CATEGORY_COLORS } from "@/lib/domainDisplay"
import { formatNumber } from "@/lib/format"
import { Dim } from "../components/ui/Dim"
import { ColorDot } from "../components/ui/ColorDot"
import { SectionTitle } from "../components/ui/SectionTitle"

const DAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"]

const fmt = formatNumber

export interface Tx {
  id: number
  rawId: string
  date: string
  occurredAt?: string | null
  counterparty: string
  flowKind: string
  amount: number
  categoryName: string
  tag?: string
  source: string
  title?: string | null
  description?: string | null
  userNote?: string | null
  statementLineId?: string | number | null
  createdAt?: string | null
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
  onDelete: (rawId: string) => void | Promise<void>
}

export function TxDetailPanel({ tx, allTxs, onBack, onDelete }: Props) {
  const confirm = useConfirm()
  const isIncome = tx.flowKind === "income"
  const isTransfer = tx.flowKind === "transfer"
  const amtColor = isIncome ? "var(--accent)" : isTransfer ? "var(--ink-3)" : "var(--red)"
  const amtPrefix = isIncome ? "+" : isTransfer ? "" : "−"
  const flowLabel = isIncome ? "收入" : isTransfer ? "转账" : "支出"
  const catColor = CATEGORY_COLORS[tx.categoryName] ?? CATEGORY_COLORS["其他"]

  const dt = new Date(tx.date)
  const dayLabel = Number.isNaN(dt.getTime()) ? "" : DAYS[dt.getDay()]
  const timeStr = tx.occurredAt?.slice(11, 16) ?? null
  const originalDesc = tx.description ?? tx.title ?? null
  const sourceDetail = tx.createdAt == null
    ? tx.source
    : `${tx.source} · ${tx.createdAt.slice(0, 10)}`

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
        {tx.date}{dayLabel ? ` · ${dayLabel}` : ""}{timeStr ? ` ${timeStr}` : ""}
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
      <InfoRow label="原始描述">{originalDesc ?? "暂无原始凭证"}</InfoRow>
      <InfoRow label="交易号">
        <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11 }}>
          {tx.statementLineId ?? tx.rawId}
        </span>
      </InfoRow>
      <InfoRow label="来源">{sourceDetail}</InfoRow>
      <InfoRow label="备注">
        {tx.userNote ?? <span style={{ color: "var(--accent)", cursor: "pointer" }}>+ 添加备注</span>}
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
        <Button size="sm" variant="outline" style={{ borderRadius: 5 }}>编辑流水内容</Button>
        <div style={{ flex: 1 }} />
        <Button
          size="sm"
          variant="danger-soft"
          style={{ borderRadius: 5 }}
          onPress={() => confirm({
            title: "删除流水",
            description: `删除「${tx.counterparty || tx.title || "这笔流水"}」后无法恢复，确定继续？`,
            confirmText: "删除",
            danger: true,
            onConfirm: () => onDelete(tx.rawId),
          })}
        >
          删除
        </Button>
      </div>
    </div>
  )
}
