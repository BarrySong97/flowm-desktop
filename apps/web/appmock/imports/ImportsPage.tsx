/**
 * @purpose Render and manage imported cashflow imports page workflow.
 * @role    Renderer feature surface for statement lines and cashflow details.
 * @deps    React, tRPC import/cashflow queries, and table/detail UI.
 * @gotcha  Imports describe past cashflow and must not update asset balances automatically.
 */

import "./imports.css"
import { useEffect, useRef, useMemo, useState } from "react"
import { Button, Input, ListBox, Select } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Link } from "@mock/_shim/router"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import type { CashflowEventSummary, CategorySummary } from "@flowm/api"
import { trpc } from "@mock/lib/trpc"
// The mock tRPC proxy is a read-only canned-data registry: its mutationOptions / queryFilter
// helpers aren't typed for useMutation. The mutation + invalidation handlers below are never
// reached in the static mock (the add/edit modal and detail panel that fire them are stubbed to
// null), so route those calls through an `any` view to keep the source verbatim.
const trpcMut = trpc as any
import { usePagePerf } from "@mock/lib/debug/perf"
import { CATEGORY_COLORS, SOURCE_BADGES } from "@mock/lib/domainDisplay"
import { addDays, dateKey, monthStart } from "@mock/lib/dates"
import { useMoney } from "@mock/lib/useMoney"
import { ScrollArea } from "../components/ui/ScrollArea"
import { TxDetailPanel, type Tx } from "./TxDetailPanel"
import { AddTxModal, emptyTxForm, type TxForm } from "./AddTxModal"
import { ColorDot } from "../components/ui/ColorDot"
import { Dim } from "../components/ui/Dim"
import { DailyBars } from "../components/charts/DailyBars"
import { FormField } from "../components/ui/FormField"

const TIME_FILTER_KEYS = ["this_month", "last_month", "last_30", "last_90", "year", "all"] as const
const KIND_FILTER_KEYS = ["all", "expense", "income"] as const
type TimeFilterKey = (typeof TIME_FILTER_KEYS)[number]
type KindFilterKey = (typeof KIND_FILTER_KEYS)[number]
interface TxFilterForm {
  timeFilter: TimeFilterKey
  sourceFilter: string
  categoryFilter: string
  kindFilter: KindFilterKey
  keyword: string
}

const DEFAULT_FILTERS: TxFilterForm = {
  timeFilter: "this_month",
  sourceFilter: "all",
  categoryFilter: "all",
  kindFilter: "all",
  keyword: "",
}

const TIME_FILTERS: Array<{ key: TimeFilterKey; label: string }> = [
  { key: "this_month", label: "本月" },
  { key: "last_month", label: "上月" },
  { key: "last_30", label: "最近 30 天" },
  { key: "last_90", label: "最近 90 天" },
  { key: "year", label: "今年" },
  { key: "all", label: "全部" },
]

const KIND_FILTERS: Array<{ key: KindFilterKey; label: string }> = [
  { key: "all", label: "全部类型" },
  { key: "expense", label: "支出" },
  { key: "income", label: "收入" },
]

const FILTER_LABEL_CLASS = "mb-1 block text-[10.5px] leading-[1.2] text-[var(--ink-3)]"

function addMonths(date: Date, months: number): Date {
  const next = new Date(date)
  next.setMonth(next.getMonth() + months)
  return next
}

function monthEnd(date: Date): string {
  return dateKey(new Date(date.getFullYear(), date.getMonth() + 1, 0))
}

function timeFilterBounds(key: TimeFilterKey, now = new Date()): { from?: string; to?: string } {
  if (key === "this_month") return { from: monthStart(now), to: dateKey(now) }
  if (key === "last_month") {
    const previous = addMonths(now, -1)
    return { from: monthStart(previous), to: monthEnd(previous) }
  }
  if (key === "last_30") return { from: dateKey(addDays(now, -29)), to: dateKey(now) }
  if (key === "last_90") return { from: dateKey(addDays(now, -89)), to: dateKey(now) }
  if (key === "year") return { from: `${now.getFullYear()}-01-01`, to: dateKey(now) }
  return {}
}

function FilterSelectField({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string
  value: string
  options: Array<{ key: string; label: string }>
  onChange: (value: string) => void
  className: string
}) {
  return (
    <div className={className}>
      <FormField label={label} labelClassName={FILTER_LABEL_CLASS}>
        <Select
          variant="secondary"
          selectedKey={value}
          onSelectionChange={(key) => {
            if (key == null) return
            const next = String(key)
            if (next !== value) onChange(next)
          }}
        >
          <Select.Trigger className="h-[30px] min-h-[30px] px-2 text-[11.5px]">
            <Select.Value className="text-[11.5px]" />
            <Select.Indicator className="size-3" />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {options.map((option) => (
                <ListBox.Item key={option.key} id={option.key} textValue={option.label}>
                  {option.label}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      </FormField>
    </div>
  )
}

function SourceBadge({ source }: { source: string }) {
  const s = SOURCE_BADGES[source]
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {s && (
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 18,
            height: 18,
            borderRadius: 4,
            flexShrink: 0,
            background: s.bg,
            color: "white",
            fontSize: 9.5,
            fontWeight: 700,
          }}
        >
          {s.char}
        </span>
      )}
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>{source}</span>
    </div>
  )
}

function DonutChart({
  segments,
  size = 140,
  thick = 28,
}: {
  segments: { name: string; amt: number; color: string }[]
  size?: number
  thick?: number
}) {
  type Seg = { name: string; amt: number; color: string; frac: number; d: string }
  const fmt = useMoney()
  const [tooltip, setTooltip] = useState<{ x: number; y: number; seg: Seg } | null>(null)
  const total = segments.reduce((s, x) => s + x.amt, 0)
  if (total === 0) return null
  const r = (size - thick) / 2
  const cx = size / 2,
    cy = size / 2
  let angle = -Math.PI / 2
  const paths = segments.map((seg) => {
    const frac = seg.amt / total
    const start = angle
    angle += frac * 2 * Math.PI
    const x1 = cx + r * Math.cos(start),
      y1 = cy + r * Math.sin(start)
    const x2 = cx + r * Math.cos(angle),
      y2 = cy + r * Math.sin(angle)
    const large = frac > 0.5 ? 1 : 0
    return {
      ...seg,
      frac: frac,
      d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`,
    }
  })
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block" }}
        onMouseLeave={() => setTooltip(null)}
      >
        {paths.map((p, i) => (
          <path
            key={i}
            d={p.d}
            fill={p.color}
            style={{ cursor: "pointer", transition: "opacity 0.1s" }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.closest("svg")!.getBoundingClientRect()
              setTooltip({ x: e.clientX - rect.left, y: e.clientY - rect.top, seg: p })
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.closest("svg")!.getBoundingClientRect()
              setTooltip((t) =>
                t ? { ...t, x: e.clientX - rect.left, y: e.clientY - rect.top } : null,
              )
            }}
          />
        ))}
        <circle cx={cx} cy={cy} r={r - thick / 2} fill="white" style={{ pointerEvents: "none" }} />
      </svg>
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: tooltip.x + 10,
            top: tooltip.y - 10,
            background: "white",
            border: "1px solid var(--hair-2)",
            borderRadius: 7,
            padding: "6px 10px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: tooltip.seg.color,
                display: "inline-block",
                flexShrink: 0,
              }}
            />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
              {tooltip.seg.name}
            </span>
          </div>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 13,
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
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
// Amount cell is its own component so it can mask via the useMoney hook (COLUMNS is module-level).
function AmountCell({ value, flowKind }: { value: number; flowKind: string }) {
  const fmt = useMoney()
  const isIncome = flowKind === "income"
  const isTransfer = flowKind === "transfer"
  return (
    <span
      style={{
        fontFamily: "IBM Plex Mono, monospace",
        fontSize: 12,
        fontWeight: 500,
        color: isIncome ? "var(--accent)" : isTransfer ? "var(--ink-3)" : "var(--red)",
      }}
    >
      {isIncome ? "+" : isTransfer ? "" : "−"}
      {fmt(value, 1)}
    </span>
  )
}

const COLUMNS = [
  colHelper.accessor("date", {
    header: "日期",
    size: 62,
    cell: (c) => (
      <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 11, color: "var(--ink-4)" }}>
        {c.getValue().slice(5)}
      </span>
    ),
  }),
  colHelper.accessor("counterparty", {
    header: "项目",
    cell: (c) => <span style={{ color: "var(--ink)", fontWeight: 450 }}>{c.getValue()}</span>,
  }),
  colHelper.accessor("categoryName", {
    header: "类别",
    size: 80,
    cell: (c) => (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          fontSize: 11.5,
          color: "var(--ink-3)",
        }}
      >
        <ColorDot color={CATEGORY_COLORS[c.getValue()] ?? CATEGORY_COLORS["其他"]} size={7} />
        {c.getValue()}
      </span>
    ),
  }),
  colHelper.accessor("tag", {
    header: "标签",
    size: 72,
    cell: (c) => (
      <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
        {c.getValue() ? `#${c.getValue()}` : "—"}
      </span>
    ),
  }),
  colHelper.accessor("source", {
    header: "来源",
    size: 108,
    cell: (c) => <SourceBadge source={c.getValue()} />,
  }),
  colHelper.accessor("amount", {
    header: "金额",
    size: 96,
    cell: (c) => <AmountCell value={c.getValue()} flowKind={c.row.original.flowKind} />,
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
    categoryId: event.categoryId ?? null,
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
  const fmt = useMoney()
  const queryClient = useQueryClient()
  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [showAddTx, setShowAddTx] = useState(false)
  const [editingTx, setEditingTx] = useState<Tx | null>(null)
  // Mock: filters are plain local state (real page syncs them to the URL via nuqs + react-hook-form).
  const [filters, setFilters] = useState<TxFilterForm>(DEFAULT_FILTERS)
  const timeFilter = filters.timeFilter
  const sourceFilter = filters.sourceFilter
  const categoryFilter = filters.categoryFilter
  const kindFilter = filters.kindFilter
  const keyword = filters.keyword
  const normalizedKeyword = keyword.trim()
  const refDate = useMemo(() => new Date(), [])
  function updateFilters(next: Partial<TxFilterForm>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const cashflowQuery = useQuery(
    trpc.cashflow.list.queryOptions({
      status: "active",
      includeInAnalytics: true,
      flowKind: ["income", "expense"],
      limit: 500,
    }),
  )
  const statementLinesQuery = useQuery(trpc.imports.statementLines.queryOptions({ limit: 500 }))
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  usePagePerf("imports", [
    { name: "cashflow.list", query: cashflowQuery },
    { name: "imports.statementLines", query: statementLinesQuery },
    { name: "reference.categories", query: categoriesQuery },
  ])
  const createCashflow = useMutation(
    trpcMut.cashflow.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpcMut.cashflow.list.queryFilter())
      },
    }),
  ) as any
  const deleteCashflow = useMutation(trpcMut.cashflow.delete.mutationOptions()) as any
  const updateCashflow = useMutation(trpcMut.cashflow.update.mutationOptions()) as any

  async function removeTx(rawId: string) {
    await deleteCashflow.mutateAsync({ id: rawId })
    await queryClient.invalidateQueries(trpcMut.cashflow.list.queryFilter())
    await queryClient.invalidateQueries(trpcMut.cashflow.summary.queryFilter())
    await queryClient.invalidateQueries(trpcMut.cashflow.breakdown.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
  }

  // The mock proxy types query data loosely; pin it to the real contract shapes so the
  // verbatim downstream logic keeps its expected element types.
  const cashflowData = (cashflowQuery.data ?? []) as CashflowEventSummary[]
  const categoriesData = (categoriesQuery.data ?? []) as CategorySummary[]
  const txs = useMemo(() => cashflowData.map(toTx), [cashflowQuery.data])
  const analysisKind: "expense" | "income" = kindFilter === "income" ? "income" : "expense"
  const analysisLabel = analysisKind === "income" ? "收入" : "消费"
  const analysisColor = analysisKind === "income" ? "var(--accent)" : "var(--red)"
  const categoryById = useMemo(
    () => new Map(categoriesData.map((category) => [String(category.id), category])),
    [categoriesQuery.data],
  )
  const sourceOptions = useMemo(
    () => [...new Set(txs.map((tx) => tx.source))].sort((a, b) => a.localeCompare(b)),
    [txs],
  )
  const sourceFilterOptions = useMemo(
    () => [
      { key: "all", label: "全部来源" },
      ...sourceOptions.map((source) => ({ key: source, label: source })),
    ],
    [sourceOptions],
  )
  const categoryOptions = useMemo(
    () =>
      categoriesData
        .filter(
          (category) =>
            !category.archived &&
            (category.categoryKind === analysisKind || category.kind === analysisKind),
        )
        .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)),
    [analysisKind, categoriesQuery.data],
  )
  const categoryFilterOptions = useMemo(
    () => [
      { key: "all", label: "全部分类" },
      ...categoryOptions.map((category) => ({ key: String(category.id), label: category.name })),
    ],
    [categoryOptions],
  )
  useEffect(() => {
    if (categoriesQuery.data == null) return
    if (categoryFilter === "all") return
    if (categoryOptions.some((category) => String(category.id) === categoryFilter)) return
    updateFilters({ categoryFilter: "all" })
  }, [categoriesQuery.data, categoryFilter, categoryOptions])
  useEffect(() => {
    if (cashflowQuery.data == null) return
    if (sourceFilter === "all") return
    if (sourceOptions.includes(sourceFilter)) return
    updateFilters({ sourceFilter: "all" })
  }, [cashflowQuery.data, sourceFilter, sourceOptions])
  const filteredTxs = useMemo(() => {
    const bounds = timeFilterBounds(timeFilter, refDate)
    const term = normalizedKeyword.toLowerCase()
    return txs.filter((tx) => {
      if (bounds.from && tx.date < bounds.from) return false
      if (bounds.to && tx.date > bounds.to) return false
      if (sourceFilter !== "all" && tx.source !== sourceFilter) return false
      if (categoryFilter !== "all" && String(tx.categoryId ?? "") !== categoryFilter) return false
      if (kindFilter !== "all" && tx.flowKind !== kindFilter) return false
      if (term) {
        const haystack = [
          tx.counterparty,
          tx.title,
          tx.description,
          tx.userNote,
          tx.categoryName,
          tx.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
        if (!haystack.includes(term)) return false
      }
      return true
    })
  }, [categoryFilter, kindFilter, normalizedKeyword, refDate, sourceFilter, timeFilter, txs])
  const rangeOut = filteredTxs
    .filter((t) => t.flowKind === "expense")
    .reduce((s, t) => s + t.amount, 0)
  const rangeIn = filteredTxs
    .filter((t) => t.flowKind === "income")
    .reduce((s, t) => s + t.amount, 0)
  const rangeNet = rangeIn - rangeOut

  const dailyBars = useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    for (const t of filteredTxs) {
      if (t.flowKind !== analysisKind) continue
      const daysAgo = Math.round((refDate.getTime() - new Date(t.date).getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 30) bars[29 - daysAgo] += t.amount
    }
    return bars
  }, [analysisKind, filteredTxs, refDate])

  const flowBreakdown = useMemo(() => {
    const map = new Map<string, { name: string; amt: number; color: string }>()
    for (const t of filteredTxs) {
      if (t.flowKind !== analysisKind) continue
      const key = t.categoryId == null ? `uncategorized:${analysisKind}` : String(t.categoryId)
      const category = t.categoryId == null ? null : categoryById.get(String(t.categoryId))
      const current = map.get(key)
      map.set(key, {
        name: category?.name ?? t.categoryName,
        amt: (current?.amt ?? 0) + t.amount,
        color:
          category?.color ??
          CATEGORY_COLORS[t.categoryName] ??
          (analysisKind === "income" ? "var(--accent)" : CATEGORY_COLORS["其他"]),
      })
    }
    return [...map.values()].sort((a, b) => b.amt - a.amt)
  }, [analysisKind, categoryById, filteredTxs])

  const analysisTotal = flowBreakdown.reduce((s, c) => s + c.amt, 0)
  const sorted = useMemo(
    () => [...filteredTxs].sort((a, b) => b.date.localeCompare(a.date)),
    [filteredTxs],
  )
  const activeDays = dailyBars.filter((v) => v > 0).length
  const analysisCount = sorted.filter((t) => t.flowKind === analysisKind).length
  const hasFilters =
    timeFilter !== DEFAULT_FILTERS.timeFilter ||
    sourceFilter !== DEFAULT_FILTERS.sourceFilter ||
    categoryFilter !== DEFAULT_FILTERS.categoryFilter ||
    kindFilter !== DEFAULT_FILTERS.kindFilter ||
    normalizedKeyword.length > 0

  function resetFilters() {
    setFilters(DEFAULT_FILTERS)
  }

  const scrollRef = useRef<HTMLDivElement>(null)
  const table = useReactTable({
    data: sorted,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
  })
  const rows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 38,
    overscan: 8,
  })

  async function refreshCashflowViews() {
    await queryClient.invalidateQueries(trpcMut.cashflow.list.queryFilter())
    await queryClient.invalidateQueries(trpcMut.cashflow.summary.queryFilter())
    await queryClient.invalidateQueries(trpcMut.cashflow.breakdown.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
  }

  function txToForm(tx: Tx): TxForm {
    return {
      ...emptyTxForm(),
      flowKind: tx.flowKind === "income" ? "income" : "expense",
      amount: String(tx.amount),
      counterparty: tx.counterparty,
      categoryId:
        (cashflowQuery.data ?? []).find((event) => String(event.id) === tx.rawId)?.categoryId ??
        null,
      source: tx.source,
      date: tx.date,
      note: tx.userNote ?? "",
    }
  }

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
      userNote: form.note.trim() || null,
      includeInAnalytics: true,
      classificationSource: "manual",
    })
    setShowAddTx(false)
  }

  async function handleEditTx(form: TxForm) {
    if (!editingTx) return
    await updateCashflow.mutateAsync({
      id: editingTx.rawId,
      eventDate: form.date,
      title: form.counterparty,
      counterparty: form.counterparty,
      amount: Math.abs(Number(form.amount) || 0).toFixed(2),
      direction: form.flowKind === "income" ? "in" : "out",
      flowKind: form.flowKind,
      categoryId: form.categoryId,
      userNote: form.note.trim() || null,
    })
    await refreshCashflowViews()
    setSelectedTx(null)
    setEditingTx(null)
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Header — fixed */}
      <div style={{ flexShrink: 0, padding: "28px 32px 20px" }}>
        {/* Stats */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 48, marginBottom: 20 }}>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>消费</Dim>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 36,
                fontWeight: 700,
                color: "var(--red)",
                letterSpacing: "-0.02em",
              }}
            >
              −{fmt(rangeOut)}
            </div>
          </div>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>收入</Dim>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 36,
                fontWeight: 700,
                color: "var(--accent)",
                letterSpacing: "-0.02em",
              }}
            >
              +{fmt(rangeIn)}
            </div>
          </div>
          <div>
            <Dim style={{ fontSize: 11, marginBottom: 4 }}>净流入</Dim>
            <div
              style={{
                fontFamily: "IBM Plex Mono, monospace",
                fontSize: 36,
                fontWeight: 700,
                color: rangeNet >= 0 ? "var(--ink)" : "var(--red)",
                letterSpacing: "-0.02em",
              }}
            >
              {rangeNet >= 0 ? "+" : "−"}
              {fmt(Math.abs(rangeNet))}
            </div>
          </div>
          <div style={{ marginLeft: "auto", paddingBottom: 6 }}>
            <Button
              size="sm"
              variant="primary"
              style={{ borderRadius: 5 }}
              onPress={() => setShowAddTx(true)}
            >
              ＋ 记一笔
            </Button>
          </div>
        </div>

        {/* Daily bars */}
        <div>
          <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
              每日{analysisLabel}
            </span>
            <span style={{ marginLeft: "auto", fontSize: 10.5, color: "var(--ink-4)" }}>
              {sorted.length} 笔 · {analysisLabel} {analysisCount} 笔 · 导入证据{" "}
              {statementLinesQuery.data?.length ?? 0} 行 · 日均 ¥
              {fmt(activeDays > 0 ? Math.round(analysisTotal / activeDays) : 0)}
              {" · "}
              <Link
                to="/analysis"
                className="cursor-pointer text-[var(--accent)] hover:opacity-75 transition-opacity"
              >
                查看结余信息 →
              </Link>
            </span>
          </div>
          <DailyBars data={dailyBars} color={analysisColor} todayIndex={29} height={56} />
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
          <div className="sticky top-0 z-[2] border-b border-[var(--hair-3)] bg-white px-8 pb-2.5">
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <FilterSelectField
                label="时间"
                value={timeFilter}
                onChange={(value) => updateFilters({ timeFilter: value as TimeFilterKey })}
                options={TIME_FILTERS}
                className="w-[116px]"
              />
              <FilterSelectField
                label="来源"
                value={sourceFilter}
                onChange={(value) => updateFilters({ sourceFilter: value })}
                options={sourceFilterOptions}
                className="w-[122px]"
              />
              <FilterSelectField
                label="分类"
                value={categoryFilter}
                onChange={(value) => updateFilters({ categoryFilter: value })}
                options={categoryFilterOptions}
                className="w-[122px]"
              />
              <FilterSelectField
                label="类型"
                value={kindFilter}
                onChange={(value) => updateFilters({ kindFilter: value as KindFilterKey })}
                options={KIND_FILTERS}
                className="w-[108px]"
              />
              <div className="w-[190px]">
                <FormField label="搜索" labelClassName={FILTER_LABEL_CLASS}>
                  <Input
                    variant="secondary"
                    className="h-[30px] px-2 text-[11.5px]"
                    placeholder="商户 / 备注"
                    aria-label="搜索商户或备注"
                    value={keyword}
                    onChange={(event) => updateFilters({ keyword: event.target.value })}
                  />
                </FormField>
              </div>
              {hasFilters && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onPress={resetFilters}
                  className="ml-auto mb-px h-[30px] rounded-[5px] px-2.5 text-[11px]"
                >
                  重置
                </Button>
              )}
              <span
                className={`whitespace-nowrap pb-[5px] text-[10.5px] text-[var(--ink-4)] ${
                  hasFilters ? "" : "ml-auto"
                }`}
              >
                共 {sorted.length} 笔 · 支出 ¥{fmt(rangeOut)} · 收入 ¥{fmt(rangeIn)}
              </span>
            </form>
          </div>
          <table
            style={{
              width: "calc(100% - 64px)",
              margin: "0 32px",
              borderCollapse: "collapse",
              fontSize: 12,
              tableLayout: "fixed",
            }}
          >
            <colgroup>
              {table.getAllColumns().map((col) => (
                <col key={col.id} style={{ width: col.getSize() }} />
              ))}
            </colgroup>
            <thead style={{ position: "sticky", top: 65, zIndex: 1, background: "white" }}>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} style={{ borderBottom: "1px solid var(--hair-2)" }}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      style={{
                        width: h.column.getSize(),
                        padding: "4px 8px 8px",
                        textAlign: h.id === "amount" ? "right" : "left",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "var(--ink-4)",
                        whiteSpace: "nowrap",
                        background: "white",
                      }}
                    >
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
                const paddingBottom =
                  items.length > 0 ? virtualizer.getTotalSize() - items[items.length - 1].end : 0
                return (
                  <>
                    {paddingTop > 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ height: paddingTop, padding: 0, border: "none" }}
                        />
                      </tr>
                    )}
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
                            background: isSelected
                              ? "var(--surface-2)"
                              : isHovered
                                ? "var(--surface-3)"
                                : "transparent",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td
                              key={cell.id}
                              style={{
                                padding: "9px 8px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                textAlign: cell.column.id === "amount" ? "right" : "left",
                              }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                    {paddingBottom > 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          style={{ height: paddingBottom, padding: 0, border: "none" }}
                        />
                      </tr>
                    )}
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
              onEdit={(tx) => setEditingTx(tx)}
              onDelete={async (rawId) => {
                await removeTx(rawId)
                setSelectedTx(null)
              }}
            />
          ) : (
            <div style={{ padding: "20px 24px 112px" }}>
              <div
                style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)", marginBottom: 16 }}
              >
                {analysisLabel}类别 · 当前筛选
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                <div style={{ position: "relative", width: 240, height: 240 }}>
                  <DonutChart segments={flowBreakdown} size={240} thick={42} />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "grid",
                      placeItems: "center",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <div>
                      <Dim style={{ fontSize: 9.5 }}>{analysisLabel}</Dim>
                      <div
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontWeight: 700,
                          fontSize: 15,
                          marginTop: 3,
                        }}
                      >
                        ¥
                        {analysisTotal >= 10000
                          ? `${(analysisTotal / 10000).toFixed(1)}万`
                          : fmt(analysisTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {flowBreakdown.map((c) => (
                  <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <ColorDot color={c.color} size={7} />
                    <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>{c.name}</span>
                    <span
                      style={{
                        fontFamily: "IBM Plex Mono, monospace",
                        fontSize: 11.5,
                        color: "var(--ink-3)",
                        paddingRight: 4,
                      }}
                    >
                      ¥{fmt(c.amt)}
                    </span>
                    <span
                      style={{ fontSize: 11, color: "var(--ink-4)", width: 26, textAlign: "right" }}
                    >
                      {analysisTotal > 0 ? Math.round((c.amt / analysisTotal) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
      <AddTxModal
        open={showAddTx}
        categories={categoriesQuery.data ?? []}
        onClose={() => setShowAddTx(false)}
        onSave={handleAddTx}
      />
      <AddTxModal
        open={editingTx != null}
        title="编辑流水"
        subtitle="修改金额、分类、日期和备注"
        categories={categoriesQuery.data ?? []}
        initial={editingTx ? txToForm(editingTx) : undefined}
        onClose={() => setEditingTx(null)}
        onSave={(form) => void handleEditTx(form)}
      />
    </div>
  )
}
