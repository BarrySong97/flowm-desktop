/**
 * @purpose Render and manage the budget detail page workflow.
 * @role    Renderer feature surface for budget review and editing.
 * @deps    React, tRPC queries, and budget UI helpers.
 * @gotcha  Budget views summarize cashflow without turning plans into actual expenses.
 */

import { useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@heroui/react"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { BackButton } from "../components/ui/BackButton"
import { trpc } from "@/lib/trpc"
import { useMoney } from "@/lib/useMoney"
import { todayKey } from "@/lib/dates"
import { Route } from "../routes/budget.$id"
import { useConfirm } from "../components/ui/ConfirmModal"
import { AddBudgetModal } from "./AddBudgetModal"
import type { BudgetForm } from "./AddBudgetModal"
import { invalidateBudgetQueries } from "./invalidateBudgetQueries"

export function BudgetDetailPage() {
  const fmt = useMoney()
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const today = todayKey()
  const currentMonth = today.slice(0, 7)
  const monthLabel = `${parseInt(today.slice(5, 7))}月`

  // Current period + progress
  const periodsQuery = useQuery(trpc.budgets.periods.queryOptions({ status: "active" }))
  const currentPeriod = periodsQuery.data?.find(
    (p) => p.periodStart <= today && p.periodEnd >= today,
  )
  const progressQuery = useQuery({
    ...trpc.budgets.progress.queryOptions({ budgetPeriodId: currentPeriod?.id ?? "" }),
    enabled: Boolean(currentPeriod),
  })
  const categoriesQuery = useQuery(
    trpc.reference.categories.queryOptions({ categoryKind: "expense" }),
  )
  const budgetCategories = (categoriesQuery.data ?? []).map((c) => ({
    id: String(c.id),
    name: c.name,
  }))
  const row = progressQuery.data?.find((r) => r.budgetItemId === id)
  const budgetName = row?.budgetName ?? "预算"
  const budgetColor = row?.color ?? "var(--accent)"
  const limit = Number(row?.budgeted ?? 0)
  const spent = Number(row?.referenceUsed ?? 0)
  const remaining = limit - spent
  const pct = limit > 0 ? (spent / limit) * 100 : 0
  const over = spent > limit

  const confirm = useConfirm()
  const updateBudgetItem = useMutation(trpc.budgets.updateItem.mutationOptions())
  const archiveBudgetItem = useMutation(trpc.budgets.archiveItem.mutationOptions())

  async function handleEditSave(form: BudgetForm) {
    if (!row) return
    setSaving(true)
    try {
      await updateBudgetItem.mutateAsync({
        id: row.budgetItemId,
        name: form.name.trim(),
        plannedAmount: Number(form.plannedAmount).toFixed(2),
        currency: "CNY",
        color: form.color || null,
        scopes: form.categoryIds.map((cid) => ({
          scopeKind: "category" as const,
          scopeValue: cid,
        })),
      })
      setShowEdit(false)
      await invalidateBudgetQueries(queryClient)
    } finally {
      setSaving(false)
    }
  }

  // Days left in current period
  const periodEnd = currentPeriod?.periodEnd ?? today
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(periodEnd).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24)),
  )
  const dailyAvail = daysLeft > 0 ? remaining / daysLeft : 0

  // 6-month array
  const months = useMemo(() => {
    const result: { label: string; yearMonth: string; start: string; end: string }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      const ym = d.toISOString().slice(0, 7)
      const y = ym.slice(0, 4)
      const m = ym.slice(5, 7)
      const start = `${ym}-01`
      const lastDay = new Date(parseInt(y), parseInt(m), 0).getDate()
      const end = `${ym}-${String(lastDay).padStart(2, "0")}`
      result.push({ label: `${parseInt(m)}月`, yearMonth: ym, start, end })
    }
    return result
  }, [])

  const sixMonthsAgo = months[0].start
  const cashflowQuery = useQuery(
    trpc.cashflow.list.queryOptions({ dateFrom: sixMonthsAgo, dateTo: today }),
  )

  // Match the same scope the progress sum uses: the budget's bound categories.
  // An empty set means an overall budget tracking all expenses.
  const budgetCategoryIds = row?.categoryIds

  const monthlySpend = useMemo(() => {
    const events = cashflowQuery.data ?? []
    const catSet = new Set((budgetCategoryIds ?? []).map(String))
    const filtered = events.filter(
      (e) =>
        e.direction === "out" &&
        e.includeInAnalytics &&
        (catSet.size === 0 || catSet.has(String(e.categoryId))),
    )
    const byMonth: Record<string, number> = {}
    for (const e of filtered) {
      const ym = e.eventDate.slice(0, 7)
      byMonth[ym] = (byMonth[ym] ?? 0) + parseFloat(e.amount)
    }
    return byMonth
  }, [cashflowQuery.data, budgetCategoryIds])

  const recentTx = useMemo(() => {
    const events = cashflowQuery.data ?? []
    const catSet = new Set((budgetCategoryIds ?? []).map(String))
    return events
      .filter(
        (e) =>
          e.direction === "out" &&
          e.includeInAnalytics &&
          e.eventDate >= currentMonth + "-01" &&
          (catSet.size === 0 || catSet.has(String(e.categoryId))),
      )
      .sort((a, b) => b.eventDate.localeCompare(a.eventDate))
      .slice(0, 5)
  }, [cashflowQuery.data, currentMonth, budgetCategoryIds])

  const overMonthCount = months.filter((m) => (monthlySpend[m.yearMonth] ?? 0) > limit).length
  const chartMax = Math.max(limit, ...months.map((m) => monthlySpend[m.yearMonth] ?? 0), 1)

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
          <BackButton label="返回预算" onBack={() => navigate({ to: "/budget" })} />

          {/* Centered content */}
          <div style={{ maxWidth: 680, margin: "20px auto 0" }}>
            {/* Header section */}
            <div
              style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
            >
              <span
                style={{
                  display: "inline-flex",
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
                    background: budgetColor,
                    display: "inline-block",
                    marginRight: 6,
                    marginTop: 1,
                    flexShrink: 0,
                    verticalAlign: "middle",
                  }}
                />
                预算 · 本月
              </span>
              <span style={{ fontSize: 11, color: "var(--ink-4)" }}>已用</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 4,
              }}
            >
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--ink)",
                  lineHeight: 1.1,
                }}
              >
                {budgetName} ·
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 32,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                }}
              >
                ¥{fmt(spent)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                marginTop: 4,
              }}
            >
              <span style={{ fontSize: 12.5, color: "var(--ink-3)" }}>
                {monthLabel}，仅日常可控支出
              </span>
              <span style={{ fontSize: 12, color: "var(--ink-4)" }}>额度 {fmt(limit)}</span>
            </div>

            {/* Progress section */}
            <div style={{ marginTop: 18 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: remaining >= 0 ? "var(--accent)" : "var(--red)",
                  }}
                >
                  还剩 ¥{fmt(remaining)} 可用
                </span>
                <span style={{ fontSize: 11, color: "var(--ink-4)" }}>
                  已用 {Math.round(pct)}% · 剩 {daysLeft} 天 · 日均可用 ¥{fmt(dailyAvail, 0)}
                </span>
              </div>
              <div
                style={{
                  height: 10,
                  borderRadius: 6,
                  background: "var(--hair-2)",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: Math.min(pct, 100) + "%",
                    background: over ? "var(--red)" : budgetColor,
                    borderRadius: 6,
                  }}
                />
              </div>
            </div>

            {/* 6-month bar chart section */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                    近 6 个月
                  </span>
                  <span style={{ fontSize: 10.5, color: "var(--ink-4)", marginLeft: 8 }}>
                    对比预算线，看这个额度是否合理
                  </span>
                </div>
                <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>
                  过去 5 月有 {overMonthCount} 月超支
                </span>
              </div>

              <div
                style={{
                  height: 120,
                  marginTop: 12,
                  display: "flex",
                  gap: 8,
                  alignItems: "flex-end",
                }}
              >
                {months.map((mo) => {
                  const spending = monthlySpend[mo.yearMonth] ?? 0
                  const isCurrentMonth = mo.yearMonth === currentMonth
                  const isOver = spending > limit
                  const barColor = isOver
                    ? "var(--red)"
                    : isCurrentMonth
                      ? budgetColor
                      : "var(--surface-3)"
                  const barH = Math.round((spending / chartMax) * 96)
                  const labelColor = isOver ? "var(--red)" : "var(--ink-4)"

                  return (
                    <div
                      key={mo.yearMonth}
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {/* Amount label */}
                      <span
                        style={{
                          fontSize: 9,
                          color: labelColor,
                          lineHeight: 1,
                          visibility: spending > 0 ? "visible" : "hidden",
                        }}
                      >
                        {fmt(spending, 0)}
                      </span>
                      {/* Bar */}
                      <div
                        style={{
                          width: "100%",
                          height: Math.max(barH, spending > 0 ? 2 : 0),
                          background: barColor,
                          borderRadius: 3,
                          border: isCurrentMonth || isOver ? "none" : "1px solid var(--hair-2)",
                          boxSizing: "border-box",
                        }}
                      />
                      {/* Month label */}
                      <span style={{ fontSize: 10, color: "var(--ink-4)" }}>{mo.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent transactions section */}
            <div style={{ marginTop: 24 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: 10,
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-2)" }}>
                  本月消费别 · 近几笔
                </span>
                <button
                  onClick={() => navigate({ to: "/imports" })}
                  style={{
                    fontSize: 11,
                    color: "var(--accent)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  查看全部 →
                </button>
              </div>

              {recentTx.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-4)", padding: "12px 0" }}>
                  本月暂无该分类支出记录
                </div>
              ) : (
                recentTx.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      borderBottom: "1px solid var(--hair-3)",
                      padding: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: "var(--ink-4)",
                        width: 36,
                        flexShrink: 0,
                      }}
                    >
                      {tx.eventDate.slice(5, 10).replace("-", "/")}
                    </span>
                    <span
                      style={{
                        flex: 1,
                        fontSize: 12.5,
                        color: "var(--ink-2)",
                        marginLeft: 12,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.counterparty || tx.title || "—"}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: 13,
                        color: "var(--red)",
                        flexShrink: 0,
                      }}
                    >
                      ¥{fmt(parseFloat(tx.amount))}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer note */}
            <div
              style={{
                paddingTop: 20,
                fontSize: 11,
                color: "var(--ink-4)",
                lineHeight: 1.7,
                marginTop: 4,
              }}
            >
              预算只统计日常可控支出（不含房贷与储蓄）。Flowm
              只告诉你用了多少与历史走向，不替你做超支判断。
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
              <Button
                variant="primary"
                size="sm"
                style={{ borderRadius: 5 }}
                isDisabled={!row}
                onPress={() => setShowEdit(true)}
              >
                编辑预算
              </Button>
              <Button variant="outline" size="sm" style={{ borderRadius: 5 }}>
                查看该类别流水
              </Button>
              <div style={{ flex: 1 }} />
              <Button
                variant="danger-soft"
                size="sm"
                style={{ borderRadius: 5 }}
                isDisabled={!row}
                onPress={() => {
                  if (!row) return
                  confirm({
                    title: "关闭此预算",
                    description: `关闭「${budgetName}」后，它将不再出现在预算列表中。确定继续？`,
                    confirmText: "关闭预算",
                    danger: true,
                    onConfirm: async () => {
                      await archiveBudgetItem.mutateAsync({ id: row.budgetItemId })
                      await invalidateBudgetQueries(queryClient)
                      navigate({ to: "/budget" })
                    },
                  })
                }}
              >
                关闭此预算
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
      <Dock />
      <AddBudgetModal
        open={showEdit}
        saving={saving}
        categories={budgetCategories}
        title="编辑预算"
        subtitle="修改预算名称、额度、覆盖分类与颜色"
        initial={{
          name: budgetName,
          plannedAmount: limit ? String(limit) : "",
          color: row?.color ?? "#e07b3a",
          categoryIds: row?.categoryIds ?? [],
        }}
        onSave={handleEditSave}
        onClose={() => setShowEdit(false)}
      />
    </div>
  )
}
