import { useState } from "react"
import { Button, Label, Modal } from "@heroui/react"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

interface Loan {
  id: string; name: string; bank: string
  remain: number; total: number; monthly: number
  rate: number; termLeft: number; termTotal: number
}

const RAW_LOANS: Loan[] = [
  { id: "mortgage", name: "商业房贷", bank: "招商银行",  remain: 1820000, total: 2480000, monthly: 9850,  rate: 4.15, termLeft: 246, termTotal: 360 },
  { id: "consume",  name: "消费贷",   bank: "招联金融",  remain: 45000,   total: 80000,   monthly: 2180,  rate: 5.40, termLeft: 22,  termTotal: 36  },
  { id: "car",      name: "车贷",     bank: "平安银行",  remain: 62000,   total: 120000,  monthly: 2350,  rate: 3.85, termLeft: 28,  termTotal: 48  },
  { id: "edu",      name: "教育贷款", bank: "中国银行",  remain: 18000,   total: 30000,   monthly: 680,   rate: 4.75, termLeft: 28,  termTotal: 48  },
  { id: "biz",      name: "经营贷",   bank: "工商银行",  remain: 280000,  total: 300000,  monthly: 5200,  rate: 3.60, termLeft: 55,  termTotal: 60  },
]
const CARD = { name: "信用卡待还", bank: "招商银行", label: "本期账单", remain: 8640 }

function buildSched(loan: Loan) {
  const r = loan.rate / 100 / 12
  let bal = loan.total
  const sched: { interest: number; principal: number }[] = []
  for (let k = 0; k < loan.termTotal; k++) {
    const interest = bal * r
    const principal = Math.max(loan.monthly - interest, 0)
    bal = Math.max(0, bal - principal)
    sched.push({ interest, principal })
  }
  return sched
}

const LOANS = RAW_LOANS.map((l) => ({ ...l, paid: l.termTotal - l.termLeft, sched: buildSched(l) }))

const totalLiab = RAW_LOANS.reduce((s, l) => s + l.remain, 0) + CARD.remain
const totalMonthly = RAW_LOANS.reduce((s, l) => s + l.monthly, 0)
const monthlyFixed = totalMonthly + 557 // subs monthly
const fixedPct = Math.round(totalMonthly / monthlyFixed * 100)

type Tip = { li: number; k: number; principal: number; interest: number; monthly: number; paid: boolean; left: number; gw: number } | null

type LoanForm = { name: string; bank: string; principal: string; monthly: string; rate: string; termTotal: string; startDate: string }
const EMPTY_FORM: LoanForm = { name: "", bank: "", principal: "", monthly: "", rate: "4.5", termTotal: "120", startDate: "2026-06-11" }

const inputStyle: React.CSSProperties = {
  width: "100%", font: "500 14px var(--sans)", color: "var(--ink)",
  padding: "10px 12px", border: "1px solid var(--hair)", borderRadius: 9,
  background: "var(--surface)", outline: "none", boxSizing: "border-box",
}

function AddLoanModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState<LoanForm>(EMPTY_FORM)
  function patch(p: Partial<LoanForm>) { setForm((f) => ({ ...f, ...p })) }
  function handleClose() { setForm(EMPTY_FORM); onClose() }

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 440 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>添加贷款</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>房贷、车贷或其他分期</p>
          </Modal.Header>
          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>贷款名称</Label>
                <input style={inputStyle} placeholder="例如：建行房贷" value={form.name} onChange={(e) => patch({ name: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>贷款机构</Label>
                <input style={inputStyle} placeholder="例如：中国建设银行" value={form.bank} onChange={(e) => patch({ bank: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>贷款本金</Label>
                <input style={inputStyle} type="number" min="0" step="1000" placeholder="0" value={form.principal} onChange={(e) => patch({ principal: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>月供金额</Label>
                <input style={inputStyle} type="number" min="0" step="0.01" placeholder="0.00" value={form.monthly} onChange={(e) => patch({ monthly: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>年利率 (%)</Label>
                <input style={inputStyle} type="number" min="0" step="0.01" placeholder="4.5" value={form.rate} onChange={(e) => patch({ rate: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>总期数 (月)</Label>
                <input style={inputStyle} type="number" min="1" step="1" placeholder="120" value={form.termTotal} onChange={(e) => patch({ termTotal: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>起始日期</Label>
                <input style={inputStyle} type="date" value={form.startDate} onChange={(e) => patch({ startDate: e.target.value })} />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" style={{ borderRadius: 5 }} isDisabled={!form.name.trim() || !form.monthly} onPress={handleClose}>保存</Button>
            <Button variant="outline" style={{ borderRadius: 5 }} slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export function LoansPage() {
  const [tip, setTip] = useState<Tip>(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>
      {/* Fixed header */}
      <div style={{ flexShrink: 0, padding: "28px 32px 16px", borderBottom: "1px solid var(--hair-2)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 44 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>欠款总额</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 34, fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", marginTop: 3 }}>
            ¥{fmt(totalLiab)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>每月还款</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
            ¥{fmt(totalMonthly)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>占每月固定支出</div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, color: "var(--ink)", marginTop: 3, letterSpacing: "-0.01em" }}>
            {fixedPct}%
          </div>
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 8 }}>
          <Button size="sm" variant="primary" style={{ borderRadius: 5 }} onPress={() => setShowAdd(true)}>＋ 添加贷款</Button>
        </div>
      </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
      <div style={{ padding: "22px 32px 112px", display: "flex", flexDirection: "column", gap: 26 }}>
        {LOANS.map((l, li) => {
          const pct = (l.paid / l.termTotal) * 100
          const yrsLeft = (l.termLeft / 12).toFixed(1)
          const paidAmt = l.total - l.remain

          return (
            <div key={l.id}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{l.name}</span>
                <span style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 8 }}>
                  {l.bank} · {l.rate}% · 月供 ¥{fmt(l.monthly)} · 每条 1 期
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, marginLeft: "auto", letterSpacing: "-0.02em" }}>
                  ¥{fmt(l.remain)}
                </span>
              </div>

              {/* Bars + pct */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{ position: "relative", display: "flex", gap: 2, height: 42, flex: 1, alignItems: "stretch" }}
                  onMouseLeave={() => setTip(null)}
                >
                  {l.sched.map((s, k) => {
                    const isPaid = k < l.paid
                    const isCur  = k === l.paid - 1
                    const isHov  = tip?.li === li && tip.k === k
                    return (
                      <div
                        key={k}
                        style={{
                          flex: "1 1 0", minWidth: 0, borderRadius: 2, cursor: "pointer",
                          background: isPaid ? "var(--accent)" : "var(--surface-3)",
                          boxShadow: isCur
                            ? "0 0 0 2px var(--surface), 0 0 0 3.5px var(--accent)"
                            : isPaid ? "none" : "inset 0 0 0 1px var(--hair)",
                          zIndex: isCur ? 2 : isHov ? 3 : undefined,
                          transform: isHov ? "scaleY(1.12)" : undefined,
                          outline: isHov ? "1.5px solid var(--ink)" : undefined,
                          outlineOffset: isHov ? 0 : undefined,
                          transition: "transform .08s",
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget
                          const gw = el.parentElement?.offsetWidth ?? 0
                          setTip({ li, k, principal: s.principal, interest: s.interest, monthly: l.monthly, paid: isPaid, left: el.offsetLeft + el.offsetWidth / 2, gw })
                        }}
                      />
                    )
                  })}

                  {/* Tooltip */}
                  {tip?.li === li && (() => {
                    const al = tip.left > tip.gw * 0.8 ? "r" : tip.left < tip.gw * 0.2 ? "l" : "c"
                    const tf = (al === "r" ? "translate(-100%,-100%)" : al === "l" ? "translate(0,-100%)" : "translate(-50%,-100%)") + " translateY(-9px)"
                    const arLeft = al === "r" ? "calc(100% - 14px)" : al === "l" ? "10px" : "50%"
                    return (
                      <div style={{
                        position: "absolute", left: tip.left, top: 0, transform: tf,
                        zIndex: 30, pointerEvents: "none",
                        background: "var(--ink)", color: "var(--surface)",
                        borderRadius: 8, padding: "8px 12px", whiteSpace: "nowrap",
                      }}>
                        <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.65, marginBottom: 5, letterSpacing: ".03em" }}>
                          第 {tip.k + 1} / {l.termTotal} 期 · {tip.paid ? "已还" : "未还"}
                        </div>
                        <div style={{ display: "flex", gap: 16 }}>
                          {[["本金", tip.principal], ["利息", tip.interest], ["月供", tip.monthly]].map(([label, val]) => (
                            <div key={label as string} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                              <span style={{ fontSize: 9, fontWeight: 500, opacity: 0.6 }}>{label}</span>
                              <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600 }}>¥{fmt(val as number)}</span>
                            </div>
                          ))}
                        </div>
                        <span style={{
                          position: "absolute", bottom: -4, left: arLeft,
                          transform: "translateX(-50%) rotate(45deg)",
                          width: 8, height: 8, background: "var(--ink)",
                        }} />
                      </div>
                    )
                  })()}
                </div>

                {/* Pct label */}
                <span style={{
                  fontFamily: "var(--mono)", fontSize: 13, fontWeight: 600,
                  color: "var(--accent)", flexShrink: 0, whiteSpace: "nowrap",
                }}>
                  已还 {pct.toFixed(0)}%
                </span>
              </div>

              {/* Legend row */}
              <div style={{ display: "flex", alignItems: "center", marginTop: 12, gap: 18, fontSize: 11 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--accent)", flexShrink: 0, display: "inline-block" }} />
                  <span style={{ color: "var(--ink-4)" }}>已还 {l.paid} 期 · 偿本金</span>
                  <b style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>¥{fmt(paidAmt)}</b>
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: "var(--surface-3)", boxShadow: "inset 0 0 0 1px var(--hair)", flexShrink: 0, display: "inline-block" }} />
                  <span style={{ color: "var(--ink-4)" }}>剩 {l.termLeft} 期 · 余本金</span>
                  <b style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>¥{fmt(l.remain)}</b>
                </span>
                <span style={{ fontFamily: "var(--mono)", color: "var(--ink-4)", marginLeft: "auto", whiteSpace: "nowrap" }}>
                  已还 {pct.toFixed(0)}% · 约 {yrsLeft} 年还清
                </span>
              </div>
            </div>
          )
        })}

        {/* Credit card row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid var(--hair-2)" }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{CARD.name}</span>
          <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{CARD.bank} · {CARD.label}</span>
          <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, marginLeft: "auto", letterSpacing: "-0.02em" }}>
            ¥{fmt(CARD.remain)}
          </span>
        </div>
      </div>
      </ScrollArea>

      <Dock />
      <AddLoanModal open={showAdd} onClose={() => setShowAdd(false)} />
    </div>
  )
}
