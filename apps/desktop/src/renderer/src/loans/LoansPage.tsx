import { useMemo, useState } from "react"
import { Button, Label, Modal } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { LoanScheduleBar } from "./LoanScheduleBar"
import { buildLoanSchedule } from "./loanSchedule"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

type LoanForm = { name: string; bank: string; principal: string; monthly: string; rate: string; termTotal: string; startDate: string }
const EMPTY_FORM: LoanForm = { name: "", bank: "", principal: "", monthly: "", rate: "4.5", termTotal: "120", startDate: new Date().toISOString().slice(0, 10) }

const inputStyle: React.CSSProperties = {
  width: "100%", font: "500 14px var(--sans)", color: "var(--ink)",
  padding: "10px 12px", border: "1px solid var(--hair)", borderRadius: 9,
  background: "var(--surface)", outline: "none", boxSizing: "border-box",
}

function AddLoanModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (form: LoanForm) => void }) {
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
            <Button
              variant="primary"
              style={{ borderRadius: 5 }}
              isDisabled={!form.name.trim() || !form.monthly}
              onPress={() => {
                onSave(form)
                handleClose()
              }}
            >
              保存
            </Button>
            <Button variant="outline" style={{ borderRadius: 5 }} slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

export function LoansPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const today = dateKey(new Date())
  const futureThrough = dateKey(addDays(new Date(), 60))
  const loansQuery = useQuery(trpc.loans.list.queryOptions({ status: "active" }))
  // Fetch the full occurrence history + forecast so the schedule bar can render every period.
  const loanOccurrencesQuery = useQuery(trpc.loans.occurrences.queryOptions({ dateFrom: "1900-01-01", dateTo: "2999-12-31" }))
  const assetSnapshotsQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: true }))
  const futurePressureQuery = useQuery(trpc.loans.futurePressure.queryOptions({ dateFrom: today, dateTo: futureThrough }))
  usePagePerf("loans", [
    { name: "loans.list", query: loansQuery },
    { name: "loans.occurrences", query: loanOccurrencesQuery },
    { name: "assets.snapshots.latest", query: assetSnapshotsQuery },
    { name: "loans.futurePressure", query: futurePressureQuery },
  ])
  const generateOccurrences = useMutation(trpc.loans.generateOccurrences.mutationOptions())
  const createLoan = useMutation(trpc.loans.create.mutationOptions({
    onSuccess: async (loan) => {
      await generateOccurrences.mutateAsync({ id: loan.id, throughDate: futureThrough })
      await queryClient.invalidateQueries(trpc.loans.list.queryFilter())
      await queryClient.invalidateQueries(trpc.loans.occurrences.queryFilter())
      await queryClient.invalidateQueries(trpc.loans.futurePressure.queryFilter())
    },
  }))

  const occurrencesByLoan = useMemo(() => {
    const map = new Map<string, NonNullable<typeof loanOccurrencesQuery.data>>()
    for (const occurrence of loanOccurrencesQuery.data ?? []) {
      const key = String(occurrence.loanId)
      map.set(key, [...(map.get(key) ?? []), occurrence])
    }
    return map
  }, [loanOccurrencesQuery.data])
  const loans = useMemo(() => (loansQuery.data ?? []).map((loan) => {
    const occurrences = occurrencesByLoan.get(String(loan.id)) ?? []
    const schedule = buildLoanSchedule(loan, occurrences)
    return {
      id: String(loan.id),
      name: loan.name,
      bank: loan.lender ?? "贷款机构",
      remain: schedule.remain,
      total: schedule.total,
      monthly: schedule.monthly,
      rate: schedule.rate,
      termLeft: Math.max(schedule.termTotal - schedule.paid, 0),
      termTotal: schedule.termTotal,
      paid: schedule.paid,
      sched: schedule.sched,
    }
  }), [loansQuery.data, occurrencesByLoan])
  const card = useMemo(() => {
    const snapshot = (assetSnapshotsQuery.data ?? []).find((asset) =>
      asset.assetType === "liability" && /信用卡|card/i.test(asset.accountName),
    )
    if (!snapshot) return null
    return {
      name: snapshot.accountName,
      bank: snapshot.note ?? "资产快照",
      label: "最新快照",
      remain: Math.abs(Number(snapshot.valueNumber || 0)),
    }
  }, [assetSnapshotsQuery.data])
  const totalLiab = loans.reduce((sum, loan) => sum + loan.remain, 0) + (card?.remain ?? 0)
  const totalMonthly = loans.reduce((sum, loan) => sum + loan.monthly, 0)
  const monthlyFixed = Number(futurePressureQuery.data?.total ?? 0) || totalMonthly
  const fixedPct = monthlyFixed > 0 ? Math.round(totalMonthly / monthlyFixed * 100) : 0

  function handleSave(form: LoanForm) {
    const principal = Math.abs(Number(form.principal) || 0)
    const monthly = Math.abs(Number(form.monthly) || 0)
    createLoan.mutate({
      name: form.name.trim(),
      lender: form.bank.trim() || null,
      principalAmount: principal.toFixed(2),
      currentPrincipalEstimate: principal.toFixed(2),
      annualRateBps: Math.round((Number(form.rate) || 0) * 100),
      paymentAmount: monthly.toFixed(2),
      paymentDay: Number(form.startDate.slice(8, 10)),
      startDate: form.startDate,
      termMonths: Math.max(Number(form.termTotal) || 1, 1),
    })
    setShowAdd(false)
  }

  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname !== "/loans") return <Outlet />

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
        {loans.map((l) => {
          const pct = (l.paid / l.termTotal) * 100
          const yrsLeft = (l.termLeft / 12).toFixed(1)
          const paidAmt = l.total - l.remain

          return (
            <div key={l.id}>
              {/* Title row */}
              <div style={{ display: "flex", alignItems: "baseline", marginBottom: 12 }}>
                <button
                  onClick={() => navigate({ to: "/loans/$id", params: { id: String(l.id) } })}
                  style={{
                    fontSize: 14, fontWeight: 600, color: "var(--ink)", background: "none",
                    border: "none", cursor: "pointer", padding: 0, textDecoration: "underline",
                    textDecorationColor: "var(--hair)", textUnderlineOffset: 3,
                  }}
                >
                  {l.name}
                </button>
                <span style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 8 }}>
                  {l.bank} · {l.rate}% · 月供 ¥{fmt(l.monthly)} · 每条 1 期
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 18, fontWeight: 600, marginLeft: "auto", letterSpacing: "-0.02em" }}>
                  ¥{fmt(l.remain)}
                </span>
              </div>

              {/* Bars + pct */}
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <LoanScheduleBar sched={l.sched} paid={l.paid} termTotal={l.termTotal} monthly={l.monthly} />

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
        {loans.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--ink-4)", lineHeight: 1.7 }}>
            暂无贷款计划。添加贷款后，这里会显示未来还款节奏；资产负债仍以资产快照为准。
          </div>
        )}

        {card && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid var(--hair-2)" }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{card.name}</span>
            <span style={{ fontSize: 11, color: "var(--ink-4)" }}>{card.bank} · {card.label}</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 600, marginLeft: "auto", letterSpacing: "-0.02em" }}>
              ¥{fmt(card.remain)}
            </span>
          </div>
        )}
      </div>
      </ScrollArea>

      <Dock />
      <AddLoanModal open={showAdd} onClose={() => setShowAdd(false)} onSave={handleSave} />
    </div>
  )
}
