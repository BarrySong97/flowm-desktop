import { useEffect, useMemo, useState } from "react"
import { Button, Input } from "@heroui/react"
import type { PlanSummary } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function cycleLabel(rule: string): string {
  if (!rule) return "月付"
  const r = rule.toUpperCase()
  if (r.includes("WEEKLY")) return "周付"
  if (r.includes("YEARLY") || r.includes("ANNUAL")) return "年付"
  return "月付"
}

function monthlyAmt(plan: PlanSummary): number {
  const amt = Math.abs(Number(plan.amount) || 0)
  const r = (plan.scheduleRule ?? "").toUpperCase()
  if (r.includes("YEARLY") || r.includes("ANNUAL")) return amt / 12
  if (r.includes("WEEKLY")) return amt * 4.33
  return amt
}

type SubForm = {
  id?: number
  name: string
  amount: string
  currency: string
  scheduleRule: string
  nextDueDate: string
}
const EMPTY: SubForm = {
  name: "", amount: "", currency: "CNY",
  scheduleRule: "FREQ=MONTHLY", nextDueDate: new Date().toISOString().slice(0, 10),
}

const CAT_COLORS = [
  "var(--c-sub)", "var(--c-food)", "var(--c-trans)", "var(--c-shop)",
  "var(--c-fun)", "var(--c-live)", "var(--c-invest)",
]

export function SubscriptionsPage() {
  const plans = useFlowmStore((s) => s.plans)
  const loadPlans = useFlowmStore((s) => s.loadPlans)
  const createPlan = useFlowmStore((s) => s.createPlan)
  const updatePlan = useFlowmStore((s) => s.updatePlan)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<SubForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { void loadPlans() }, [loadPlans])

  const subs = useMemo(() => plans.filter((p) => p.planType === "subscription" && p.status !== "cancelled"), [plans])

  const now = new Date()
  const YEAR = now.getFullYear()
  const MON = now.getMonth() + 1
  const TODAY = now.getDate()

  const yearly = subs.reduce((s, x) => s + monthlyAmt(x) * 12, 0)
  const monthly = subs.reduce((s, x) => s + monthlyAmt(x), 0)

  const byDay = useMemo(() => {
    const map: Record<number, PlanSummary[]> = {}
    for (const s of subs) {
      if (!s.nextDueDate) continue
      const d = new Date(s.nextDueDate)
      if (d.getFullYear() === YEAR && d.getMonth() + 1 === MON) {
        const day = d.getDate();
        (map[day] = map[day] ?? []).push(s)
      }
    }
    return map
  }, [subs, YEAR, MON])

  const monthCharges = Object.values(byDay).flat()
  const monthTotal = monthCharges.reduce((s, p) => s + Math.abs(Number(p.amount) || 0), 0)

  const daysInMonth = new Date(YEAR, MON, 0).getDate()
  const firstWd = (new Date(YEAR, MON - 1, 1).getDay() + 6) % 7
  const cells: (number | null)[] = []
  for (let i = 0; i < firstWd; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7) cells.push(null)

  function openAdd() { setForm(EMPTY); setShowForm(true) }
  function openEdit(p: PlanSummary) {
    setForm({
      id: p.id, name: p.name, amount: String(Math.abs(Number(p.amount) || 0)),
      currency: p.currency, scheduleRule: p.scheduleRule,
      nextDueDate: p.nextDueDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim() || !form.amount) return
    setSaving(true)
    try {
      const payload = {
        planType: "subscription",
        name: form.name.trim(),
        amount: (-Math.abs(Number(form.amount))).toFixed(2),
        currency: form.currency,
        scheduleRule: form.scheduleRule,
        startDate: form.nextDueDate,
        nextDueDate: form.nextDueDate,
        flowKind: "expense",
        status: "active",
      }
      if (form.id) {
        await updatePlan({ id: form.id, ...payload })
      } else {
        await createPlan(payload)
      }
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function cancelSub(id: number) {
    await updatePlan({ id, status: "cancelled" })
  }

  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 40, paddingBottom: 14, borderBottom: "1px solid var(--hair-2)" }}>
        <div className="dm-stat">
          <div className="l">每月订阅</div>
          <div className="dm-num" style={{ fontSize: 34, marginTop: 3 }}>¥{fmt(monthly)}</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">本月扣费</div>
          <div className="v" style={{ fontSize: 16 }}>¥{fmt(monthTotal)} · {monthCharges.length} 笔</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">订阅数</div>
          <div className="v" style={{ fontSize: 16 }}>{subs.length} 项</div>
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 8 }}>
          <Button size="sm" variant="primary" onPress={openAdd}>＋ 添加订阅</Button>
        </div>
      </div>

      {subs.length === 0 ? (
        <div className="es-wrap">
          <div className="es-icon">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8a5 5 0 018-3.5M13 8a5 5 0 01-8 3.5M11 3v2H9M5 13v-2h2" />
            </svg>
          </div>
          <div className="es-title">还没有订阅记录</div>
          <div className="es-sub">记录 Netflix、Spotify 等周期性扣费，Flowm 会在日历上显示扣费时间。</div>
          <div className="es-actions">
            <Button variant="primary" onPress={openAdd}>添加订阅</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 30, flex: 1, minHeight: 0, marginTop: 16 }}>
          {/* Calendar */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
              <span className="dm-sec" style={{ margin: 0 }}>{YEAR} 年 {MON} 月</span>
              <span className="dim" style={{ fontSize: 10.5, marginLeft: 10, whiteSpace: "nowrap" }}>有底色的日期 = 当天有订阅扣费</span>
            </div>
            <div className="cal" style={{ flex: 1 }}>
              {["一", "二", "三", "四", "五", "六", "日"].map((w) => <div className="wd" key={w}>{w}</div>)}
              {cells.map((d, i) => {
                if (!d) return <div className="cell empty" key={i} />
                const chgs = byDay[d]
                const cls = "cell" + (d === TODAY ? " today" : "") + (chgs ? " has" : "")
                return (
                  <div className={cls} key={i}>
                    <span className="dn">
                      {d}{d === TODAY && <span style={{ marginLeft: 4, fontSize: 8, fontWeight: 700 }}>今天</span>}
                    </span>
                    {chgs?.map((s, j) => (
                      <div className="chg" key={j}>
                        <span className="d" style={{ background: CAT_COLORS[j % CAT_COLORS.length] }} />
                        <span className="a">¥{fmt(Math.abs(Number(s.amount) || 0))}</span>
                        <span className="nm">{s.name.split(" ")[0]}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Receipt list */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div className="dm-sec" style={{ marginBottom: 4 }}>全部订阅</div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              {subs.map((s) => (
                <div className="da-row" key={s.id} style={{ padding: "8px 0", gap: 10 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="nm">{s.name}</div>
                    <div className="dim" style={{ fontSize: 10.5, marginTop: 1 }}>下次 {s.nextDueDate?.slice(0, 10) ?? "—"}</div>
                  </div>
                  <span className="pill" style={{ padding: "2px 8px", fontSize: 9.5 }}>{cycleLabel(s.scheduleRule)}付</span>
                  <span className="mono" style={{ width: 70, textAlign: "right", fontSize: 13, fontWeight: 500 }}>
                    ¥{fmt(Math.abs(Number(s.amount) || 0))}
                  </span>
                  <Button size="sm" variant="secondary" onPress={() => openEdit(s)}>编辑</Button>
                  <Button size="sm" variant="danger-soft" onPress={() => void cancelSub(s.id)}>删</Button>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px dashed var(--ink-4)", marginTop: 6, paddingTop: 12 }}>
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 5 }}>
                <span style={{ fontSize: 11.5, color: "var(--ink-2)" }}>每月合计</span>
                <span className="mono" style={{ marginLeft: "auto", fontSize: 19, fontWeight: 700, letterSpacing: "-0.02em" }}>¥{fmt(monthly)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline" }}>
                <span className="dim" style={{ fontSize: 10.5 }}>每年合计</span>
                <span className="mono dim" style={{ marginLeft: "auto", fontSize: 12 }}>¥{fmt(yearly)}</span>
              </div>
              <div style={{ borderTop: "1px dashed var(--hair)", marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-between" }}>
                <span className="dim" style={{ fontSize: 9.5 }}>{subs.length} 项订阅</span>
                <span className="dim" style={{ fontSize: 9.5 }}>FLOWM · {YEAR}/{String(MON).padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="wf-modal">
            <div className="wf-head">
              <div>
                <div className="wf-title">{form.id ? "编辑订阅" : "添加订阅"}</div>
                <div className="wf-sub">周期性自动扣费</div>
              </div>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => setShowForm(false)}>✕</Button>
            </div>
            <div className="wf-body">
              <div className="wf-field nb">
                <div className="wf-flabel">名称</div>
                <Input
                  variant="primary"
                  value={form.name}
                  placeholder="例如：Netflix"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">扣费金额</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    variant="primary"
                    style={{ flex: 1 }}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    placeholder="0.00"
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                  <Input
                    variant="primary"
                    style={{ width: 72 }}
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
              <div className="wf-field">
                <div className="wf-flabel">扣费周期</div>
                <div className="wf-chips">
                  {(["FREQ=MONTHLY", "FREQ=YEARLY", "FREQ=WEEKLY"] as const).map((r) => (
                    <Button
                      key={r}
                      size="sm"
                      variant={form.scheduleRule === r ? "primary" : "outline"}
                      onPress={() => setForm((f) => ({ ...f, scheduleRule: r }))}
                    >
                      {r === "FREQ=MONTHLY" ? "月付" : r === "FREQ=YEARLY" ? "年付" : "周付"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="wf-field">
                <div className="wf-flabel">下次扣费日期</div>
                <input className="wf-input" type="date" value={form.nextDueDate}
                  onChange={(e) => setForm((f) => ({ ...f, nextDueDate: e.target.value }))} />
              </div>
            </div>
            <div className="wf-foot">
              <Button variant="primary" isDisabled={saving} onPress={() => void save()}>
                {saving ? "保存中…" : "保存"}
              </Button>
              <Button variant="outline" onPress={() => setShowForm(false)}>取消</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
