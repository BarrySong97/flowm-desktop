import { Shell } from "../components/layout/Shell"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

const BUDGETS = [
  { name: "餐饮", color: "var(--c-food)",  spent: 3284, limit: 4000 },
  { name: "购物", color: "var(--c-shop)",  spent: 1940, limit: 1800 },
  { name: "交通", color: "var(--c-trans)", spent: 1150, limit: 1400 },
  { name: "娱乐", color: "var(--c-fun)",   spent: 680,  limit: 1200 },
  { name: "其他", color: "var(--c-other)", spent: 612,  limit: 900  },
  { name: "订阅", color: "var(--c-sub)",   spent: 206,  limit: 600  },
]

const budgetSpent = BUDGETS.reduce((s, b) => s + b.spent, 0)
const budgetTotal = BUDGETS.reduce((s, b) => s + b.limit, 0)
const remain = budgetTotal - budgetSpent
const pctTotal = (budgetSpent / budgetTotal) * 100

function Bar({ pct, color, h }: { pct: number; color: string; h: number }) {
  return (
    <div style={{ height: h, background: "var(--hair-2)", borderRadius: h / 2, overflow: "hidden" }}>
      <div style={{ height: "100%", width: Math.min(pct, 100) + "%", background: color, borderRadius: h / 2 }} />
    </div>
  )
}

export function BudgetPage() {
  return (
    <Shell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 44, paddingBottom: 16, borderBottom: "1px solid var(--hair-2)" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>本月预算 · 已用</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", marginTop: 3 }}>
            ¥{fmt(budgetSpent)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>预算总额</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
            ¥{fmt(budgetTotal)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>剩余可用</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: remain < 0 ? "var(--red)" : "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
            ¥{fmt(remain)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", width: 300, paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>整体进度</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>{Math.round(pctTotal)}%</span>
          </div>
          <Bar pct={pctTotal} color={pctTotal > 100 ? "var(--red)" : "var(--accent)"} h={8} />
        </div>
      </div>

      {/* Budget rows */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
        {BUDGETS.map((b, i) => {
          const pct = b.spent / b.limit * 100
          const over = b.spent > b.limit
          return (
            <div
              key={b.name}
              style={{
                display: "grid", gridTemplateColumns: "120px 1fr 160px",
                gap: 18, alignItems: "center", padding: "13px 0",
                borderTop: i ? "1px solid var(--hair-3)" : "none",
              }}
            >
              {/* Label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 9, height: 9, borderRadius: 2, background: b.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{b.name}</span>
              </div>

              {/* Bar */}
              <Bar pct={pct} color={over ? "var(--red)" : "var(--accent)"} h={7} />

              {/* Amounts */}
              <div style={{ textAlign: "right" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 13, fontWeight: 500, color: over ? "var(--red)" : "var(--ink)" }}>
                  ¥{fmt(b.spent)}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>
                  {" / "}{fmt(b.limit)}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, marginLeft: 8, color: over ? "var(--red)" : "var(--ink-3)" }}>
                  {over ? `超 ¥${fmt(b.spent - b.limit)}` : `剩 ¥${fmt(b.limit - b.spent)}`}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: "auto", paddingTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
        预算只统计日常可控支出（不含房贷与储蓄）。Flowm 只告诉你用了多少，不替你做超支判断。
      </div>
    </Shell>
  )
}
