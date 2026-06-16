/**
 * @purpose Render and manage the budget overview page workflow.
 * @role    Renderer feature surface for budget review and editing.
 * @deps    React, tRPC queries, and budget UI helpers.
 * @gotcha  Budget views summarize cashflow without turning plans into actual expenses.
 */

import { useState } from "react"
import { Shell } from "../components/layout/Shell"
import { Button } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Outlet, useNavigate, useRouterState } from "@tanstack/react-router"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { BUDGET_CATEGORY_COLORS } from "@/lib/domainDisplay"
import { formatNumber } from "@/lib/format"
import { dateKey, monthStart, todayKey } from "@/lib/dates"
import { AddBudgetModal } from "./AddBudgetModal"
import type { BudgetForm } from "./AddBudgetModal"
import { invalidateBudgetQueries } from "./invalidateBudgetQueries"

const fmt = formatNumber

function Bar({ pct, color, h }: { pct: number; color: string; h: number }) {
  return (
    <div
      style={{ height: h, background: "var(--hair-2)", borderRadius: h / 2, overflow: "hidden" }}
    >
      <div
        style={{
          height: "100%",
          width: Math.min(pct, 100) + "%",
          background: color,
          borderRadius: h / 2,
        }}
      />
    </div>
  )
}

export function BudgetPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const today = todayKey()
  const setsQuery = useQuery(trpc.budgets.sets.queryOptions())
  const periodsQuery = useQuery(trpc.budgets.periods.queryOptions({ status: "active" }))
  const currentPeriod = periodsQuery.data?.find(
    (period) => period.periodStart <= today && period.periodEnd >= today,
  )
  const progressQuery = useQuery({
    ...trpc.budgets.progress.queryOptions({ budgetPeriodId: currentPeriod?.id ?? "" }),
    enabled: Boolean(currentPeriod),
  })
  usePagePerf("budget", [
    { name: "budgets.sets", query: setsQuery },
    { name: "budgets.periods", query: periodsQuery },
    { name: "budgets.progress", query: progressQuery },
  ])
  const createBudgetItem = useMutation(trpc.budgets.createItem.mutationOptions())
  const createBudgetSet = useMutation(trpc.budgets.createSet.mutationOptions())
  const createBudgetPeriod = useMutation(trpc.budgets.createPeriod.mutationOptions())

  async function ensureCurrentPeriod() {
    if (currentPeriod) return currentPeriod
    const budgetSet =
      (setsQuery.data ?? [])[0] ?? (await createBudgetSet.mutateAsync({ name: "月度预算" }))
    const now = new Date()
    const periodStart = monthStart(now)
    const periodEnd = dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))
    return await createBudgetPeriod.mutateAsync({
      budgetSetId: budgetSet.id,
      periodKind: "monthly",
      periodStart,
      periodEnd,
      currency: "CNY",
    })
  }

  async function handleAddBudget(form: BudgetForm) {
    setSaving(true)
    try {
      const period = await ensureCurrentPeriod()
      await createBudgetItem.mutateAsync({
        budgetPeriodId: period.id,
        name: form.name.trim(),
        plannedAmount: Number(form.plannedAmount).toFixed(2),
        currency: "CNY",
        color: form.color || null,
      })
      setShowAdd(false)
      await invalidateBudgetQueries(queryClient)
    } finally {
      setSaving(false)
    }
  }
  const budgets = (progressQuery.data ?? []).map((row) => ({
    id: row.budgetItemId,
    name: row.budgetName,
    color:
      row.color ?? BUDGET_CATEGORY_COLORS[row.budgetName.replace(/预算$/, "")] ?? "var(--accent)",
    spent: Number(row.referenceUsed),
    limit: Number(row.budgeted),
  }))
  const budgetSpent = budgets.reduce((s, b) => s + b.spent, 0)
  const budgetTotal = budgets.reduce((s, b) => s + b.limit, 0)
  const remain = budgetTotal - budgetSpent
  const pctTotal = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0

  const pathname = useRouterState({ select: (s) => s.location.pathname })
  if (pathname !== "/budget") return <Outlet />

  return (
    <Shell>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 44,
          paddingBottom: 16,
          borderBottom: "1px solid var(--hair-2)",
        }}
      >
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>本月预算 · 已用</div>
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
            ¥{fmt(budgetSpent)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>预算总额</div>
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
            ¥{fmt(budgetTotal)}
          </div>
        </div>
        <div style={{ paddingTop: 6 }}>
          <div style={{ fontSize: 11, color: "var(--ink-3)" }}>剩余可用</div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 16,
              fontWeight: 500,
              color: remain < 0 ? "var(--red)" : "var(--ink)",
              marginTop: 3,
              letterSpacing: "-0.01em",
            }}
          >
            ¥{fmt(remain)}
          </div>
        </div>
        <div style={{ width: 300, paddingTop: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10.5, color: "var(--ink-4)" }}>整体进度</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>
              {Math.round(pctTotal)}%
            </span>
          </div>
          <Bar pct={pctTotal} color={pctTotal > 100 ? "var(--red)" : "var(--accent)"} h={8} />
        </div>
        <div style={{ marginLeft: "auto", paddingTop: 8, alignSelf: "flex-start" }}>
          <Button
            size="sm"
            variant="primary"
            style={{ borderRadius: 5 }}
            onPress={() => setShowAdd(true)}
            isDisabled={setsQuery.isPending || periodsQuery.isPending || saving}
          >
            ＋ 添加预算
          </Button>
        </div>
      </div>

      {/* Budget rows */}
      <div style={{ display: "flex", flexDirection: "column", marginTop: 14 }}>
        {budgets.map((b, i) => {
          const pct = (b.spent / b.limit) * 100
          const over = b.spent > b.limit
          return (
            <div
              key={b.name}
              role="button"
              onClick={() => navigate({ to: "/budget/$id", params: { id: String(b.id) } })}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr 160px",
                gap: 18,
                alignItems: "center",
                padding: "13px 0",
                borderTop: i ? "1px solid var(--hair-3)" : "none",
                cursor: "pointer",
              }}
            >
              {/* Label */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 2,
                    background: b.color,
                    flexShrink: 0,
                    display: "inline-block",
                  }}
                />
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{b.name}</span>
              </div>

              {/* Bar */}
              <Bar pct={pct} color={over ? "var(--red)" : b.color} h={7} />

              {/* Amounts */}
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    fontWeight: 500,
                    color: over ? "var(--red)" : "var(--ink)",
                  }}
                >
                  ¥{fmt(b.spent)}
                </span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--ink-4)" }}>
                  {" / "}
                  {fmt(b.limit)}
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 11,
                    marginLeft: 8,
                    color: over ? "var(--red)" : "var(--ink-3)",
                  }}
                >
                  {over ? `超 ¥${fmt(b.spent - b.limit)}` : `剩 ¥${fmt(b.limit - b.spent)}`}
                </span>
              </div>
            </div>
          )
        })}
        {budgets.length === 0 && (
          <div style={{ padding: "28px 0", fontSize: 12, color: "var(--ink-4)", lineHeight: 1.7 }}>
            暂无当前月预算。创建预算后，进度会只引用已发生的现金流，不预测、不对账。
          </div>
        )}
      </div>

      {/* Footer note */}
      <div
        style={{
          marginTop: "auto",
          paddingTop: 16,
          fontSize: 11,
          color: "var(--ink-4)",
          lineHeight: 1.6,
        }}
      >
        预算只统计日常可控支出（不含房贷与储蓄）。Flowm 只告诉你用了多少，不替你做超支判断。
      </div>

      <AddBudgetModal
        open={showAdd}
        saving={saving}
        onSave={handleAddBudget}
        onClose={() => setShowAdd(false)}
      />
    </Shell>
  )
}
