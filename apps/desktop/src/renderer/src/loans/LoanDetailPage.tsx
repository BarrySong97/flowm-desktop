/**
 * @purpose Render and calculate the loan detail page workflow.
 * @role    Renderer feature surface for future loan obligations.
 * @deps    React, tRPC loan queries, schedule helpers, and UI primitives.
 * @gotcha  Loan plans are forecasts; liabilities in net worth come from asset snapshots.
 */

import React, { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Button, Input, Modal } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import { CurrencySelect } from "../components/ui/CurrencySelect"
import { currencySymbol } from "@flowm/shared"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { useConfirm } from "../components/ui/ConfirmModal"
import { trpc } from "@/lib/trpc"
import { addMonths, todayKey } from "@/lib/dates"
import { formatNumber } from "@/lib/format"
import { Route } from "../routes/loans.$id"
import { LoanScheduleBar } from "./LoanScheduleBar"
import { buildLoanSchedule } from "./loanSchedule"
import { FormField } from "../components/ui/FormField"

const fmt = formatNumber

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        padding: "10px 0",
        borderBottom: "1px solid var(--hair-3)",
        gap: 12,
      }}
    >
      <span
        style={{ fontSize: 12, color: "var(--ink-4)", width: 80, flexShrink: 0, paddingTop: 1 }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12, color: "var(--ink-2)", flex: 1 }}>{children}</span>
    </div>
  )
}

const REPAYMENT_LABEL: Record<string, string> = {
  equal_installment: "等额本息",
  equal_principal: "等额本金",
}

export function LoanDetailPage() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [prepaying, setPrepaying] = useState(false)
  const archiveLoan = useMutation(trpc.loans.archive.mutationOptions())
  const updateLoan = useMutation(trpc.loans.update.mutationOptions())
  const today = todayKey()

  const loanQuery = useQuery(trpc.loans.get.queryOptions({ id }))
  // Same wide window as the loans list so the schedule bar matches exactly.
  const occurrencesQuery = useQuery(
    trpc.loans.occurrences.queryOptions({
      loanId: id as any,
      dateFrom: "1900-01-01",
      dateTo: "2999-12-31",
    }),
  )

  const loan = loanQuery.data
  // Loan amounts are shown in the loan's own currency (single-currency entity).
  const curSym = currencySymbol(loan?.currency ?? "CNY")
  const editForm = useForm({
    values: {
      name: loan?.name ?? "",
      lender: loan?.lender ?? "",
      principalAmount: loan?.principalAmount ?? "",
      currentPrincipalEstimate: loan?.currentPrincipalEstimate ?? loan?.principalAmount ?? "",
      paymentAmount: loan?.paymentAmount ?? "",
      annualRate: loan?.annualRateBps == null ? "" : String(loan.annualRateBps / 100),
      termMonths: loan?.termMonths == null ? "" : String(loan.termMonths),
      startDate: loan?.startDate ?? todayKey(),
      note: loan?.note ?? "",
      cur: loan?.currency ?? "CNY",
    },
  })
  const prepayForm = useForm({ values: { amount: "" } })

  const loanOccs = useMemo(() => occurrencesQuery.data ?? [], [occurrencesQuery.data])
  const schedule = useMemo(
    () => (loan ? buildLoanSchedule(loan, loanOccs) : null),
    [loan, loanOccs],
  )

  const principal = loan ? parseFloat(loan.principalAmount ?? "0") : 0
  const currentPrincipal = loan
    ? parseFloat(loan.currentPrincipalEstimate ?? loan.principalAmount ?? "0")
    : 0
  const monthly = schedule?.monthly ?? 0
  const ratePct = loan?.annualRateBps != null ? loan.annualRateBps / 100 : null
  const termMonths = schedule?.termTotal ?? 0
  const paidMonths = schedule?.paid ?? 0
  const repaymentLabel = loan?.repaymentMethod
    ? (REPAYMENT_LABEL[loan.repaymentMethod] ?? loan.repaymentMethod)
    : null

  const termLeft = Math.max(0, termMonths - paidMonths)
  const paidAmt = principal - currentPrincipal
  const paidPct = termMonths > 0 ? (paidMonths / termMonths) * 100 : 0
  const clearDate = loan ? addMonths(loan.startDate, termMonths) : null

  const nextOccurrence = useMemo(() => {
    if (!loan) return null
    return (
      loanOccs
        .filter((o) => o.dueDate >= today)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
    )
  }, [loanOccs, loan, today])

  async function refreshLoanViews() {
    await queryClient.invalidateQueries(trpc.loans.list.queryFilter())
    await queryClient.invalidateQueries(trpc.loans.occurrences.queryFilter())
    await queryClient.invalidateQueries(trpc.loans.futurePressure.queryFilter())
  }

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
      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <div style={{ padding: "28px 32px 112px" }}>
          {/* Back button */}
          <button
            onClick={() => navigate({ to: "/loans" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              fontSize: 12,
              color: "var(--ink-4)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M9 2L4 7L9 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
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
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--accent)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                      负债{repaymentLabel ? ` · ${repaymentLabel}` : ""}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--ink-4)" }}>剩余本金</span>
                </div>

                {/* Row 2: loan name left + remaining principal right */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{ fontSize: 28, fontWeight: 700, color: "var(--ink)", lineHeight: 1.15 }}
                  >
                    {loan.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 32,
                      fontWeight: 700,
                      color: "var(--red)",
                      letterSpacing: "-0.02em",
                      flexShrink: 0,
                    }}
                  >
                    {curSym}
                    {fmt(currentPrincipal)}
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                      还款进度&nbsp;&nbsp;每条 1 期 · 共 {termMonths} 期
                    </span>
                    <span style={{ fontSize: 11.5, color: "var(--ink-3)" }}>
                      已还 {curSym}
                      {fmt(paidAmt)} / {fmt(principal)}
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
                          symbol={curSym}
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
                    <div
                      style={{ marginTop: 8, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}
                    >
                      <span style={{ marginRight: 8 }}>
                        ● 已还 {paidMonths}期 · 本金 {curSym}
                        {fmt(paidAmt)}
                      </span>
                      <span>
                        □ 剩 {termLeft}期 · 余本金 {curSym}
                        {fmt(currentPrincipal)} · 预计结清 {clearDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Next payment card */}
                {nextOccurrence && (
                  <div
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid var(--hair-2)",
                      borderRadius: 10,
                      padding: "14px 16px",
                      marginTop: 16,
                    }}
                  >
                    {/* Top row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                        下次还款 · {nextOccurrence.dueDate}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--ink-4)", textAlign: "right" }}>
                        {[
                          loan.lender,
                          loan.paymentDay != null ? `每月 ${loan.paymentDay} 日` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    </div>

                    {/* Large amount */}
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 28,
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        color: "var(--ink)",
                        marginTop: 8,
                      }}
                    >
                      {curSym}
                      {fmt(parseFloat(nextOccurrence.paymentAmount))}
                    </div>
                  </div>
                )}

                {/* Thin divider */}
                <div style={{ borderTop: "1px solid var(--hair-2)", marginTop: 16 }} />

                {/* Info rows */}
                <InfoRow label="月供">
                  {curSym}
                  {fmt(monthly, 2)}
                </InfoRow>
                {ratePct != null && <InfoRow label="年利率">{ratePct.toFixed(2)}%</InfoRow>}
                {termLeft > 0 && (
                  <InfoRow label="剩余期数">
                    {termLeft} 期 · 约 {(termLeft / 12).toFixed(1)} 年
                  </InfoRow>
                )}
                {repaymentLabel && <InfoRow label="还款方式">{repaymentLabel}</InfoRow>}
                <InfoRow label="起始日期">{loan.startDate}</InfoRow>
                {loan.lender && <InfoRow label="贷款方">{loan.lender}</InfoRow>}
                {loan.paymentDay != null && (
                  <InfoRow label="还款日">每月 {loan.paymentDay} 号</InfoRow>
                )}
                {loan.note && <InfoRow label="备注">{loan.note}</InfoRow>}

                {/* Footer note */}
                <div
                  style={{ marginTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.7 }}
                >
                  月供计入每月固定支出，与净资产中的负债同步。提前还款可减少利息，结清后从负债移除。
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, marginTop: 28, alignItems: "center" }}>
                  <Button
                    size="sm"
                    variant="primary"
                    style={{ borderRadius: 5 }}
                    onPress={() => setPrepaying(true)}
                  >
                    提前还款
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    style={{ borderRadius: 5 }}
                    onPress={() => setEditing(true)}
                  >
                    编辑
                  </Button>
                  <div style={{ flex: 1 }} />
                  <Button
                    size="sm"
                    variant="ghost"
                    style={{ borderRadius: 5, color: "var(--red)" }}
                    onPress={() =>
                      confirm({
                        title: "标记结清",
                        description: `将「${loan.name}」标记为已结清后，它会从贷款列表移除。确定继续？`,
                        confirmText: "标记结清",
                        danger: true,
                        onConfirm: async () => {
                          await archiveLoan.mutateAsync({ id })
                          await refreshLoanViews()
                          navigate({ to: "/loans" })
                        },
                      })
                    }
                  >
                    标记结清
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </ScrollArea>
      <Modal.Backdrop
        isOpen={editing}
        onOpenChange={(v) => {
          if (!v) setEditing(false)
        }}
      >
        <Modal.Container>
          <Modal.Dialog style={{ maxWidth: 440 }}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>编辑贷款</Modal.Heading>
              <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
                修改贷款计划，不会自动改变净资产负债快照
              </p>
            </Modal.Header>
            <Modal.Body>
              <form
                id="loan-edit-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void editForm.handleSubmit(async (values) => {
                    await updateLoan.mutateAsync({
                      id,
                      name: values.name.trim(),
                      lender: values.lender.trim() || null,
                      principalAmount: values.principalAmount
                        ? Math.abs(Number(values.principalAmount)).toFixed(2)
                        : null,
                      currentPrincipalEstimate: values.currentPrincipalEstimate
                        ? Math.abs(Number(values.currentPrincipalEstimate)).toFixed(2)
                        : null,
                      paymentAmount: Math.abs(Number(values.paymentAmount) || 0).toFixed(2),
                      annualRateBps: values.annualRate
                        ? Math.round(Number(values.annualRate) * 100)
                        : null,
                      termMonths: values.termMonths ? Math.max(Number(values.termMonths), 1) : null,
                      startDate: values.startDate,
                      note: values.note.trim() || null,
                      currency: values.cur,
                    })
                    await refreshLoanViews()
                    setEditing(false)
                  })()
                }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <FormField
                  label="贷款名称"
                  required
                  error={editForm.formState.errors.name?.message}
                >
                  <Input
                    variant="secondary"
                    {...editForm.register("name", {
                      validate: (value) => value.trim().length > 0 || "请输入贷款名称",
                    })}
                  />
                </FormField>
                <FormField label="贷款机构">
                  <Input variant="secondary" {...editForm.register("lender")} />
                </FormField>
                <FormField label="贷款本金">
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="1000"
                    {...editForm.register("principalAmount")}
                  />
                </FormField>
                <FormField label="当前本金估算">
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="0.01"
                    {...editForm.register("currentPrincipalEstimate")}
                  />
                </FormField>
                <FormField label="币种">
                  <Controller
                    control={editForm.control}
                    name="cur"
                    render={({ field }) => (
                      <CurrencySelect value={field.value} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField
                  label="月供金额"
                  required
                  error={editForm.formState.errors.paymentAmount?.message}
                >
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="0.01"
                    {...editForm.register("paymentAmount", {
                      validate: (value) =>
                        (String(value).trim().length > 0 && Number(value) > 0) ||
                        "请输入大于 0 的月供",
                    })}
                  />
                </FormField>
                <FormField label="年利率 (%)">
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="0.01"
                    {...editForm.register("annualRate")}
                  />
                </FormField>
                <FormField label="总期数">
                  <Input
                    variant="secondary"
                    type="number"
                    min="1"
                    step="1"
                    {...editForm.register("termMonths")}
                  />
                </FormField>
                <FormField
                  label="起始日期"
                  required
                  error={editForm.formState.errors.startDate?.message}
                >
                  <Input
                    variant="secondary"
                    type="date"
                    {...editForm.register("startDate", { required: "请选择起始日期" })}
                  />
                </FormField>
                <FormField label="备注">
                  <Input variant="secondary" {...editForm.register("note")} />
                </FormField>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                isDisabled={editForm.formState.isSubmitting || updateLoan.isPending}
                onPress={() =>
                  void editForm.handleSubmit(async (values) => {
                    await updateLoan.mutateAsync({
                      id,
                      name: values.name.trim(),
                      lender: values.lender.trim() || null,
                      principalAmount: values.principalAmount
                        ? Math.abs(Number(values.principalAmount)).toFixed(2)
                        : null,
                      currentPrincipalEstimate: values.currentPrincipalEstimate
                        ? Math.abs(Number(values.currentPrincipalEstimate)).toFixed(2)
                        : null,
                      paymentAmount: Math.abs(Number(values.paymentAmount) || 0).toFixed(2),
                      annualRateBps: values.annualRate
                        ? Math.round(Number(values.annualRate) * 100)
                        : null,
                      termMonths: values.termMonths ? Math.max(Number(values.termMonths), 1) : null,
                      startDate: values.startDate,
                      note: values.note.trim() || null,
                      currency: values.cur,
                    })
                    await refreshLoanViews()
                    setEditing(false)
                  })()
                }
              >
                {updateLoan.isPending ? "保存中…" : "保存"}
              </Button>
              <Button variant="outline" onPress={() => setEditing(false)}>
                取消
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      <Modal.Backdrop
        isOpen={prepaying}
        onOpenChange={(v) => {
          if (!v) setPrepaying(false)
        }}
      >
        <Modal.Container>
          <Modal.Dialog style={{ maxWidth: 360 }}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>提前还款</Modal.Heading>
              <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
                记录一次手动还款后，下调当前本金估算
              </p>
            </Modal.Header>
            <Modal.Body>
              <form
                id="loan-prepay-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void prepayForm.handleSubmit(async (values) => {
                    const amount = Math.abs(Number(values.amount) || 0)
                    await updateLoan.mutateAsync({
                      id,
                      currentPrincipalEstimate: Math.max(currentPrincipal - amount, 0).toFixed(2),
                    })
                    await refreshLoanViews()
                    setPrepaying(false)
                    prepayForm.reset({ amount: "" })
                  })()
                }}
              >
                <FormField
                  label="还款金额"
                  required
                  error={prepayForm.formState.errors.amount?.message}
                >
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="0.01"
                    {...prepayForm.register("amount", {
                      validate: (value) =>
                        (String(value).trim().length > 0 && Number(value) > 0) ||
                        "请输入大于 0 的还款金额",
                    })}
                  />
                </FormField>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                isDisabled={prepayForm.formState.isSubmitting || updateLoan.isPending}
                onPress={() =>
                  void prepayForm.handleSubmit(async (values) => {
                    const amount = Math.abs(Number(values.amount) || 0)
                    await updateLoan.mutateAsync({
                      id,
                      currentPrincipalEstimate: Math.max(currentPrincipal - amount, 0).toFixed(2),
                    })
                    await refreshLoanViews()
                    setPrepaying(false)
                    prepayForm.reset({ amount: "" })
                  })()
                }
              >
                {updateLoan.isPending ? "保存中…" : "记录"}
              </Button>
              <Button variant="outline" onPress={() => setPrepaying(false)}>
                取消
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
      <Dock />
    </div>
  )
}
