import { useMemo, useRef, useState } from "react"
import { Button } from "@heroui/react"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"
import type { FinancialEventSummary } from "@flowm/api"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function categoryColor(name?: string): string {
  const map: Record<string, string> = {
    餐饮: "var(--c-food)", 交通: "var(--c-trans)", 购物: "var(--c-shop)",
    订阅: "var(--c-sub)", 娱乐: "var(--c-fun)", 居住: "var(--c-live)",
    理财: "var(--c-invest)", 收入: "var(--c-income)", 其他: "var(--c-other)", 转账: "var(--c-xfer)",
  }
  return name ? (map[name] ?? "var(--c-other)") : "var(--c-other)"
}

function DayBars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1)
  const total = data.length
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 62 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: Math.max((v / max) * 100, v > 0 ? 4 : 0) + "%",
          background: i === total - 1 ? "var(--accent)" : "var(--c-xfer)",
          borderRadius: "2px 2px 0 0",
          opacity: i === total - 1 ? 1 : 0.55 + (i / total) * 0.45,
        }} />
      ))}
    </div>
  )
}

function DonutChart({ segments, size = 140, thick = 26 }: {
  segments: { name: string; amt: number; color: string }[]
  size?: number; thick?: number
}) {
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
    return { ...seg, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` }
  })
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {paths.map((p, i) => <path key={i} d={p.d} fill={p.color} />)}
      <circle cx={cx} cy={cy} r={r - thick} fill="var(--surface)" />
    </svg>
  )
}

export function ImportsPage() {
  const snapshot = useFlowmStore((s) => s.snapshot)
  const importNormalizedStatementEntries = useFlowmStore((s) => s.importNormalizedStatementEntries)
  const [showImport, setShowImport] = useState(false)
  const [importType, setImportType] = useState<"alipay" | "wechat">("alipay")
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const events = useMemo<FinancialEventSummary[]>(
    () =>
      (snapshot.transactions ?? []).map((t: Record<string, unknown>) => ({
        id: Number(t.id ?? 0),
        date: String(t.date ?? ""),
        description: String(t.narration ?? t.description ?? ""),
        counterparty: String(t.payee ?? ""),
        flowKind: String(t.kind ?? t.flowKind ?? "expense"),
        amount: String(t.amountNumber ?? t.amount ?? "0"),
        currency: String(t.currency ?? "CNY"),
        categoryName: String(t.category ?? ""),
        classificationSource: "snapshot",
        createdAt: String(t.date ?? ""),
      })),
    [snapshot],
  )

  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const thisMonth = events.filter((e) => e.date.startsWith(ym))
  const monthOut = thisMonth.filter((e) => e.flowKind === "expense").reduce((s, e) => s + Math.abs(Number(e.amount)), 0)
  const monthIn = thisMonth.filter((e) => e.flowKind === "income").reduce((s, e) => s + Math.abs(Number(e.amount)), 0)
  const monthNet = monthIn - monthOut

  const dailyBars = useMemo(() => {
    const bars = new Array<number>(30).fill(0)
    for (const e of events) {
      if (e.flowKind !== "expense") continue
      const date = new Date(e.date)
      const daysAgo = Math.floor((now.getTime() - date.getTime()) / 86400000)
      if (daysAgo >= 0 && daysAgo < 30) bars[29 - daysAgo] += Math.abs(Number(e.amount) || 0)
    }
    return bars
  }, [events])

  const catSpend = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of events) {
      if (e.flowKind !== "expense" || !e.date.startsWith(ym)) continue
      const cat = e.categoryName ?? "其他"
      map.set(cat, (map.get(cat) ?? 0) + Math.abs(Number(e.amount) || 0))
    }
    return [...map.entries()]
      .map(([name, amt]) => ({ name, amt, color: categoryColor(name) }))
      .sort((a, b) => b.amt - a.amt)
      .slice(0, 6)
  }, [events])

  const sorted = useMemo(() => [...events].sort((a, b) => b.date.localeCompare(a.date)), [events])

  async function handleFileImport(file: File) {
    setImporting(true)
    try {
      const { parseAlipayPersonalCsv, parseWeChatPersonalXlsx } = await import("@flowm/business")
      const buf = await file.arrayBuffer()
      let entries: import("@flowm/business").NormalizedStatementEntry[] = []
      if (importType === "alipay") {
        const text = new TextDecoder("utf-8").decode(buf)
        entries = parseAlipayPersonalCsv(text).entries
      } else {
        entries = parseWeChatPersonalXlsx(buf).entries
      }
      if (entries.length > 0) {
        await importNormalizedStatementEntries({
          sourceName: importType === "alipay" ? "alipay" : "wechat",
          fileName: file.name,
          importedAt: new Date().toISOString(),
          entries,
        })
      }
      setShowImport(false)
    } catch (err) {
      console.error(err)
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <Shell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 48, paddingBottom: 16, borderBottom: "1px solid var(--hair-2)" }}>
        <div className="dm-stat">
          <div className="l">本月消费</div>
          <div className="dm-num neg" style={{ fontSize: 32, marginTop: 4 }}>−{fmt(monthOut)}</div>
        </div>
        <div className="dm-stat">
          <div className="l">本月收入</div>
          <div className="dm-num pos" style={{ fontSize: 32, marginTop: 4 }}>+{fmt(monthIn)}</div>
        </div>
        <div className="dm-stat">
          <div className="l">净流入</div>
          <div className="dm-num" style={{ fontSize: 32, marginTop: 4, color: monthNet >= 0 ? "var(--green)" : "var(--red)" }}>
            {monthNet >= 0 ? "+" : "−"}{fmt(Math.abs(monthNet))}
          </div>
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 8 }}>
          <Button size="sm" onPress={() => setShowImport(true)}>↑ 导入账单</Button>
        </div>
      </div>

      {/* Day bars */}
      <div style={{ margin: "20px 0 8px" }}>
        <div style={{ display: "flex", alignItems: "baseline", marginBottom: 10 }}>
          <span className="dm-sec" style={{ margin: 0, whiteSpace: "nowrap" }}>近 30 天每日消费</span>
          <span className="dim" style={{ fontSize: 10.5, marginLeft: "auto" }}>
            {events.length} 笔 · 日均 ¥{fmt(Math.round(monthOut / 30))}
          </span>
        </div>
        <DayBars data={dailyBars} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <span className="dim" style={{ fontSize: 10 }}>30 天前</span>
          <span className="dim" style={{ fontSize: 10, color: "var(--accent)", fontWeight: 600 }}>今天</span>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 30, flex: 1, minHeight: 0, marginTop: 12 }}>
        <div style={{ overflow: "hidden" }}>
          {sorted.length === 0 ? (
            <div className="es-wrap">
              <div className="es-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 10h16M4 14h10" />
                </svg>
              </div>
              <div className="es-title">还没有流水记录</div>
              <div className="es-sub">导入支付宝或微信账单，Flowm 会自动解析分类。</div>
              <div className="es-actions">
                <Button variant="primary" onPress={() => setShowImport(true)}>导入账单</Button>
              </div>
            </div>
          ) : (
            <table className="dtbl">
              <thead>
                <tr>
                  <th style={{ width: 60 }}>日期</th>
                  <th>项目</th>
                  <th>类别</th>
                  <th>来源</th>
                  <th className="r">金额</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 60).map((t, i) => {
                  const amt = Math.abs(Number(t.amount))
                  const isIncome = t.flowKind === "income"
                  return (
                    <tr key={i}>
                      <td className="mono dim">{t.date.slice(5)}</td>
                      <td className="nm" style={{ maxWidth: 200 }}>{t.counterparty ?? t.description ?? "—"}</td>
                      <td>
                        <span className="src">
                          <span className="cdot" style={{ background: categoryColor(t.categoryName) }} />
                          {t.categoryName ?? "其他"}
                        </span>
                      </td>
                      <td><span className="dim" style={{ fontSize: 11 }}>{t.source ?? "—"}</span></td>
                      <td className={"r mono " + (isIncome ? "pos" : "neg")}>
                        {isIncome ? "+" : "−"}¥{fmt(amt, 2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ alignSelf: "start" }}>
          <div className="dm-sec">消费类别 · 近 30 天</div>
          {catSpend.length > 0 ? (
            <>
              <div style={{ display: "flex", justifyContent: "center", margin: "16px 0 14px" }}>
                <div style={{ position: "relative", width: 140, height: 140 }}>
                  <DonutChart segments={catSpend} size={140} thick={26} />
                  <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", textAlign: "center" }}>
                    <div>
                      <div className="dim" style={{ fontSize: 9.5 }}>本月消费</div>
                      <div className="mono" style={{ fontWeight: 600, fontSize: 14 }}>¥{fmt(monthOut)}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {catSpend.map((c, i) => (
                  <div className="legend-r" key={i}>
                    <span className="cdot" style={{ background: c.color }} />
                    <span className="nm">{c.name}</span>
                    <span className="vl">¥{fmt(c.amt)}</span>
                    <span className="pc">{monthOut > 0 ? Math.round((c.amt / monthOut) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="dim" style={{ fontSize: 12, marginTop: 16 }}>暂无消费记录</div>
          )}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--hair)", fontSize: 10.5, color: "var(--ink-4)", lineHeight: 1.6 }}>
            流水只作参考，不强迫你处理每一笔。
          </div>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) setShowImport(false) }}>
          <div className="wf-modal">
            <div className="wf-head">
              <div>
                <div className="wf-title">导入账单</div>
                <div className="wf-sub">支持支付宝 CSV · 微信 XLSX</div>
              </div>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => setShowImport(false)}>✕</Button>
            </div>
            <div className="wf-body">
              <div className="wf-field nb">
                <div className="wf-flabel">账单来源</div>
                <div className="wf-chips">
                  <Button
                    size="sm"
                    variant={importType === "alipay" ? "primary" : "outline"}
                    onPress={() => setImportType("alipay")}
                  >
                    <span style={{ background: "#1677ff", marginRight: 6 }} className="cdot" />支付宝
                  </Button>
                  <Button
                    size="sm"
                    variant={importType === "wechat" ? "primary" : "outline"}
                    onPress={() => setImportType("wechat")}
                  >
                    <span style={{ background: "#07c160", marginRight: 6 }} className="cdot" />微信支付
                  </Button>
                </div>
              </div>
              <div className="wf-field">
                <div className="wf-flabel">选择文件</div>
                <input
                  ref={fileRef}
                  type="file"
                  accept={importType === "alipay" ? ".csv" : ".xlsx"}
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) void handleFileImport(f)
                  }}
                />
                <Button variant="outline" onPress={() => fileRef.current?.click()}>
                  选择 {importType === "alipay" ? "CSV" : "XLSX"} 文件
                </Button>
              </div>
              <div className="wf-note">
                {importType === "alipay"
                  ? "在支付宝 App → 账单 → 右上角下载账单，选择 CSV 格式导出。"
                  : "在微信 → 我 → 支付 → 账单，右上角下载账单，选择 XLSX 格式。"}
              </div>
            </div>
            <div className="wf-foot">
              {importing && <span className="dim" style={{ fontSize: 12 }}>解析中…</span>}
              <Button variant="outline" onPress={() => setShowImport(false)} style={{ marginLeft: "auto" }}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
