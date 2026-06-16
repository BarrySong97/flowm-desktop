/**
 * @purpose Render and manage the asset detail panel workflow.
 * @role    Renderer feature surface for manually maintained asset snapshots.
 * @deps    React, tRPC queries, and shared renderer UI components.
 * @gotcha  Do not infer asset balances from imported statement lines.
 */

import { useState, useMemo } from "react"
import { Button, Drawer } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import type { AssetSnapshotSummary } from "@flowm/shared/contracts"
import { AreaChart, Area, XAxis, ResponsiveContainer, Tooltip } from "recharts"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { formatNumber } from "@/lib/format"
import { Kicker } from "../components/ui/Kicker"
import { Dim } from "../components/ui/Dim"
import { SectionTitle } from "../components/ui/SectionTitle"
import { useConfirm } from "../components/ui/ConfirmModal"
import { TYPE_LABEL } from "./AddAssetModal"

const fmt = formatNumber

interface HistoryEntry {
  date: string
  label: string
  value: number
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "7px 0",
        borderBottom: "1px solid var(--hair-3)",
      }}
    >
      <span style={{ fontSize: 12, color: "var(--ink-4)", flex: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{value}</span>
    </div>
  )
}

function HistoryRow({
  h,
  next,
  symbol,
}: {
  h: HistoryEntry
  next: HistoryEntry | undefined
  symbol: string
}) {
  const delta = next ? h.value - next.value : null
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "6px 0",
        borderBottom: "1px solid var(--hair-3)",
        gap: 8,
      }}
    >
      <span style={{ fontSize: 11, color: "var(--ink-4)", width: 34, flexShrink: 0 }}>
        {h.date}
      </span>
      <span style={{ fontSize: 12, color: "var(--ink-3)", flex: 1 }}>{h.label}</span>
      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)" }}>
        {symbol}
        {fmt(h.value)}
      </span>
      {delta !== null ? (
        <span
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 11,
            width: 60,
            textAlign: "right",
            color: delta >= 0 ? "var(--accent)" : "var(--red)",
          }}
        >
          {delta >= 0 ? "▲" : "▼"} {fmt(Math.abs(delta))}
        </span>
      ) : (
        <span style={{ width: 60 }} />
      )}
    </div>
  )
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: { value: number; payload: { date: string } }[]
}) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--hair-2)",
        borderRadius: 6,
        padding: "5px 10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 10, color: "var(--ink-4)", marginBottom: 2 }}>
        {payload[0].payload.date}
      </div>
      <div style={{ fontSize: 12, fontFamily: "IBM Plex Mono, monospace", color: "var(--ink)" }}>
        {fmt(payload[0].value)}
      </div>
    </div>
  )
}

const CURRENCY_SYMBOL: Record<string, string> = { CNY: "¥", USD: "$", HKD: "HK$", EUR: "€" }
const PREVIEW_COUNT = 3

interface Props {
  asset: AssetSnapshotSummary
  onBack: () => void
  onEdit: (asset: AssetSnapshotSummary, mode: "balance" | "account") => void
  onDelete: (assetItemId: AssetSnapshotSummary["assetItemId"]) => void | Promise<void>
}

export function AssetDetailPanel({ asset, onBack, onEdit, onDelete }: Props) {
  const confirm = useConfirm()
  const [showHistory, setShowHistory] = useState(false)
  const historyQuery = useQuery(
    trpc.assets.snapshots.queryOptions({ assetItemId: asset.assetItemId, latestOnly: false }),
  )
  usePagePerf("asset-detail", [{ name: "assets.snapshots.assetHistory", query: historyQuery }], {
    assetItemId: asset.assetItemId,
    accountName: asset.accountName,
  })
  const history = useMemo<HistoryEntry[]>(() => {
    const rows = historyQuery.data?.length ? historyQuery.data : [asset]
    return [...rows]
      .sort((a, b) => a.snapshotAt.localeCompare(b.snapshotAt))
      .map((snapshot, index, list) => ({
        date: snapshot.snapshotAt.slice(5, 10),
        label: index === list.length - 1 ? "当前" : "手动更新",
        value: Math.round(Math.abs(Number(snapshot.valueNumber || 0))),
      }))
  }, [asset, historyQuery.data])

  const currentValue = Math.abs(Number(asset.valueNumber))
  const isLiability = asset.assetType === "liability"
  const prevEntry = history.length >= 2 ? history[history.length - 2] : null
  const lastChange = prevEntry ? history[history.length - 1].value - prevEntry.value : 0
  const symbol = CURRENCY_SYMBOL[asset.valueCurrency] ?? asset.valueCurrency

  const chartData = history.map((h) => ({ date: h.date, value: h.value }))
  const tableRows = [...history].reverse()
  const previewRows = tableRows.slice(0, PREVIEW_COUNT)
  const nameParts = asset.accountName.split(/\s*·\s*/)
  const bankName = nameParts.length > 1 ? nameParts[0] : null

  return (
    <div style={{ padding: "20px 24px 112px" }}>
      {/* Back + kicker */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 10 }}>
        <Button
          isIconOnly
          size="sm"
          variant="ghost"
          onPress={onBack}
          style={{ width: 24, height: 24, minWidth: 24, borderRadius: 5, marginLeft: -4 }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M9 2L4 7L9 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <Kicker>
          <span style={{ color: "var(--accent)", marginRight: 4 }}>●</span>
          {TYPE_LABEL[asset.assetType]} · 随时可用
        </Kicker>
      </div>

      {/* Title + value */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", lineHeight: 1.2 }}>
          {asset.accountName}
        </div>
        <div
          style={{
            fontFamily: "IBM Plex Mono, monospace",
            fontSize: 24,
            fontWeight: 700,
            color: isLiability ? "var(--red)" : "var(--ink)",
            whiteSpace: "nowrap",
          }}
        >
          {symbol}
          {fmt(currentValue)}
        </div>
      </div>
      <Dim style={{ fontSize: 11, marginTop: 5 }}>
        上次更新 {asset.snapshotAt.slice(5, 10)} · 手动更新
      </Dim>

      <div style={{ margin: "14px 0 12px", borderTop: "1px solid var(--hair-2)" }} />

      {/* Change since last */}
      {prevEntry && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <Dim style={{ fontSize: 11 }}>较上次更新 {prevEntry.date}</Dim>
          <span
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 15,
              fontWeight: 600,
              color: lastChange >= 0 ? "var(--accent)" : "var(--red)",
            }}
          >
            {lastChange >= 0 ? "+" : "−"}
            {symbol}
            {fmt(Math.abs(lastChange))}
          </span>
        </div>
      )}

      {/* Chart header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 6,
        }}
      >
        <SectionTitle>余额变化</SectionTitle>
        <Dim style={{ fontSize: 10.5 }}>历次更新 · 共{history.length}次</Dim>
      </div>

      {/* Area chart */}
      <div style={{ outline: "none" }}>
        <ResponsiveContainer width="100%" height={100}>
          <AreaChart
            data={chartData}
            margin={{ top: 4, right: 2, bottom: 0, left: 2 }}
            style={{ outline: "none" }}
            tabIndex={-1}
          >
            <defs>
              <linearGradient id={`fill-${asset.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.18} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: "var(--ink-4)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: "var(--hair-2)", strokeWidth: 1 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={1.5}
              fill={`url(#fill-${asset.id})`}
              dot={false}
              activeDot={{ r: 4, fill: "var(--accent)", strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* History table — preview rows */}
      <div style={{ marginTop: 4, marginBottom: 14 }}>
        {previewRows.map((h, i) => (
          <HistoryRow key={i} h={h} next={tableRows[i + 1]} symbol={symbol} />
        ))}
        {tableRows.length > PREVIEW_COUNT && (
          <div
            onClick={() => setShowHistory(true)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 0",
              cursor: "pointer",
              fontSize: 12,
              color: "var(--ink-4)",
              borderBottom: "1px solid var(--hair-3)",
            }}
          >
            显示更多 · 共{tableRows.length}条
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: 4 }}>
              <path
                d="M3 5L6 8L9 5"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div style={{ borderTop: "1px solid var(--hair-2)", marginBottom: 12 }} />

      {/* Account info */}
      <div style={{ marginBottom: 4 }}>
        <SectionTitle>账户信息</SectionTitle>
      </div>
      {bankName && <InfoRow label="开户行 / 机构" value={bankName} />}
      <InfoRow label="账户类型" value={TYPE_LABEL[asset.assetType]} />
      <InfoRow label="币种" value={`${asset.valueCurrency} · ${symbol}`} />
      {asset.note && <InfoRow label="备注" value={asset.note} />}

      <Dim style={{ fontSize: 11, marginTop: 12, lineHeight: 1.6 }}>
        余额由你手动更新，流水仅作参考核对，不强制对账。
      </Dim>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginTop: 20, alignItems: "center" }}>
        <Button
          size="sm"
          variant="primary"
          style={{ borderRadius: 5 }}
          onPress={() => onEdit(asset, "balance")}
        >
          更新余额
        </Button>
        <Button
          size="sm"
          variant="outline"
          style={{ borderRadius: 5 }}
          onPress={() => onEdit(asset, "account")}
        >
          编辑账户
        </Button>
        <div style={{ flex: 1 }} />
        <Button
          size="sm"
          variant="danger-soft"
          style={{ borderRadius: 5 }}
          onPress={() =>
            confirm({
              title: "删除账户",
              description: `删除「${asset.accountName}」后，该账户会从资产列表中移除。确定继续？`,
              confirmText: "删除",
              danger: true,
              onConfirm: () => onDelete(asset.assetItemId),
            })
          }
        >
          删除账户
        </Button>
      </div>

      {/* History drawer */}
      <Drawer.Backdrop
        isOpen={showHistory}
        onOpenChange={(v) => {
          if (!v) setShowHistory(false)
        }}
      >
        <Drawer.Content placement="right">
          <Drawer.Dialog>
            <Drawer.CloseTrigger />
            <Drawer.Header>
              <Drawer.Heading style={{ fontSize: 14 }}>
                {asset.accountName} · 余额历史
              </Drawer.Heading>
              <Dim style={{ fontSize: 11, marginTop: 2 }}>共{tableRows.length}条记录</Dim>
            </Drawer.Header>
            <Drawer.Body>
              <div>
                {tableRows.map((h, i) => (
                  <HistoryRow key={i} h={h} next={tableRows[i + 1]} symbol={symbol} />
                ))}
              </div>
            </Drawer.Body>
          </Drawer.Dialog>
        </Drawer.Content>
      </Drawer.Backdrop>
    </div>
  )
}
