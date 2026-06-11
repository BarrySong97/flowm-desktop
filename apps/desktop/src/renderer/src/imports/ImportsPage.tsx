import { useRef, useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { useReactTable, getCoreRowModel, flexRender, createColumnHelper } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Dock } from "../components/layout/Dock"
import { TxDetailPanel } from "./TxDetailPanel"
import { AddTxModal } from "./AddTxModal"
import { ColorDot } from "../components/ui/ColorDot"
import { Dim } from "../components/ui/Dim"
import { DailyBars } from "../components/charts/DailyBars"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

const CAT_COLOR: Record<string, string> = {
  餐饮: "#e07b3a", 交通: "#4a8fc4", 购物: "#c46a9e",
  订阅: "#7c6ac4", 娱乐: "#d4a017", 居住: "#5bac8e",
  理财: "#2e86ab", 通讯: "#5e9e9f", 收入: "#14794a",
  其他: "#9caca3", 转账: "#6b7d72",
}

const SOURCE_STYLE: Record<string, { bg: string; char: string }> = {
  "支付宝":  { bg: "#1677ff", char: "支" },
  "微信":    { bg: "#07c160", char: "微" },
  "招商银行": { bg: "#c5242a", char: "招" },
  "工商银行": { bg: "#d4071c", char: "工" },
  "建设银行": { bg: "#00549e", char: "建" },
  "中国移动": { bg: "#e60012", char: "移" },
}

interface Tx {
  id: number; date: string; counterparty: string
  flowKind: "income" | "expense" | "transfer"
  amount: number; categoryName: string; tag?: string; source: string
}

const MOCK_TXS: Tx[] = [
  { id: 1,  date: "2026-06-11", counterparty: "美团外卖",         flowKind: "expense",  amount: 45.5,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 2,  date: "2026-06-11", counterparty: "滴滴出行",         flowKind: "expense",  amount: 23.0,    categoryName: "交通", tag: "打车",  source: "微信" },
  { id: 3,  date: "2026-06-10", counterparty: "京东商城",         flowKind: "expense",  amount: 599.0,   categoryName: "购物", tag: "数码",  source: "支付宝" },
  { id: 4,  date: "2026-06-10", counterparty: "上海地铁",         flowKind: "expense",  amount: 12.0,    categoryName: "交通",              source: "支付宝" },
  { id: 5,  date: "2026-06-09", counterparty: "海底捞",           flowKind: "expense",  amount: 312.0,   categoryName: "餐饮", tag: "聚餐",  source: "微信" },
  { id: 6,  date: "2026-06-08", counterparty: "中国移动话费",     flowKind: "expense",  amount: 99.0,    categoryName: "通讯",              source: "支付宝" },
  { id: 7,  date: "2026-06-07", counterparty: "盒马鲜生",         flowKind: "expense",  amount: 218.4,   categoryName: "餐饮", tag: "国货",  source: "支付宝" },
  { id: 8,  date: "2026-06-07", counterparty: "滴滴出行",         flowKind: "expense",  amount: 34.0,    categoryName: "交通", tag: "打车",  source: "微信" },
  { id: 9,  date: "2026-06-06", counterparty: "招商银行 房贷扣款",flowKind: "expense",  amount: 9850.0,  categoryName: "居住",              source: "招商银行" },
  { id: 10, date: "2026-06-06", counterparty: "星巴克",           flowKind: "expense",  amount: 39.0,    categoryName: "餐饮", tag: "咖啡",  source: "微信" },
  { id: 11, date: "2026-06-05", counterparty: "京东·显示器",      flowKind: "expense",  amount: 1299.0,  categoryName: "购物", tag: "数码",  source: "支付宝" },
  { id: 12, date: "2026-06-05", counterparty: "基金定投·沪深300", flowKind: "expense",  amount: 2000.0,  categoryName: "理财",              source: "招商银行" },
  { id: 13, date: "2026-06-04", counterparty: "公司工资",         flowKind: "income",   amount: 28600.0, categoryName: "收入",              source: "工商银行" },
  { id: 14, date: "2026-06-04", counterparty: "美团外卖",         flowKind: "expense",  amount: 52.5,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 15, date: "2026-06-03", counterparty: "12306 高铁票",     flowKind: "expense",  amount: 553.0,   categoryName: "交通", tag: "差旅",  source: "支付宝" },
  { id: 16, date: "2026-06-03", counterparty: "爱奇艺黄金会员",   flowKind: "expense",  amount: 25.0,    categoryName: "订阅",              source: "支付宝" },
  { id: 17, date: "2026-06-02", counterparty: "滴滴出行",         flowKind: "expense",  amount: 28.0,    categoryName: "交通", tag: "打车",  source: "微信" },
  { id: 18, date: "2026-06-02", counterparty: "美团外卖",         flowKind: "expense",  amount: 42.5,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 19, date: "2026-06-01", counterparty: "房租",             flowKind: "expense",  amount: 3000.0,  categoryName: "居住",              source: "招商银行" },
  { id: 20, date: "2026-06-01", counterparty: "腾讯视频",         flowKind: "expense",  amount: 25.0,    categoryName: "订阅",              source: "微信" },
  { id: 21, date: "2026-05-31", counterparty: "美团外卖",         flowKind: "expense",  amount: 55.0,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 22, date: "2026-05-29", counterparty: "中国联通",         flowKind: "expense",  amount: 89.0,    categoryName: "通讯",              source: "支付宝" },
  { id: 23, date: "2026-05-28", counterparty: "KTV 欢唱",        flowKind: "expense",  amount: 320.0,   categoryName: "娱乐", tag: "聚会",  source: "微信" },
  { id: 24, date: "2026-05-27", counterparty: "山姆会员店",       flowKind: "expense",  amount: 678.0,   categoryName: "购物", tag: "采购",  source: "支付宝" },
  { id: 25, date: "2026-05-25", counterparty: "宜家家居",         flowKind: "expense",  amount: 430.0,   categoryName: "购物",              source: "支付宝" },
  { id: 26, date: "2026-05-25", counterparty: "兼职收入",         flowKind: "income",   amount: 2400.0,  categoryName: "收入",              source: "支付宝" },
  { id: 27, date: "2026-05-22", counterparty: "必胜客",           flowKind: "expense",  amount: 145.0,   categoryName: "餐饮",              source: "微信" },
  { id: 28, date: "2026-05-20", counterparty: "iCloud+",         flowKind: "expense",  amount: 21.0,    categoryName: "订阅",              source: "支付宝" },
  { id: 29, date: "2026-05-18", counterparty: "京东商城",         flowKind: "expense",  amount: 1299.0,  categoryName: "购物",              source: "支付宝" },
  { id: 30, date: "2026-05-15", counterparty: "水电费",           flowKind: "expense",  amount: 386.0,   categoryName: "居住",              source: "招商银行" },
  { id: 31, date: "2026-05-12", counterparty: "12306 高铁票",     flowKind: "expense",  amount: 320.0,   categoryName: "交通", tag: "差旅",  source: "支付宝" },
  { id: 32, date: "2026-05-10", counterparty: "永辉超市",         flowKind: "expense",  amount: 312.5,   categoryName: "购物", tag: "采购",  source: "微信" },
  { id: 33, date: "2026-05-09", counterparty: "健身房月卡",       flowKind: "expense",  amount: 199.0,   categoryName: "娱乐",              source: "支付宝" },
  { id: 34, date: "2026-05-06", counterparty: "海底捞",           flowKind: "expense",  amount: 268.0,   categoryName: "餐饮", tag: "聚餐",  source: "微信" },
  { id: 35, date: "2026-05-04", counterparty: "淘宝",             flowKind: "expense",  amount: 189.0,   categoryName: "购物",              source: "支付宝" },
  { id: 36, date: "2026-05-03", counterparty: "爱奇艺",           flowKind: "expense",  amount: 25.0,    categoryName: "订阅",              source: "支付宝" },
  { id: 37, date: "2026-05-02", counterparty: "美团外卖",         flowKind: "expense",  amount: 38.0,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 38, date: "2026-05-01", counterparty: "招商银行 房贷",    flowKind: "expense",  amount: 9850.0,  categoryName: "居住",              source: "招商银行" },
  { id: 39, date: "2026-05-01", counterparty: "公司工资",         flowKind: "income",   amount: 28600.0, categoryName: "收入",              source: "工商银行" },
  { id: 40, date: "2026-04-30", counterparty: "美团外卖",         flowKind: "expense",  amount: 47.0,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 41, date: "2026-04-26", counterparty: "永辉超市",         flowKind: "expense",  amount: 345.0,   categoryName: "购物",              source: "微信" },
  { id: 42, date: "2026-04-25", counterparty: "Steam",           flowKind: "expense",  amount: 198.0,   categoryName: "娱乐",              source: "支付宝" },
  { id: 43, date: "2026-04-21", counterparty: "加油站",           flowKind: "expense",  amount: 320.0,   categoryName: "交通",              source: "支付宝" },
  { id: 44, date: "2026-04-20", counterparty: "健身年卡",         flowKind: "expense",  amount: 2880.0,  categoryName: "娱乐",              source: "支付宝" },
  { id: 45, date: "2026-04-18", counterparty: "拼多多",           flowKind: "expense",  amount: 89.0,    categoryName: "购物",              source: "微信" },
  { id: 46, date: "2026-04-15", counterparty: "水电物业",         flowKind: "expense",  amount: 412.0,   categoryName: "居住",              source: "招商银行" },
  { id: 47, date: "2026-04-14", counterparty: "宽带费",           flowKind: "expense",  amount: 199.0,   categoryName: "通讯",              source: "支付宝" },
  { id: 48, date: "2026-04-10", counterparty: "海底捞",           flowKind: "expense",  amount: 445.0,   categoryName: "餐饮", tag: "聚餐",  source: "微信" },
  { id: 49, date: "2026-04-08", counterparty: "永辉超市",         flowKind: "expense",  amount: 198.0,   categoryName: "购物",              source: "微信" },
  { id: 50, date: "2026-04-07", counterparty: "腾讯视频",         flowKind: "expense",  amount: 25.0,    categoryName: "订阅",              source: "微信" },
  { id: 51, date: "2026-04-05", counterparty: "星巴克",           flowKind: "expense",  amount: 114.0,   categoryName: "餐饮", tag: "咖啡",  source: "微信" },
  { id: 52, date: "2026-04-04", counterparty: "淘宝",             flowKind: "expense",  amount: 256.0,   categoryName: "购物",              source: "支付宝" },
  { id: 53, date: "2026-04-03", counterparty: "上海地铁",         flowKind: "expense",  amount: 18.0,    categoryName: "交通",              source: "支付宝" },
  { id: 54, date: "2026-04-02", counterparty: "美团外卖",         flowKind: "expense",  amount: 43.5,    categoryName: "餐饮", tag: "外卖",  source: "微信" },
  { id: 55, date: "2026-04-01", counterparty: "招商银行 房贷",    flowKind: "expense",  amount: 9850.0,  categoryName: "居住",              source: "招商银行" },
  { id: 56, date: "2026-04-01", counterparty: "公司工资",         flowKind: "income",   amount: 28600.0, categoryName: "收入",              source: "工商银行" },
]

function SourceBadge({ source }: { source: string }) {
  const s = SOURCE_STYLE[source]
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
            ¥{tooltip.seg.amt.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
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
        <ColorDot color={CAT_COLOR[c.getValue()] ?? CAT_COLOR["其他"]} size={7} />
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

export function ImportsPage() {
  const refDate = new Date("2026-06-11")
  const thisMonthPrefix = "2026-06"

  const txs = MOCK_TXS
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
      .map(([name, amt]) => ({ name, amt, color: CAT_COLOR[name] ?? CAT_COLOR["其他"] }))
      .sort((a, b) => b.amt - a.amt)
  }, [txs])

  const catTotal30 = catSpend.reduce((s, c) => s + c.amt, 0)
  const sorted = useMemo(() => [...txs].sort((a, b) => b.date.localeCompare(a.date)), [txs])
  const activeDays = dailyBars.filter((v) => v > 0).length
  const expenseCount = sorted.filter((t) => t.flowKind === "expense").length

  const [selectedTx, setSelectedTx] = useState<Tx | null>(null)
  const [hoveredId, setHoveredId] = useState<number | null>(null)
  const [showAddTx, setShowAddTx] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)
  const table = useReactTable({ data: sorted, columns: COLUMNS, getCoreRowModel: getCoreRowModel() })
  const rows = table.getRowModel().rows
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 38,
    overscan: 8,
  })

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
              {expenseCount} 笔 · 日均 ¥{fmt(activeDays > 0 ? Math.round(catTotal30 / activeDays) : 0)}
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
        onClose={() => setShowAddTx(false)}
        onSave={() => setShowAddTx(false)}
      />
    </div>
  )
}
