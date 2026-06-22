/**
 * @purpose Render and calculate the loans overview page workflow.
 * @role    Renderer feature surface for future loan obligations.
 * @deps    React, tRPC loan queries, schedule helpers, and UI primitives.
 * @gotcha  Loan plans are forecasts; liabilities in net worth come from asset snapshots.
 */

import "./loans.css"
import { useMemo, useState } from "react"
import { Button } from "@heroui/react"
import { useQuery } from "@tanstack/react-query"
import { useRouterState } from "@mock/_shim/router"
import { ScrollArea } from "../components/ui/ScrollArea"
import { trpc } from "@mock/lib/trpc"
import { usePagePerf } from "@mock/lib/debug/perf"
import { addDays, dateKey } from "@mock/lib/dates"
import { useMoney } from "@mock/lib/useMoney"
import { LoanScheduleBar } from "@mock/components/loans/LoanScheduleBar"
import { buildLoanSchedule } from "./loanSchedule"
import { useCurrentRates } from "@mock/lib/useCurrentRates"
import { currencySymbol } from "@flowm/shared"

// ── Mock router stubs ───────────────────────────────────────────────────────
// The marketing mock router shim only exposes Link + useRouterState. The Loans
// list never navigates in the mock, so we satisfy the verbatim call sites with
// inert local stubs (navigation is a no-op; <Outlet/> is never reached because
// useRouterState below reports the "/loans" pathname).
function useNavigate(): (..._args: unknown[]) => void {
  return () => {}
}
function Outlet(): null {
  return null
}

// ── AddLoanModal stub ───────────────────────────────────────────────────────
// Interaction-only surface. Stubbed to render nothing so the add flow stays inert
// while the default Loans view (header totals + rows + legend) renders 1:1.
function AddLoanModal(_props: {
  open: boolean
  onClose: () => void
  onSave: (form: unknown) => void
}): null {
  return null
}

export function LoansPage() {
  const fmt = useMoney()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const today = dateKey(new Date())
  const futureThrough = dateKey(addDays(new Date(), 60))
  const loansQuery = useQuery(trpc.loans.list.queryOptions({ status: "active" }))
  // Fetch the full occurrence history + forecast so the schedule bar can render every period.
  const loanOccurrencesQuery = useQuery(
    trpc.loans.occurrences.queryOptions({ dateFrom: "1900-01-01", dateTo: "2999-12-31" }),
  )
  const assetSnapshotsQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: true }))
  const futurePressureQuery = useQuery(
    trpc.loans.futurePressure.queryOptions({ dateFrom: today, dateTo: futureThrough }),
  )
  usePagePerf("loans", [
    { name: "loans.list", query: loansQuery },
    { name: "loans.occurrences", query: loanOccurrencesQuery },
    { name: "assets.snapshots.latest", query: assetSnapshotsQuery },
    { name: "loans.futurePressure", query: futurePressureQuery },
  ])

  const { toDisplay, baseSymbol } = useCurrentRates()
  const occurrencesByLoan = useMemo(() => {
    const map = new Map<string, NonNullable<typeof loanOccurrencesQuery.data>>()
    for (const occurrence of loanOccurrencesQuery.data ?? []) {
      const key = String(occurrence.loanId)
      map.set(key, [...(map.get(key) ?? []), occurrence])
    }
    return map
  }, [loanOccurrencesQuery.data])
  const loans = useMemo(
    () =>
      (loansQuery.data ?? []).map((loan) => {
        const occurrences = occurrencesByLoan.get(String(loan.id)) ?? []
        const schedule = buildLoanSchedule(loan, occurrences)
        return {
          id: String(loan.id),
          name: loan.name,
          bank: loan.lender ?? "贷款机构",
          cur: loan.currency,
          remain: schedule.remain,
          total: schedule.total,
          monthly: schedule.monthly,
          rate: schedule.rate,
          termLeft: Math.max(schedule.termTotal - schedule.paid, 0),
          termTotal: schedule.termTotal,
          paid: schedule.paid,
          sched: schedule.sched,
        }
      }),
    [loansQuery.data, occurrencesByLoan],
  )
  const card = useMemo(() => {
    const snapshot = (assetSnapshotsQuery.data ?? []).find(
      (asset) => asset.assetType === "liability" && /信用卡|card/i.test(asset.accountName),
    )
    if (!snapshot) return null
    return {
      name: snapshot.accountName,
      bank: snapshot.note ?? "资产快照",
      label: "最新快照",
      cur: snapshot.valueCurrency,
      remain: Math.abs(Number(snapshot.valueNumber || 0)),
    }
  }, [assetSnapshotsQuery.data])
  // Loans and the card liability may sit in different currencies; convert each to the
  // base currency before summing. Buckets without a rate contribute 0 (see useCurrentRates).
  const totalLiab =
    loans.reduce((sum, loan) => sum + (toDisplay(loan.remain, loan.cur) ?? 0), 0) +
    (card ? (toDisplay(card.remain, card.cur) ?? 0) : 0)
  const totalMonthly = loans.reduce(
    (sum, loan) => sum + (toDisplay(loan.monthly, loan.cur) ?? 0),
    0,
  )
  const monthlyFixed = Number(futurePressureQuery.data?.total ?? 0) || totalMonthly
  const fixedPct = monthlyFixed > 0 ? Math.round((totalMonthly / monthlyFixed) * 100) : 0

  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname !== "/loans") return <Outlet />

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
      {/* Fixed header */}
      <div
        style={{
          flexShrink: 0,
          padding: "28px 32px 16px",
          borderBottom: "1px solid var(--hair-2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 44 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>欠款总额</div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                marginTop: 3,
              }}
            >
              {baseSymbol}
              {fmt(totalLiab)}
            </div>
          </div>
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>每月还款</div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--ink)",
                marginTop: 3,
                letterSpacing: "-0.01em",
              }}
            >
              {baseSymbol}
              {fmt(totalMonthly)}
            </div>
          </div>
          <div style={{ paddingTop: 6 }}>
            <div style={{ fontSize: 11, color: "var(--ink-3)" }}>占每月固定支出</div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--ink)",
                marginTop: 3,
                letterSpacing: "-0.01em",
              }}
            >
              {fixedPct}%
            </div>
          </div>
          <div style={{ marginLeft: "auto", paddingTop: 8 }}>
            <Button
              size="sm"
              variant="primary"
              style={{ borderRadius: 5 }}
              onPress={() => setShowAdd(true)}
            >
              ＋ 添加贷款
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <div
          style={{ padding: "22px 32px 112px", display: "flex", flexDirection: "column", gap: 26 }}
        >
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
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--ink)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      textDecoration: "underline",
                      textDecorationColor: "var(--hair)",
                      textUnderlineOffset: 3,
                    }}
                  >
                    {l.name}
                  </button>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", marginLeft: 8 }}>
                    {l.bank} · {l.rate}% · 月供 {currencySymbol(l.cur)}
                    {fmt(l.monthly)} · 每条 1 期
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 18,
                      fontWeight: 600,
                      marginLeft: "auto",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {currencySymbol(l.cur)}
                    {fmt(l.remain)}
                  </span>
                </div>

                {/* Bars + pct */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <LoanScheduleBar
                    sched={l.sched}
                    paid={l.paid}
                    termTotal={l.termTotal}
                    monthly={l.monthly}
                    symbol={currencySymbol(l.cur)}
                  />

                  {/* Pct label */}
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--accent)",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    已还 {pct.toFixed(0)}%
                  </span>
                </div>

                {/* Legend row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginTop: 12,
                    gap: 18,
                    fontSize: 11,
                  }}
                >
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "var(--accent)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "var(--ink-4)" }}>已还 {l.paid} 期 · 偿本金</span>
                    <b style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                      {currencySymbol(l.cur)}
                      {fmt(paidAmt)}
                    </b>
                  </span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 2,
                        background: "var(--surface-3)",
                        boxShadow: "inset 0 0 0 1px var(--hair)",
                        flexShrink: 0,
                        display: "inline-block",
                      }}
                    />
                    <span style={{ color: "var(--ink-4)" }}>剩 {l.termLeft} 期 · 余本金</span>
                    <b style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                      {currencySymbol(l.cur)}
                      {fmt(l.remain)}
                    </b>
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color: "var(--ink-4)",
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
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
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "14px 0",
                borderTop: "1px solid var(--hair-2)",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
                {card.name}
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                {card.bank} · {card.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 16,
                  fontWeight: 600,
                  marginLeft: "auto",
                  letterSpacing: "-0.02em",
                }}
              >
                {currencySymbol(card.cur)}
                {fmt(card.remain)}
              </span>
            </div>
          )}
        </div>
      </ScrollArea>

      <AddLoanModal open={showAdd} onClose={() => setShowAdd(false)} onSave={() => {}} />
    </div>
  )
}
