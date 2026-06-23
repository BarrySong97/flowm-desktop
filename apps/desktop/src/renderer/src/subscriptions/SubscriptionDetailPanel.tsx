/**
 * @purpose Render and manage the subscription detail panel workflow.
 * @role    Renderer feature surface for recurring future obligations.
 * @deps    React, tRPC subscription queries, calendar/list UI, and forms.
 * @gotcha  Subscription occurrences are forecasts until an explicit actual-cashflow workflow records them.
 */

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Input, Modal } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import { trpc } from "@/lib/trpc"
import { CYCLE_LABELS } from "@/lib/domainDisplay"
import { dateKey } from "@/lib/dates"
import { useMoney } from "@/lib/useMoney"
import { useConfirm } from "../components/ui/ConfirmModal"
import { BackButton } from "../components/ui/BackButton"
import type { SubscriptionOccurrenceSummary } from "@flowm/api"
import { FormField } from "../components/ui/FormField"
import { CurrencySelect } from "../components/ui/CurrencySelect"
import { DateInput } from "../components/ui/DateInput"
import { currencySymbol } from "@flowm/shared"

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: "1px solid var(--hair-3)",
        gap: 12,
      }}
    >
      <span style={{ fontSize: 12, color: "var(--ink-4)", flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 12, color: "var(--ink-2)", textAlign: "right" }}>{children}</span>
    </div>
  )
}

interface Props {
  id: string
  onBack: () => void
}

/** Subscription detail rendered in-place inside the right panel (no route change). */
export function SubscriptionDetailPanel({ id, onBack }: Props) {
  const fmt = useMoney()
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const archiveSubscription = useMutation(trpc.subscriptions.archive.mutationOptions())
  const updateSubscription = useMutation(trpc.subscriptions.update.mutationOptions())

  const today = useMemo(() => dateKey(new Date()), [])
  const sixMonthsAgo = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 6)
    return dateKey(d)
  }, [])
  const twoMonthsAhead = useMemo(() => {
    const d = new Date()
    d.setMonth(d.getMonth() + 2)
    return dateKey(d)
  }, [])

  const subscriptionsQuery = useQuery(trpc.subscriptions.list.queryOptions({ status: "active" }))
  const occurrencesQuery = useQuery(
    trpc.subscriptions.occurrences.queryOptions({
      subscriptionId: id as any,
      dateFrom: sixMonthsAgo,
      dateTo: twoMonthsAhead,
    }),
  )

  const sub = subscriptionsQuery.data?.find((s) => String(s.id) === id)
  const editForm = useForm({
    values: {
      name: sub?.name ?? "",
      amount: sub?.amount ?? "",
      nextChargeDate: sub?.nextChargeDate ?? dateKey(new Date()),
      note: sub?.note ?? "",
      cur: sub?.currency ?? "CNY",
    },
  })

  async function refreshSubscriptionViews() {
    await queryClient.invalidateQueries(trpc.subscriptions.list.queryFilter())
    await queryClient.invalidateQueries(trpc.subscriptions.occurrences.queryFilter())
    await queryClient.invalidateQueries(trpc.loans.futurePressure.queryFilter())
    await queryClient.invalidateQueries(trpc.reference.currentRates.queryFilter())
  }

  const {
    pastOccs,
    totalPaid,
    startDate,
    monthsSubscribed,
    amount,
    yearlyAmt,
    cycleLabel,
    nextDateFormatted,
  } = useMemo(() => {
    if (!sub) return {} as any

    const allOccs = (occurrencesQuery.data ?? []).filter((o) => String(o.subscriptionId) === id)
    const pastOccs = allOccs
      .filter((o) => o.dueDate <= today)
      .sort((a, b) => b.dueDate.localeCompare(a.dueDate))
    const futureOccs = allOccs
      .filter((o) => o.dueDate > today)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    const firstFutureOcc = futureOccs[0] ?? null

    const totalPaid = pastOccs.reduce((s, o) => s + parseFloat(o.amount), 0)
    const lastPastOcc = pastOccs[pastOccs.length - 1]
    const startDate = lastPastOcc?.dueDate ?? sub.nextChargeDate

    const startD = new Date(startDate)
    const todayD = new Date(today)
    const monthsSubscribed =
      (todayD.getFullYear() - startD.getFullYear()) * 12 + (todayD.getMonth() - startD.getMonth())

    const amount = parseFloat(sub.amount)
    const yearlyAmt =
      sub.billingCycle === "monthly"
        ? amount * 12
        : sub.billingCycle === "yearly"
          ? amount
          : sub.billingCycle === "weekly"
            ? amount * 52
            : amount

    const cycleLabel = CYCLE_LABELS[sub.billingCycle] ?? sub.billingCycle
    const nextDateFormatted = firstFutureOcc?.dueDate.slice(5) ?? sub.nextChargeDate.slice(5)

    return {
      pastOccs,
      totalPaid,
      startDate,
      monthsSubscribed,
      amount,
      yearlyAmt,
      cycleLabel,
      nextDateFormatted,
    }
  }, [sub, occurrencesQuery.data, id, today])

  return (
    <div style={{ padding: "20px 24px 112px" }}>
      {/* Content fills the panel width, with the back button at its top */}
      <div>
        <div style={{ marginBottom: 12 }}>
          <BackButton label="返回订阅" onBack={onBack} />
        </div>
        {subscriptionsQuery.isPending && (
          <div style={{ fontSize: 13, color: "var(--ink-4)" }}>加载中…</div>
        )}

        {!subscriptionsQuery.isPending && !sub && (
          <div style={{ fontSize: 13, color: "var(--ink-4)" }}>未找到该订阅</div>
        )}

        {sub && (
          <>
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  fontSize: 11,
                  color: "var(--ink-4)",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: "var(--accent)",
                    display: "inline-block",
                    marginRight: 6,
                  }}
                />
                订阅{sub.categoryId ? " · 娱乐" : ""}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 2, flexShrink: 0 }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 32,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {currencySymbol(sub.currency)}
                  {fmt(
                    sub.billingCycle === "yearly"
                      ? amount / 12
                      : sub.billingCycle === "weekly"
                        ? (amount * 52) / 12
                        : amount,
                    2,
                  )}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-4)", marginLeft: 2 }}>/月</span>
              </div>
            </div>

            {/* Name */}
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: "var(--ink)",
                lineHeight: 1.1,
                marginTop: 6,
              }}
            >
              {sub.name}
            </div>

            {/* Subtitle */}
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", marginTop: 5 }}>
              {cycleLabel}付费 · {sub.autoRenew ? "自动续费" : "手动续费"}
            </div>

            {/* Yearly equivalent row */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
              }}
            >
              <span style={{ fontSize: 12, color: "var(--ink-4)" }}>折合每年</span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 15,
                  fontWeight: 600,
                  color: "var(--ink)",
                }}
              >
                {currencySymbol(sub.currency)}
                {fmt(yearlyAmt, 0)}{" "}
                <span style={{ fontWeight: 400, color: "var(--ink-4)" }}>/年</span>
              </span>
            </div>

            {/* Grey stats card */}
            <div
              style={{
                background: "var(--surface-2)",
                borderRadius: 10,
                padding: "12px 16px",
                marginTop: 14,
                border: "1px solid var(--hair-2)",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "var(--ink-4)" }}>
                  已订阅 {monthsSubscribed} 个月
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", marginTop: 2 }}>
                  自 {startDate} 起
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "var(--ink-4)" }}>累计已扣</div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "var(--ink)",
                    letterSpacing: "-0.02em",
                    marginTop: 2,
                  }}
                >
                  {currencySymbol(sub.currency)}
                  {fmt(totalPaid, 0)}
                </div>
              </div>
            </div>

            {/* Charges section */}
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>扣款</span>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                  下次 {nextDateFormatted} · {sub.autoRenew ? "自动" : "手动"}
                </span>
              </div>
              {(pastOccs as SubscriptionOccurrenceSummary[]).slice(0, 5).map((occ) => (
                <div
                  key={occ.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "8px 0",
                    borderBottom: "1px solid var(--hair-3)",
                  }}
                >
                  <span style={{ fontSize: 11.5, color: "var(--ink-4)", width: 50, flexShrink: 0 }}>
                    {occ.dueDate.slice(5)}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--ink-2)", flex: 1, marginLeft: 12 }}>
                    {sub.name}
                  </span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--red)" }}>
                    −{fmt(parseFloat(occ.amount), 0)}
                  </span>
                </div>
              ))}
              {pastOccs.length === 0 && (
                <div style={{ fontSize: 12, color: "var(--ink-4)", padding: "8px 0" }}>
                  暂无扣款记录
                </div>
              )}
            </div>

            {/* Info rows */}
            <div style={{ marginTop: 16 }}>
              <InfoRow label="计费周期">
                {cycleLabel} · {currencySymbol(sub.currency)}
                {fmt(amount, 2)}
              </InfoRow>
              <InfoRow label="自动续费">{sub.autoRenew ? "已开启" : "未开启"}</InfoRow>
              <InfoRow label="扣款方式">
                {sub.merchant
                  ? `${sub.merchant} · ${sub.autoRenew ? "自动扣款" : "手动付款"}`
                  : sub.autoRenew
                    ? "自动扣款"
                    : "手动付款"}
              </InfoRow>
              {sub.note && <InfoRow label="备注">{sub.note}</InfoRow>}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.7 }}>
              订阅计入每月固定支出。Flowm 只把账单举牌给你看，是否继续订阅由你决定。
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 28, alignItems: "center" }}>
              <Button
                size="sm"
                variant="primary"
                style={{ borderRadius: 5 }}
                onPress={async () => {
                  await updateSubscription.mutateAsync({ id, autoRenew: !sub.autoRenew })
                  await refreshSubscriptionViews()
                }}
              >
                {sub.autoRenew ? "关闭自动续费" : "开启自动续费"}
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
                variant="danger-soft"
                style={{ borderRadius: 5 }}
                onPress={() =>
                  confirm({
                    title: "取消订阅",
                    description: `取消「${sub.name}」后，它将从订阅列表移除。确定继续？`,
                    confirmText: "取消订阅",
                    danger: true,
                    onConfirm: async () => {
                      await archiveSubscription.mutateAsync({ id })
                      await refreshSubscriptionViews()
                      onBack()
                    },
                  })
                }
              >
                取消订阅
              </Button>
            </div>
          </>
        )}
      </div>
      <Modal.Backdrop
        isOpen={editing}
        onOpenChange={(v) => {
          if (!v) setEditing(false)
        }}
      >
        <Modal.Container>
          <Modal.Dialog style={{ maxWidth: 420 }}>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading>编辑订阅</Modal.Heading>
              <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
                修改名称、金额和下次扣费日期
              </p>
            </Modal.Header>
            <Modal.Body>
              <form
                id="subscription-edit-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  void editForm.handleSubmit(async (values) => {
                    await updateSubscription.mutateAsync({
                      id,
                      name: values.name.trim(),
                      amount: Math.abs(Number(values.amount) || 0).toFixed(2),
                      nextChargeDate: values.nextChargeDate,
                      note: values.note.trim() || null,
                      currency: values.cur,
                    })
                    await refreshSubscriptionViews()
                    setEditing(false)
                  })()
                }}
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                <FormField label="名称" required error={editForm.formState.errors.name?.message}>
                  <Input
                    variant="secondary"
                    {...editForm.register("name", {
                      validate: (value) => value.trim().length > 0 || "请输入订阅名称",
                    })}
                  />
                </FormField>
                <FormField
                  label="扣费金额"
                  required
                  error={editForm.formState.errors.amount?.message}
                >
                  <Input
                    variant="secondary"
                    type="number"
                    min="0"
                    step="0.01"
                    {...editForm.register("amount", {
                      validate: (value) =>
                        (String(value).trim().length > 0 && Number(value) > 0) ||
                        "请输入大于 0 的金额",
                    })}
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
                  label="下次扣费日期"
                  required
                  error={editForm.formState.errors.nextChargeDate?.message}
                >
                  <Controller
                    control={editForm.control}
                    name="nextChargeDate"
                    rules={{ required: "请选择扣费日期" }}
                    render={({ field }) => (
                      <DateInput
                        value={field.value}
                        onChange={field.onChange}
                        isInvalid={Boolean(editForm.formState.errors.nextChargeDate)}
                      />
                    )}
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
                isDisabled={editForm.formState.isSubmitting || updateSubscription.isPending}
                onPress={() =>
                  void editForm.handleSubmit(async (values) => {
                    await updateSubscription.mutateAsync({
                      id,
                      name: values.name.trim(),
                      amount: Math.abs(Number(values.amount) || 0).toFixed(2),
                      nextChargeDate: values.nextChargeDate,
                      note: values.note.trim() || null,
                      currency: values.cur,
                    })
                    await refreshSubscriptionViews()
                    setEditing(false)
                  })()
                }
              >
                {updateSubscription.isPending ? "保存中…" : "保存"}
              </Button>
              <Button variant="outline" onPress={() => setEditing(false)}>
                取消
              </Button>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </div>
  )
}
