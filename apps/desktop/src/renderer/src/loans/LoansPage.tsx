import { useEffect, useMemo, useState } from "react"
import { Button, Input } from "@heroui/react"
import type { PlanSummary } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

interface LoanBar {
  id: number
  name: string
  institution: string
  rate: number
  monthly: number
  remain: number
  total: number
  termTotal: number
  termLeft: number
  paid: number
  sched: { interest: number; principal: number }[]
}

type TipState = {
  li: number; k: number
  principal: number; interest: number; monthly: number
  paid: boolean; left: number; top: number; gw: number
} | null

function buildLoan(p: PlanSummary): LoanBar {
  const meta = (p.meta ?? {}) as Record<string, unknown>
  const monthly = Math.abs(Number(p.amount) || 0)
  const termTotal = Number(meta.termTotal ?? 120)
  const rate = Number(meta.annualRate ?? 4.5)
  const total = Number(meta.principalTotal ?? monthly * termTotal * 0.6)
  const startDate = new Date(p.startDate)
  const now = new Date()
  const elapsedMonths = Math.floor((now.getTime() - startDate.getTime()) / (30 * 86400000))
  const paid = Math.min(Math.max(0, elapsedMonths), termTotal)
  const termLeft = termTotal - paid
  const remain = Number(meta.principalRemaining ?? total * (termLeft / Math.max(termTotal, 1)))

  const r = rate / 100 / 12
  let bal = total
  const sched: { interest: number; principal: number }[] = []
  for (let k = 0; k < termTotal; k++) {
    const interest = r > 0 ? bal * r : 0
    const principal = Math.max(monthly - interest, 0)
    bal = Math.max(0, bal - principal)
    sched.push({ interest, principal })
  }

  return {
    id: p.id, name: p.name,
    institution: (meta.institution as string) ?? p.counterparty ?? "—",
    rate, monthly, remain, total, termTotal, termLeft, paid, sched,
  }
}

type LoanForm = {
  id?: number
  name: string
  institution: string
  principalTotal: string
  monthlyPayment: string
  annualRate: string
  termTotal: string
  startDate: string
}
const EMPTY: LoanForm = {
  name: "", institution: "", principalTotal: "", monthlyPayment: "",
  annualRate: "4.5", termTotal: "120", startDate: new Date().toISOString().slice(0, 10),
}

export function LoansPage() {
  const plans = useFlowmStore((s) => s.plans)
  const loadPlans = useFlowmStore((s) => s.loadPlans)
  const createPlan = useFlowmStore((s) => s.createPlan)
  const updatePlan = useFlowmStore((s) => s.updatePlan)

  const [tip, setTip] = useState<TipState>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<LoanForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => { void loadPlans() }, [loadPlans])

  const loanPlans = useMemo(() => plans.filter((p) => p.planType === "loan" && p.status !== "cancelled"), [plans])
  const loans = useMemo<LoanBar[]>(() => loanPlans.map(buildLoan), [loanPlans])

  const totalLiab = loans.reduce((s, l) => s + l.remain, 0)
  const totalMonthly = loans.reduce((s, l) => s + l.monthly, 0)

  function openAdd() { setForm(EMPTY); setShowForm(true) }
  function openEdit(p: PlanSummary) {
    const meta = (p.meta ?? {}) as Record<string, unknown>
    setForm({
      id: p.id, name: p.name,
      institution: (meta.institution as string) ?? p.counterparty ?? "",
      principalTotal: String(meta.principalTotal ?? ""),
      monthlyPayment: String(Math.abs(Number(p.amount) || 0)),
      annualRate: String(meta.annualRate ?? "4.5"),
      termTotal: String(meta.termTotal ?? "120"),
      startDate: p.startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.name.trim() || !form.monthlyPayment) return
    setSaving(true)
    try {
      const payload = {
        planType: "loan",
        name: form.name.trim(),
        counterparty: form.institution || undefined,
        amount: (-Math.abs(Number(form.monthlyPayment))).toFixed(2),
        currency: "CNY",
        scheduleRule: "FREQ=MONTHLY",
        startDate: form.startDate,
        flowKind: "expense",
        status: "active",
        meta: {
          institution: form.institution,
          principalTotal: Number(form.principalTotal) || 0,
          annualRate: Number(form.annualRate) || 4.5,
          termTotal: Number(form.termTotal) || 120,
        },
      }
      if (form.id) {
        await updatePlan({ id: form.id, ...payload })
      } else {
        await createPlan(payload)
      }
      setShowForm(false)
    } finally { setSaving(false) }
  }

  async function cancelLoan(id: number) {
    await updatePlan({ id, status: "cancelled" })
  }

  return (
    <Shell>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 44, paddingBottom: 16, borderBottom: "1px solid var(--hair-2)" }}>
        <div className="dm-stat">
          <div className="l">欠款总额</div>
          <div className="dm-num" style={{ fontSize: 34, marginTop: 3 }}>¥{fmt(totalLiab)}</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">每月还款</div>
          <div className="v" style={{ fontSize: 16 }}>¥{fmt(totalMonthly)}</div>
        </div>
        <div className="dm-stat" style={{ paddingTop: 6 }}>
          <div className="l">贷款数</div>
          <div className="v" style={{ fontSize: 16 }}>{loans.length} 笔</div>
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 8 }}>
          <Button size="sm" variant="primary" onPress={openAdd}>＋ 添加贷款</Button>
        </div>
      </div>

      {loans.length === 0 ? (
        <div className="es-wrap">
          <div className="es-icon">
            <svg width="28" height="28" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l6-3 6 3M3 6v6M13 6v6M6 6v6M10 6v6M2 13h12" />
            </svg>
          </div>
          <div className="es-title">还没有贷款记录</div>
          <div className="es-sub">记录房贷、车贷或其他分期，Flowm 会显示还款进度。</div>
          <div className="es-actions">
            <Button variant="primary" onPress={openAdd}>添加贷款</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 26, marginTop: 22 }}>
          {loans.map((l, li) => {
            const pct = l.termTotal > 0 ? (l.paid / l.termTotal) * 100 : 0
            const yrsLeft = (l.termLeft / 12).toFixed(1)
            const planItem = loanPlans.find((p) => p.id === l.id)
            return (
              <div key={l.id}>
                <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
                  <span style={{ fontSize: 14, fontWeight: 600 }}>{l.name}</span>
                  <span className="dim" style={{ fontSize: 11, marginLeft: 8 }}>
                    {l.institution} · {l.rate}% · 月供 ¥{fmt(l.monthly)} · 共 {l.termTotal} 期
                  </span>
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 18, fontWeight: 600 }}>¥{fmt(l.remain)}</span>
                    {planItem && <Button size="sm" variant="secondary" onPress={() => openEdit(planItem)}>编辑</Button>}
                    <Button size="sm" variant="danger-soft" onPress={() => void cancelLoan(l.id)}>删</Button>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div className="lbars" style={{ flex: 1 }} onMouseLeave={() => setTip(null)}>
                    {l.sched.map((s, k) => {
                      const cls = "lbar" + (k < l.paid ? (k === l.paid - 1 ? " cur" : " on") : "")
                      return (
                        <div
                          key={k}
                          className={cls}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget
                            const gw = el.parentElement?.offsetWidth ?? 0
                            setTip({ li, k, principal: s.principal, interest: s.interest, monthly: l.monthly, paid: k < l.paid, left: el.offsetLeft + el.offsetWidth / 2, top: el.offsetTop, gw })
                          }}
                        />
                      )
                    })}
                    {tip?.li === li && (() => {
                      const al = tip.left > tip.gw * 0.8 ? "r" : tip.left < tip.gw * 0.2 ? "l" : "c"
                      const tf = (al === "r" ? "translate(-100%,-100%)" : al === "l" ? "translate(0,-100%)" : "translate(-50%,-100%)") + " translateY(-9px)"
                      const ar = al === "r" ? "calc(100% - 14px)" : al === "l" ? "10px" : "50%"
                      return (
                        <div className="ltip" style={{ left: tip.left, top: tip.top, transform: tf }}>
                          <div className="h">第 {tip.k + 1} / {l.termTotal} 期 · {tip.paid ? "已还" : "未还"}</div>
                          <div className="row">
                            <div className="c"><span className="k">本金</span><span className="v">¥{fmt(tip.principal)}</span></div>
                            <div className="c"><span className="k">利息</span><span className="v">¥{fmt(tip.interest)}</span></div>
                            <div className="c"><span className="k">月供</span><span className="v">¥{fmt(tip.monthly)}</span></div>
                          </div>
                          <span className="arrow" style={{ left: ar, transform: "translateX(-50%) rotate(45deg)" }} />
                        </div>
                      )
                    })()}
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", flex: "0 0 auto", whiteSpace: "nowrap" }}>
                    已还 {pct.toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", marginTop: 12, gap: 18, fontSize: 11 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="cdot" style={{ background: "var(--accent)", width: 8, height: 8 }} />
                    <span className="dim">已还 {l.paid} 期</span>
                    <b className="mono">¥{fmt(Math.max(0, l.total - l.remain))}</b>
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span className="cdot" style={{ background: "var(--surface-3)", width: 8, height: 8, boxShadow: "inset 0 0 0 1px var(--hair)" }} />
                    <span className="dim">剩 {l.termLeft} 期 · 余本金</span>
                    <b className="mono">¥{fmt(l.remain)}</b>
                  </span>
                  <span className="mono dim" style={{ marginLeft: "auto", whiteSpace: "nowrap" }}>
                    已还 {pct.toFixed(0)}% · 约 {yrsLeft} 年还清
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showForm && (
        <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="wf-modal">
            <div className="wf-head">
              <div>
                <div className="wf-title">{form.id ? "编辑贷款" : "添加贷款"}</div>
                <div className="wf-sub">房贷、车贷或其他分期</div>
              </div>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => setShowForm(false)}>✕</Button>
            </div>
            <div className="wf-body">
              <div className="wf-field nb">
                <div className="wf-flabel">贷款名称</div>
                <Input
                  variant="primary"
                  value={form.name}
                  placeholder="例如：建行房贷"
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">贷款机构</div>
                <Input
                  variant="primary"
                  value={form.institution}
                  placeholder="例如：中国建设银行"
                  onChange={(e) => setForm((f) => ({ ...f, institution: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">贷款本金</div>
                <Input
                  variant="primary"
                  type="number"
                  min="0"
                  step="1000"
                  value={form.principalTotal}
                  placeholder="0"
                  onChange={(e) => setForm((f) => ({ ...f, principalTotal: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">月供金额</div>
                <Input
                  variant="primary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.monthlyPayment}
                  placeholder="0.00"
                  onChange={(e) => setForm((f) => ({ ...f, monthlyPayment: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">年利率 (%)</div>
                <Input
                  variant="primary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.annualRate}
                  placeholder="4.5"
                  onChange={(e) => setForm((f) => ({ ...f, annualRate: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">总期数 (月)</div>
                <Input
                  variant="primary"
                  type="number"
                  min="1"
                  step="1"
                  value={form.termTotal}
                  placeholder="120"
                  onChange={(e) => setForm((f) => ({ ...f, termTotal: e.target.value }))}
                />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">起始日期</div>
                <input className="wf-input" type="date" value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} />
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
