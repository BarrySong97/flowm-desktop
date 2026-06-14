/**
 * @purpose Render and manage imported cashflow imports page workflow.
 * @role    Renderer feature surface for statement lines and cashflow details.
 * @deps    React, tRPC import/cashflow queries, and table/detail UI.
 * @gotcha  Imports describe past cashflow and must not update asset balances automatically.
 */

import { useRef, useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { CashflowEventSummary } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { CATEGORY_COLORS, SOURCE_BADGES } from "@/lib/domainDisplay"
import { formatNumber } from "@/lib/format"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Dock } from "../components/layout/Dock"
import { TxDetailPanel, type Tx } from "./TxDetailPanel"
import { AddTxModal, type TxForm } from "./AddTxModal"
import { ColorDot } from "../components/ui/ColorDot"
import { Dim } from "../components/ui/Dim"
import { DailyBars } from "../components/charts/DailyBars"

const fmt = formatNumber

function SourceBadge({ source }: { source: string }) {
  const s = SOURCE_BADGES[source]
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {s && (
        <span style={{
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 18, height: 18, borderRadius: 4, flexShrink: 0,
          background: s.bg, color: "white", fontSize: 9.5, fontWeight: 700,
        }}>{s.char}</span>
      )}
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{source}</span>
    </div>
  )
}

function DonutChart({ segments, size = 140, thick = 28 }: {
  segments: { name: string; amt: number; color: string }[]
  size?: number; thick?: number
}) {
  type Seg = { name: string; amt: number; color: string; frac: number; d: string }
  const [tooltip, setTooltip] = useState<{ x: number; y: number; seg: Seg } | null>(null)
  const total = segments.reduce((s, x) => s + x.amt, 0)
  if (total === 0) return null
  const r = (size - thick) / 2
  const cx = size / 2, cy = size / 2
  let angle = -Math.PI / 2
  const paths = segments.map((seg) => {
    const frac = seg.amt / total
    const start = angle
    angle += frac * 2 * Math.PI
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(angle), y2 = cy + r * Math.sin(angle)
    const large = frac > 0.5 ? 1 : 0
    return { ...seg, frac: frac, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` }
  })
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}
        onMouseLeave={() => setTooltip(null)}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color}
            style={{ cursor: "pointer", transition: "opacity 0.1s" }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget.closest("svg")!).getBoundingClientRect()
              setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, seg: p })
            }}
            onMouseMove={(e) => {
              const rect = (e.currentTarget.closest("svg")!).getBoundingClientRect()
              setTooltip((t) => t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null)
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - thick / 2} fill="white" style={{ pointerEvents: "none" }} />
      </svg>
      {tooltip && (
        <div style={{
          position: "absolute",
          left: tooltip.x + 10, top: tooltip.y - 10,
          background: "white", border: "1px solid var(--hair-2)",
          borderRadius: 7, padding: "6px 10px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: tooltip.seg.color, display: "inline-block", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>{tooltip.seg.name}</span>
          </div>
          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>
            ¥{fmt(tooltip.seg.amt)}
          </div>
          <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 2 }}>
            {Math.round(tooltip.seg.frac * 100)}% 占比
          </div>
        </div>
      )}
    </div>
  )
}

const colHelper = createColumnHelper<Tx>()
const COLUMNS = [
  colHelper.accessor("date", {
    header: "日期", size: 62,
    cell: (c) => <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--ink-4)" }}>{c.getValue().slice(5)}</span>,
  }),
  colHelper.accessor("counterparty", {
    header: "项目",
    cell: (c) => <span style={{ color: "var(--ink)", fontWeight: 450 }}>{c.getValue()}</span>,
  }),
  colHelper.accessor("categoryName", {
    header: "类别", size: 80,
    cell: (c) => (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "var(--ink-3)" }}>
        <ColorDot color={CATEGORY_COLORS[c.getValue()] ?? CATEGORY_COLORS["其他"]} size={7} />
        {c.getValue()}
      </span>
    ),
  }),
  colHelper.accessor("tag", {
    header: "标签", size: 72,
    cell: (c) => <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{c.getValue() ? `#${c.getValue()}` : "—"}</span>,
  }),
  colHelper.accessor("source", {
    header: "来源", size: 108,
    cell: (c) => <SourceBadge source={c.getValue()} />,
  }),
  colHelper.accessor("amount", {
    header: "金额", size: 96,
    cell: (c) => {
      const row = c.row.original
      const isIncome = row.flowKind === "income"
      const isTransfer = row.flowKind === "transfer"
      return (
        <span style={{
          fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 500,
          color: isIncome ? "var(--accent)" : isTransfer ? "var(--ink-3)" : "var(--red)",
        }}>
          {isIncome ? "+" : isTransfer ? "" : "−"}{fmt(c.getValue(), 1)}
        </span>
      )
    },
  }),
]

function numericId(value: CashflowEventSummary["id"], fallback: number): number {
  if (typeof value === "number") return value
  let seed = fallback + 1
  for (let i = 0; i < value.length; i++) {
    seed = (seed * 31 + value.charCodeAt(i)) & 0x7fffffff
  }
  return seed || fallback + 1
}

function toTx(event: CashflowEventSummary, index: number): Tx {
  return {
    id: numericId(event.id, index),
    rawId: String(event.id),
    date: event.date,
    occurredAt: event.occurredAt ?? null,
    counterparty: event.counterparty ?? event.title ?? "未命名流水",
    flowKind: event.flowKind,
    amount: Math.abs(Number(event.amount) || 0),
    categoryName: event.categoryName ?? event.flowKind,
    tag: event.tags[0]?.name,
    source: event.sourceName ?? event.source ?? "手动",
    title: event.title ?? null,
    description: event.description ?? null,
    userNote: event.userNote ?? null,
    statementLineId: event.statementLineId ?? null,
    createdAt: event.createdAt,
  }
}

export function ImportsPage() {
  const queryClient = useQueryClient()
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [showAddTx, setShowAddTx] = useState(false)
  const refDate = new Date()
  const thisMonthPrefix = `${refDate.getFullYear()}-${String(refDate.getMonth() + 1).padStart(2, "0")}`
  const cashflowQuery = useQuery(trpc.cashflow.list.queryOptions(
    { status: "active", includeInAnalytics: true, flowKind: ["income", "expense"], limit: 500 },
  ))
  const statementLinesQuery = useQuery(trpc.imports.statementLines.queryOptions({ limit: 500 }))
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  usePagePerf("imports", [
    { name: "cashflow.list", query: cashflowQuery },
    { name: "imports.statementLines", query: statementLinesQuery },
    { name: "reference.categories", query: categoriesQuery },
  ])
  const createCashflow = useMutation(trpc.cashflow.create.mutationOptions({
    onSuccess: async () => {
      await queryClient.invalidateQueries(trpc.cashflow.list.queryFilter())
    },
  }))

  const txs = useMemo(() => (cashflowQuery.data ?? []).map(toTx), [cashflowQuery.data])
  const thisMonth = txs.filter((t) => t.date.startsWith(thisMonthPrefix))
  const monthOut = thisMonth.filter((t) => t.flowKind === "expense").reduce((s, t) => s + t.amount, 0)
  const monthIn  = thisMonth.filter((t) => t.flowKind === "income").reduce((s, t) => s + t.amount, 0)
  const monthNet = monthIn - monthOut

  const dailyBars = useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    for (const t of txs) {
      if (t.flowKind !== "expense") continue
      const daysAgo = Math.round((refDate.getTime() - new Date(t.date).getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 30) bars[29 - daysAgo] += t.amount
    }
    return bars
  }, [txs])

  const catSpend = useMemo(() => {
    const map = new Map<string, number>()
    for (const t of txs) {
      if (t.flowKind !== "expense") continue
      const daysAgo = Math.round((refDate.getTime() - new Date(t.date).getTime()) / 86400000)
      if (daysAgo < 0 || daysAgo >= 30) continue
      map.set(t.categoryName, (map.get(t.categoryName) ?? 0) + t.amount)
    }
    return [...map.entries()]
      .map(([name, amt]) => ({ name, amt, color: CATEGORY_COLORS[name] ?? CATEGORY_COLORS["其他"] }))
      .sort((a, b) => b.amt - a.amt)
  }, [txs])

  const catTotal30 = catSpend.reduce((s, c) => s + c.amt, 0)
  const sorted = useMemo(() => [...txs].sort((a, b) => b.date.localeCompare(a.date)), [txs])
  const activeDays = dailyBars.filter((v) => v > 0).length
  const expenseCount = sorted.filter((t) => t.flowKind === "expense").length

  const scrollRef = useRef<HTMLDivElement>(null)
  const table = useReactTable({ data: sorted, columns: COLUMNS, getCoreRowModel: getCoreRowModel() })
  const rows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 38,
    overscan: 8,
  })

  function handleAddTx(form: TxForm) {
    createCashflow.mutate({
      eventDate: form.date,
      title: form.counterparty,
      counterparty: form.counterparty,
      amount: Math.abs(Number(form.amount) || 0).toFixed(2),
      direction: form.flowKind === "income" ? "in" : "out",
      flowKind: form.flowKind,
      categoryId: form.categoryId,
      sourceKind: "manual",
      sourceName: form.source.trim() || null,
      includeInAnalytics: true,
      classificationSource: "manual",
    })
    setShowAddTx(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>

      {/* Header — fixed */}
      <div style={{ flexShrink: 0, padding: "28px 32px 20px" }}>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48, marginBottom: 20 }}>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>本月消费</Dim>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 36, fontWeight: 700, color: "var(--red)", letterSpacing: "-0.02em" }}>
              −{fmt(monthOut)}
            </div>
          </div>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>本月收入</Dim>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 36, fontWeight: 700, color: "var(--accent)", letterSpacing: "-0.02em" }}>
              +{fmt(monthIn)}
            </div>
          </div>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>净流入</Dim>
            <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 36, fontWeight: 700, color: monthNet >= 0 ? "var(--ink)" : "var(--red)", letterSpacing: "-0.02em" }}>
              {monthNet >= 0 ? "+" : "−"}{fmt(Math.abs(monthNet))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", paddingBottom: 6 }}>
            <Button size="sm" variant="primary" style={{ borderRadius: 5 }} onPress={() => setShowAddTx(true)}>
              ＋ 记一笔
            </Button>
          </div>
        </div>

        {/* Daily bars */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>近 30 天每日消费</span>
            <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--ink-4)" }}>
              {expenseCount} 笔 · 导入证据 {statementLinesQuery.data?.length ?? 0} 行 · 日均 ¥{fmt(activeDays > 0 ? Math.round(catTotal30 / activeDays) : 0)}
            </span>
          </div>
          <DailyBars data={dailyBars} todayIndex={29} height={56} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <Dim style={{ fontSize: 9.5 }}>30 天前</Dim>
            <Dim style={{ fontSize: 9.5, color: "var(--accent)", fontWeight: 600 }}>今天</Dim>
          </div>
        </div>
      </div>

      {/* Content — two independent scroll columns */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", overflow: "hidden" }}>

        {/* Left: transaction table — TanStack Virtual */}
        <div
          ref={scrollRef}
          className="flowm-scroller"
          style={{ flex: "0 0 68%", minWidth: 0, height: "100%", overflowY: "auto" }}
        >
          <table style={{ width: "calc(100% - 64px)", margin: "0 32px", borderCollapse: "collapse", fontSize: 12, tableLayout: "fixed" }}>
            <colgroup>
              {table.getAllColumns().map((col) => (
                <col key={col.id} style={{ width: col.getSize() }} />
              ))}
            </colgroup>
            <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "white" }}>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ borderBottom: "1px solid var(--hair-2)" }}>
                  {hg.headers.map((h) => (
                    <th key={h.id} style={{
                      width: h.column.getSize(), padding: "4px 8px 8px",
                      textAlign: h.id === "amount" ? "right" : "left",
                      fontSize: 11, fontWeight: 500, color: "var(--ink-4)",
                      whiteSpace: "nowrap", background: "white",
                    }}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {(() => {
                const items = virtualizer.getVirtualItems()
                const paddingTop = items.length > 0 ? items[0].start : 0
                const paddingBottom = items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0
                return (
                  <>
                    {paddingTop > 0 && <tr><td colSpan={6} style={{ height: paddingTop, padding: 0, border: "none" }} /></tr>}
                    {items.map((vRow) => {
                      const row = rows[vRow.index]
                      const tx = row.original
                      const isHovered = hoveredId === tx.id
                      const isSelected = selectedTx?.id === tx.id
                      return (
                        <tr
                          key={row.id}
                          onClick={() => setSelectedTx(tx)}
                          onMouseEnter={() => setHoveredId(tx.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          style={{
                            borderBottom: "1px solid var(--hair-3)",
                            background: isSelected ? "var(--surface-2)" : isHovered ? "var(--surface-3)" : "transparent",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} style={{
                              padding: "9px 8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              textAlign: cell.column.id === "amount" ? "right" : "left",
                            }}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    {paddingBottom > 0 && <tr><td colSpan={6} style={{ height: paddingBottom, padding: 0, border: "none" }} /></tr>}
                  </>
                )
              })()}
            </tbody>
          </table>
          <div style={{ padding: "16px 32px 112px" }}>
            {rows.length === 0 && (
              <Dim style={{ fontSize: 12, lineHeight: 1.7, display: "block", marginBottom: 12 }}>
                暂无流水。导入账单或手动记一笔后，这里会显示真实现金流。
              </Dim>
            )}
            <Dim style={{ fontSize: 11, lineHeight: 1.6 }}>
              流水只作参考，不强迫你处理每一笔。来源见左表。
            </Dim>
          </div>
        </div>


        {/* Right: detail panel or donut */}
        <ScrollArea className="h-full" style={{ flex: 1, minWidth: 0 }}>
          {selectedTx ? (
            <TxDetailPanel
              tx={selectedTx}
              allTxs={sorted}
              onBack={() => setSelectedTx(null)}
            />
          ) : (
            <div style={{ padding: "20px 24px 112px" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 16 }}>
                消费类别 · 近 30 天
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ position: "relative", width: 240, height: 240 }}>
                  <DonutChart segments={catSpend} size={240} thick={42} />
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center", pointerEvents: "none" }}>
                    <div>
                      <Dim style={{ fontSize: 9.5 }}>本月消费</Dim>
                      <div style={{ fontFamily: "IBM Plex Mono, monospace", fontWeight: 700, fontSize: 15, marginTop: 3 }}>
                        ¥{catTotal30 >= 10000 ? `${(catTotal30 / 10000).toFixed(1)}万` : fmt(catTotal30)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {catSpend.map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ColorDot color={c.color} size={7} />
                    <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>{c.name}</span>
                    <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11.5, color: "var(--ink-3)", paddingRight: 4 }}>
                      ¥{fmt(c.amt)}
                    </span>
                    <span style={{ fontSize: 11, color: "var(--ink-4)", width: 26, textAlign: "right" }}>
                      {catTotal30 > 0 ? Math.round((c.amt / catTotal30) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>

      </div>
      <Dock />
      <AddTxModal
        open={showAddTx}
        categories={categoriesQuery.data ?? []}
        onClose={() => setShowAddTx(false)}
        onSave={handleAddTx}
      />
    </div>
  )
}
