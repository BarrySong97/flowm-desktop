import React, { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@heroui/react"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { trpc } from "@/lib/trpc"
import { Route } from "../routes/loans.$id"
import { LoanScheduleBar } from "./LoanScheduleBar"
import { buildLoanSchedule } from "./loanSchedule"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid var(--hair-3)", gap: 12 }}>
      <span style={{ fontSize: 12, color: "var(--ink-4)", width: 80, flexShrink: 0, paddingTop: 1 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>{children}</span>
    </div>
  )
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

const REPAYMENT_LABEL: Record<string, string> = {
  equal_installment: "等额本息",
  equal_principal: "等额本金",
}

export function LoanDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const loanQuery = useQuery(trpc.loans.get.queryOptions({ id }))
  // Same wide window as the loans list so the schedule bar matches exactly.
  const occurrencesQuery = useQuery(trpc.loans.occurrences.queryOptions({ loanId: id as any, dateFrom: "1900-01-01", dateTo: "2999-12-31" }))

  const loan = loanQuery.data

  const loanOccs = useMemo(() => occurrencesQuery.data ?? [], [occurrencesQuery.data])
  const schedule = useMemo(() => (loan ? buildLoanSchedule(loan, loanOccs) : null), [loan, loanOccs])

  const principal = loan ? parseFloat(loan.principalAmount ?? "0") : 0
  const currentPrincipal = loan ? parseFloat(loan.currentPrincipalEstimate ?? loan.principalAmount ?? "0") : 0
  const monthly = schedule?.monthly ?? 0
  const ratePct = loan?.annualRateBps != null ? loan.annualRateBps / 100 : null
  const termMonths = schedule?.termTotal ?? 0
  const paidMonths = schedule?.paid ?? 0
  const repaymentLabel = loan?.repaymentMethod ? (REPAYMENT_LABEL[loan.repaymentMethod] ?? loan.repaymentMethod) : null

  const termLeft = Math.max(0, termMonths - paidMonths)
  const paidAmt = principal - currentPrincipal
  const paidPct = termMonths > 0 ? (paidMonths / termMonths) * 100 : 0
  const clearDate = loan ? addMonths(loan.startDate, termMonths) : null

  const nextOccurrence = useMemo(() => {
    if (!loan) return null
    return loanOccs
      .filter((o) => o.dueDate >= today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
  }, [loanOccs, loan, today])

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: "28px 32px 112px" }}>

          {/* Back button */}
          <button
            onClick={() => navigate({ to: "/loans" })}
            style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              fontSize: 12, color: "var(--ink-4)", background: "none", border: "none",
              cursor: "pointer", padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            返回负债
          </button>

          {/* Centered content */}
          <div style={{ maxWidth: 680, margin: "20px auto 0" }}>

            {loanQuery.isPending && (
              <div style={{ fontSize: 13, color: "var(--ink-4)" }}>加载中…</div>
            )}

            {loanQuery.isError && (
              <div style={{ fontSize: 13, color: "var(--red)" }}>
                加载失败：{loanQuery.error?.message ?? "未知错误"}
              </div>
            )}

            {!loanQuery.isPending && !loanQuery.isError && !loan && (
              <div style={{ fontSize: 13, color: "var(--ink-4)" }}>未找到该贷款（id: {id}）</div>
            )}

            {loan && (
              <>
                {/* Header section */}
                {/* Row 1: kicker left + "剩余本金" right */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: "var(--accent)", flexShrink: 0,
                    }} />
                    <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                      负债{repaymentLabel ? ` · ${repaymentLabel}` : ""}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>剩余本金</span>
                </div>

                {/* Row 2: loan name left + remaining principal right */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginTop: 4 }}>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.15 }}>
                    {loan.name}
                  </div>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 32, fontWeight: 700, color: "var(--red)", letterSpacing: "-0.02em", flexShrink: 0 }}>
                    ¥{fmt(currentPrincipal)}
                  </div>
                </div>

                {/* Row 3: subtitle */}
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 4 }}>
                  {loan.lender ? `${loan.lender}` : ""}
                  {loan.lender && ratePct != null ? " · " : ""}
                  {ratePct != null ? `年利率 ${ratePct.toFixed(2)}%` : ""}
                </div>

                {/* Progress section */}
                <div style={{ marginTop: 20 }}>
                  {/* Row: label left + paid/total right */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                      还款进度&nbsp;&nbsp;每条 1 期 · 共 {termMonths} 期
                    </span>
                    <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                      已还 ¥{fmt(paidAmt)} / {fmt(principal)}
                    </span>
                  </div>

                  {/* Segmented progress bar — same interactive bar as the loans list */}
                  <div style={{ marginTop: 10 }}>
                    {schedule && (
                      <div style={{ display: "flex" }}>
                        <LoanScheduleBar
                          sched={schedule.sched}
                          paid={paidMonths}
                          termTotal={termMonths}
                          monthly={monthly}
                        />
                      </div>
                    )}

                    {/* Percentage badge */}
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 4 }}>
                      <span style={{ fontSize: 10.5, color: "var(--accent)", fontWeight: 600 }}>
                        已还 {paidPct.toFixed(1)}%
                      </span>
                    </div>

                    {/* Below bar detail */}
                    <div style={{ marginTop: 8, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
                      <span style={{ marginRight: 8 }}>● 已还 {paidMonths}期 · 本金 ¥{fmt(paidAmt)}</span>
                      <span>□ 剩 {termLeft}期 · 余本金 ¥{fmt(currentPrincipal)} · 预计结清 {clearDate}</span>
                    </div>
                  </div>
                </div>

                {/* Next payment card */}
                {nextOccurrence && (
                  <div style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--hair-2)",
                    borderRadius: 10,
                    padding: "14px 16px",
                    marginTop: 16,
                  }}>
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                        下次还款 · {nextOccurrence.dueDate}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "right" }}>
                        {[loan.lender, loan.paymentDay != null ? `每月 ${loan.paymentDay} 日` : null]
                          .filter(Boolean).join(" · ")}
                      </span>
                    </div>

                    {/* Large amount */}
                    <div style={{
                      fontFamily: "var(--mono)",
                      fontSize: 28,
                      fontWeight: 700,
                      letterSpacing: "-0.02em",
                      color: "var(--ink)",
                      marginTop: 8,
                    }}>
                      ¥{fmt(parseFloat(nextOccurrence.paymentAmount))}
                    </div>
                  </div>
                )}

                {/* Thin divider */}
                <div style={{ borderTop: "1px solid var(--hair-2)", marginTop: 16 }} />

                {/* Info rows */}
                <InfoRow label="月供">¥{fmt(monthly, 2)}</InfoRow>
                {ratePct != null && <InfoRow label="年利率">{ratePct.toFixed(2)}%</InfoRow>}
                {termLeft > 0 && (
                  <InfoRow label="剩余期数">{termLeft} 期 · 约 {(termLeft / 12).toFixed(1)} 年</InfoRow>
                )}
                {repaymentLabel && <InfoRow label="还款方式">{repaymentLabel}</InfoRow>}
                <InfoRow label="起始日期">{loan.startDate}</InfoRow>
                {loan.lender && <InfoRow label="贷款方">{loan.lender}</InfoRow>}
                {loan.paymentDay != null && <InfoRow label="还款日">每月 {loan.paymentDay} 号</InfoRow>}
                {loan.note && <InfoRow label="备注">{loan.note}</InfoRow>}

                {/* Footer note */}
                <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.7 }}>
                  月供计入每月固定支出，与净资产中的负债同步。提前还款可减少利息，结清后从负债移除。
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 28, alignItems: "center" }}>
                  <Button size="sm" variant="primary" style={{ borderRadius: 5 }}>提前还款</Button>
                  <Button size="sm" variant="outline" style={{ borderRadius: 5 }}>编辑</Button>
                  <div style={{ flex: 1 }} />
                  <Button size="sm" variant="ghost" style={{ borderRadius: 5, color: "var(--red)" }}>标记结清</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
      <Dock />
    </div>
  )
}
