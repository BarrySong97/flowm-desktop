/**
 * @purpose Render and manage the settings categories page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useMemo } from "react"
import { Link } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import type { CashflowEventSummary, CategorySummary } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { formatNumber } from "@/lib/format"

const fmt = formatNumber

const KIND_COLOR: Record<string, string> = {
  expense: "var(--c-food)",
  income: "var(--c-income)",
  transfer: "var(--c-xfer)",
  other: "var(--c-other)",
}

interface CategoryStats {
  count: number
  monthAmount: number
}

function categoryStatKeys(event: CashflowEventSummary): string[] {
  const keys: string[] = []
  if (event.categoryId != null) keys.push(`id:${event.categoryId}`)
  if (event.categoryName != null && event.categoryName.trim().length > 0) keys.push(`name:${event.categoryName}`)
  return keys
}

function isIncomeCategory(category: CategorySummary) {
  return category.categoryKind === "income" || category.kind === "income"
}

function buildStats(events: CashflowEventSummary[], monthPrefix: string) {
  const stats = new Map<string, CategoryStats>()
  for (const event of events) {
    const amount = Math.abs(Number(event.amount) || 0)
    for (const key of categoryStatKeys(event)) {
      const current = stats.get(key) ?? { count: 0, monthAmount: 0 }
      current.count += 1
      if (event.date.startsWith(monthPrefix)) current.monthAmount += amount
      stats.set(key, current)
    }
  }
  return stats
}

function statFor(category: CategorySummary, stats: Map<string, CategoryStats>) {
  return stats.get(`id:${category.id}`) ?? stats.get(`name:${category.name}`) ?? { count: 0, monthAmount: 0 }
}

function colorFor(category: CategorySummary) {
  return category.color ?? KIND_COLOR[category.categoryKind] ?? KIND_COLOR[category.kind] ?? KIND_COLOR.other
}

function CategoryRow({ category, stats }: { category: CategorySummary; stats: CategoryStats }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 16, padding: "13px 0",
      borderTop: "1px solid var(--hair-3)", opacity: category.archived ? 0.45 : 1,
    }}>
      <span className="cdot" style={{ background: colorFor(category), width: 11, height: 11, flex: "0 0 11px" }} />
      <div style={{ minWidth: 120, flex: "0 0 120px" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{category.name}</span>
      </div>
      <div className="dim" style={{ fontSize: 11.5, flex: 1 }}>
        {stats.count > 0 ? <>{stats.count} 笔 · 本月 ¥{fmt(stats.monthAmount)}</> : "暂无记录"}
      </div>
      <div className="dim" style={{ fontSize: 11.5, flexShrink: 0 }}>
        {category.archived ? "已归档" : category.categoryKind}
      </div>
    </div>
  )
}

function CategorySection({ title, note, categories, stats }: {
  title: string
  note: string
  categories: CategorySummary[]
  stats: Map<string, CategoryStats>
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", letterSpacing: ".06em" }}>{title}</span>
        <span className="dim" style={{ fontSize: 11, marginLeft: 8 }}>{categories.length} 个 · {note}</span>
      </div>
      {categories.map((category) => (
        <CategoryRow key={category.id} category={category} stats={statFor(category, stats)} />
      ))}
      {categories.length === 0 && (
        <div className="dim" style={{ padding: "18px 0", fontSize: 12, borderTop: "1px solid var(--hair-3)" }}>
          暂无分类
        </div>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions({ includeArchived: true }))
  const cashflowQuery = useQuery(trpc.cashflow.list.queryOptions({ status: "active", limit: 1000 }))
  usePagePerf("settings-categories", [
    { name: "reference.categories", query: categoriesQuery },
    { name: "cashflow.list", query: cashflowQuery },
  ])

  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const categories = categoriesQuery.data ?? []
  const stats = useMemo(() => buildStats(cashflowQuery.data ?? [], monthPrefix), [cashflowQuery.data, monthPrefix])
  const expenseCategories = useMemo(
    () => categories.filter((category) => !isIncomeCategory(category)),
    [categories],
  )
  const incomeCategories = useMemo(
    () => categories.filter(isIncomeCategory),
    [categories],
  )

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-white" style={{ height: "100%", overflow: "hidden" }}>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 40 }}>
        <div className="st-wrap" style={{ padding: "24px 0 40px" }}>

          <Link to="/settings" style={{ textDecoration: "none" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--ink-2)", marginBottom: 22, cursor: "pointer" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 3L5 8l5 5" />
              </svg>
              返回设置
            </div>
          </Link>

          <div className="dm-num" style={{ fontSize: 26, marginBottom: 4 }}>分类管理</div>
          <div className="dim" style={{ fontSize: 12, marginBottom: 28 }}>
            全 App 共用一套分类 · 当前页面只展示数据库中的真实分类
          </div>

          <CategorySection
            title="支出分类"
            note="引用真实流水统计"
            categories={expenseCategories}
            stats={stats}
          />

          <CategorySection
            title="收入 / 资金流转"
            note="不计入支出预算"
            categories={incomeCategories}
            stats={stats}
          />
        </div>
      </div>
    </div>
  )
}
