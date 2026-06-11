import { useMemo } from "react"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function categoryColor(name: string): string {
  const map: Record<string, string> = {
    餐饮: "var(--c-food)", 交通: "var(--c-trans)", 购物: "var(--c-shop)",
    订阅: "var(--c-sub)", 娱乐: "var(--c-fun)", 居住: "var(--c-live)",
    理财: "var(--c-invest)", 其他: "var(--c-other)", 转账: "var(--c-xfer)",
  }
  return map[name] ?? "var(--c-other)"
}

const DEFAULT_LIMITS: Record<string, number> = {
  餐饮: 2000, 交通: 800, 购物: 1500, 订阅: 500,
  娱乐: 600, 居住: 3000, 其他: 500,
}

function Bar({ pct, color, h }: { pct: number; color: string; h: number }) {
  return (
    <div style={{ height: h, background: "var(--surface-3)", borderRadius: h / 2, overflow: "hidden", flex: 1 }}>
      <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color, borderRadius: h / 2, transition: "width 0.3s ease" }} />
    </div>
  )
}

export function BudgetPage() {
  const snapshot = useFlowmStore((s) => s.snapshot)

  const now = new Date()
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

  const budgets = useMemo(() => {
    const spendMap = new Map<string, number>()
    for (const t of (snapshot.transactions ?? []) as Record<string, unknown>[]) {
      const date = String(t.date ?? "")
      if (!date.startsWith(ym)) continue
      const kind = String(t.kind ?? t.flowKind ?? "expense")
      if (kind !== "expense") continue
      const cat = String(t.category ?? "其他")
      spendMap.set(cat, (spendMap.get(cat) ?? 0) + Math.abs(Number(t.amountNumber ?? t.amount ?? 0)))
    }
    const cats = Object.keys(DEFAULT_LIMITS)
    for (const [cat] of spendMap) {
      if (!cats.includes(cat)) cats.push(cat)
    }
    return cats
      .filter((cat) => cat !== "收入" && cat !== "转账")
      .map((cat) => ({
        cat,
        spent: spendMap.get(cat) ?? 0,
        limit: DEFAULT_LIMITS[cat] ?? 500,
        color: categoryColor(cat),
      }))
      .filter((b) => b.spent > 0 || DEFAULT_LIMITS[b.cat] !== undefined)
  }, [snapshot, ym])

  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const remain = budgetTotal - budgetSpent
  const pctTotal = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0

  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 44, paddingBottom: 16, borderBottom: "1px solid var(--hair-2)" }}>
        <div className="dm-stat">
          <div className="l">本月预算 · 已用</div>
          <div className="dm-num" style={{ fontSize: 34, marginTop: 3 }}>¥{fmt(budgetSpent)}</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">预算总额</div>
          <div className="v" style={{ fontSize: 16 }}>¥{fmt(budgetTotal)}</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">剩余可用</div>
          <div className="v" style={{ fontSize: 16, color: remain < 0 ? "var(--red)" : "var(--ink)" }}>¥{fmt(remain)}</div>
        </div>
        <div style={{ marginLeft: "auto", width: 280, paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span className="dim" style={{ fontSize: 10.5 }}>整体进度</span>
            <span className="mono" style={{ fontSize: 11, fontWeight: 600 }}>{Math.round(pctTotal)}%</span>
          </div>
          <Bar pct={pctTotal} color={pctTotal > 100 ? "var(--red)" : "var(--accent)"} h={8} />
        </div>
      </div>

      {budgets.length === 0 ? (
        <div className="es-wrap">
          <div className="es-icon">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 12a5.5 5.5 0 1 1 11 0M8 12l3.2-2.6M8 12V6.5" />
            </svg>
          </div>
          <div className="es-title">还没有消费记录</div>
          <div className="es-sub">先在"流水"页面导入账单，预算页面会自动统计本月各类别消费。</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0, marginTop: 14, overflow: "hidden" }}>
          {budgets.map((b, i) => {
            const p = b.limit > 0 ? (b.spent / b.limit) * 100 : 0
            const over = b.spent > b.limit
            return (
              <div
                key={b.cat}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 160px",
                  gap: 18,
                  alignItems: "center",
                  padding: "13px 0",
                  borderTop: i ? "1px solid var(--hair-3)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="cdot" style={{ background: b.color, width: 9, height: 9 }} />
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{b.cat}</span>
                </div>
                <Bar pct={Math.min(p, 100)} color={over ? "var(--red)" : "var(--accent)"} h={7} />
                <div style={{ textAlign: "right" }}>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: over ? "var(--red)" : "var(--ink)" }}>
                    ¥{fmt(b.spent)}
                  </span>
                  <span className="mono dim" style={{ fontSize: 11 }}> / {fmt(b.limit)}</span>
                  <span className="mono" style={{ fontSize: 11, marginLeft: 8, color: over ? "var(--red)" : "var(--ink-3)" }}>
                    {over ? "超 ¥" + fmt(b.spent - b.limit) : "剩 ¥" + fmt(b.limit - b.spent)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
        预算只统计日常可控支出（不含房贷与储蓄）。Flowm 只告诉你用了多少，不替你做超支判断。
      </div>
    </Shell>
  )
}
