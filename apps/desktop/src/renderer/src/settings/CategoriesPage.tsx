/**
 * @purpose Render and manage the settings categories page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, and local UI components.
 * @gotcha  Settings changes can affect user data paths and categories; keep destructive actions explicit.
 */

import { useEffect, useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Input, Modal } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import type { CashflowEventSummary, CategorySummary } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { formatNumber } from "@/lib/format"
import { useConfirm } from "../components/ui/ConfirmModal"
import { ColorPickerField } from "../components/ui/ColorPickerField"
import { FormField } from "../components/ui/FormField"

const fmt = formatNumber

const KIND_COLOR: Record<string, string> = {
  expense: "var(--c-food)",
  income: "var(--c-income)",
  transfer: "var(--c-xfer)",
  debt: "var(--red)",
  other: "var(--c-other)",
}

const CATEGORY_KINDS = [
  { value: "expense", label: "支出" },
  { value: "income", label: "收入" },
  { value: "transfer", label: "转账" },
  { value: "debt", label: "债务" },
] as const

interface CategoryForm {
  name: string
  categoryKind: string
  color: string
}

const EMPTY_CATEGORY_FORM: CategoryForm = {
  name: "",
  categoryKind: "expense",
  color: "#8a9590",
}

interface CategoryStats {
  count: number
  monthAmount: number
}

function categoryStatKeys(event: CashflowEventSummary): string[] {
  const keys: string[] = []
  if (event.categoryId != null) keys.push(`id:${event.categoryId}`)
  if (event.categoryName != null && event.categoryName.trim().length > 0)
    keys.push(`name:${event.categoryName}`)
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
  return (
    stats.get(`id:${category.id}`) ??
    stats.get(`name:${category.name}`) ?? { count: 0, monthAmount: 0 }
  )
}

function colorFor(category: CategorySummary) {
  return (
    category.color ??
    KIND_COLOR[category.categoryKind] ??
    KIND_COLOR[category.kind] ??
    KIND_COLOR.other
  )
}

function CategoryModal({
  open,
  category,
  saving,
  onClose,
  onSave,
}: {
  open: boolean
  category: CategorySummary | null
  saving: boolean
  onClose: () => void
  onSave: (form: CategoryForm) => void | Promise<void>
}) {
  const {
    formState: { errors, isSubmitting },
    control,
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<CategoryForm>({ defaultValues: EMPTY_CATEGORY_FORM })
  const form = watch()

  useEffect(() => {
    if (!open) return
    reset(
      category
        ? {
            name: category.name,
            categoryKind: category.categoryKind || category.kind || "expense",
            color: category.color ?? "#8a9590",
          }
        : EMPTY_CATEGORY_FORM,
    )
  }, [category, open, reset])

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(value) => {
        if (!value) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 420 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{category ? "编辑分类" : "新建分类"}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
              分类用于流水和预算统计，不会改变已有流水金额。
            </p>
          </Modal.Header>
          <Modal.Body>
            <form
              id="category-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit(onSave)()
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <FormField label="分类名称" required error={errors.name?.message}>
                <Input
                  variant="secondary"
                  placeholder="例如：餐饮"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name", {
                    validate: (value) => value.trim().length > 0 || "请输入分类名称",
                  })}
                />
              </FormField>
              <FormField label="类型" required>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {CATEGORY_KINDS.map((kind) => (
                    <button
                      key={kind.value}
                      type="button"
                      onClick={() => setValue("categoryKind", kind.value)}
                      style={{
                        border:
                          form.categoryKind === kind.value
                            ? "1px solid var(--accent)"
                            : "1px solid var(--hair-2)",
                        borderRadius: 6,
                        background:
                          form.categoryKind === kind.value ? "var(--accent-soft)" : "white",
                        color: form.categoryKind === kind.value ? "var(--accent)" : "var(--ink-2)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 500,
                        padding: "5px 10px",
                      }}
                    >
                      {kind.label}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="颜色">
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <ColorPickerField value={field.value} onChange={field.onChange} />
                  )}
                />
              </FormField>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="primary"
              isDisabled={saving || isSubmitting}
              onPress={() => void handleSubmit(onSave)()}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" onPress={onClose}>
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}

function CategoryRow({
  category,
  stats,
  onEdit,
  onArchive,
}: {
  category: CategorySummary
  stats: CategoryStats
  onEdit: (category: CategorySummary) => void
  onArchive: (category: CategorySummary) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "13px 0",
        borderTop: "1px solid var(--hair-3)",
        opacity: category.archived ? 0.45 : 1,
      }}
    >
      <span
        className="cdot"
        style={{ background: colorFor(category), width: 11, height: 11, flex: "0 0 11px" }}
      />
      <div style={{ minWidth: 120, flex: "0 0 120px" }}>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{category.name}</span>
      </div>
      <div className="dim" style={{ fontSize: 11.5, flex: 1 }}>
        {stats.count > 0 ? (
          <>
            {stats.count} 笔 · 本月 ¥{fmt(stats.monthAmount)}
          </>
        ) : (
          "暂无记录"
        )}
      </div>
      <div className="dim" style={{ fontSize: 11.5, flexShrink: 0 }}>
        {category.archived ? "已归档" : category.categoryKind}
      </div>
      {!category.archived && (
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <Button
            size="sm"
            variant="outline"
            style={{ borderRadius: 5 }}
            onPress={() => onEdit(category)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant="ghost"
            style={{ borderRadius: 5, color: "var(--red)" }}
            onPress={() => onArchive(category)}
          >
            归档
          </Button>
        </div>
      )}
    </div>
  )
}

function CategorySection({
  title,
  note,
  categories,
  stats,
  onEdit,
  onArchive,
}: {
  title: string
  note: string
  categories: CategorySummary[]
  stats: Map<string, CategoryStats>
  onEdit: (category: CategorySummary) => void
  onArchive: (category: CategorySummary) => void
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 4 }}>
        <span
          style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", letterSpacing: ".06em" }}
        >
          {title}
        </span>
        <span className="dim" style={{ fontSize: 11, marginLeft: 8 }}>
          {categories.length} 个 · {note}
        </span>
      </div>
      {categories.map((category) => (
        <CategoryRow
          key={category.id}
          category={category}
          stats={statFor(category, stats)}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
      {categories.length === 0 && (
        <div
          className="dim"
          style={{ padding: "18px 0", fontSize: 12, borderTop: "1px solid var(--hair-3)" }}
        >
          暂无分类
        </div>
      )}
    </div>
  )
}

export function CategoriesPage() {
  const confirm = useConfirm()
  const queryClient = useQueryClient()
  const categoriesQuery = useQuery(
    trpc.reference.categories.queryOptions({ includeArchived: true }),
  )
  const cashflowQuery = useQuery(trpc.cashflow.list.queryOptions({ status: "active", limit: 1000 }))
  const createCategory = useMutation(trpc.reference.createCategory.mutationOptions())
  const updateCategory = useMutation(trpc.reference.updateCategory.mutationOptions())
  const archiveCategory = useMutation(trpc.reference.archiveCategory.mutationOptions())
  const [editingCategory, setEditingCategory] = useState<CategorySummary | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  usePagePerf("settings-categories", [
    { name: "reference.categories", query: categoriesQuery },
    { name: "cashflow.list", query: cashflowQuery },
  ])

  const now = new Date()
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  const categories = categoriesQuery.data ?? []
  const stats = useMemo(
    () => buildStats(cashflowQuery.data ?? [], monthPrefix),
    [cashflowQuery.data, monthPrefix],
  )
  const expenseCategories = useMemo(
    () => categories.filter((category) => !isIncomeCategory(category)),
    [categories],
  )
  const incomeCategories = useMemo(() => categories.filter(isIncomeCategory), [categories])

  async function refreshCategories() {
    await queryClient.invalidateQueries(trpc.reference.categories.queryFilter())
    await queryClient.invalidateQueries(trpc.cashflow.list.queryFilter())
  }

  function openCategoryForm(category: CategorySummary | null) {
    setEditingCategory(category)
    setShowCategoryForm(true)
  }

  function closeCategoryForm() {
    setShowCategoryForm(false)
    setEditingCategory(null)
  }

  async function handleSaveCategory(form: CategoryForm) {
    const input = {
      name: form.name.trim(),
      categoryKind: form.categoryKind,
      color: form.color || null,
    }
    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, ...input })
    } else {
      await createCategory.mutateAsync(input)
    }
    closeCategoryForm()
    await refreshCategories()
  }

  function confirmArchiveCategory(category: CategorySummary) {
    confirm({
      title: "归档分类",
      description: `归档「${category.name}」后，新流水选择分类时不再显示它；历史流水仍保留引用。确定继续？`,
      confirmText: "归档",
      danger: true,
      onConfirm: async () => {
        await archiveCategory.mutateAsync({ id: category.id })
        await refreshCategories()
      },
    })
  }

  return (
    <div
      className="relative flex flex-col h-full overflow-hidden bg-white"
      style={{ height: "100%", overflow: "hidden" }}
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingBottom: 40 }}>
        <div className="st-wrap" style={{ padding: "24px 0 40px" }}>
          <Link to="/settings" style={{ textDecoration: "none" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                color: "var(--ink-2)",
                marginBottom: 22,
                cursor: "pointer",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3L5 8l5 5" />
              </svg>
              返回设置
            </div>
          </Link>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 16,
              marginBottom: 4,
            }}
          >
            <div className="dm-num" style={{ fontSize: 26 }}>
              分类管理
            </div>
            <Button
              size="sm"
              variant="primary"
              style={{ borderRadius: 5 }}
              onPress={() => openCategoryForm(null)}
            >
              新建分类
            </Button>
          </div>
          <div className="dim" style={{ fontSize: 12, marginBottom: 28 }}>
            全 App 共用一套分类 · 当前页面展示并管理数据库中的真实分类
          </div>

          <CategorySection
            title="支出分类"
            note="引用真实流水统计"
            categories={expenseCategories}
            stats={stats}
            onEdit={openCategoryForm}
            onArchive={confirmArchiveCategory}
          />

          <CategorySection
            title="收入 / 资金流转"
            note="不计入支出预算"
            categories={incomeCategories}
            stats={stats}
            onEdit={openCategoryForm}
            onArchive={confirmArchiveCategory}
          />
        </div>
      </div>
      <CategoryModal
        open={showCategoryForm}
        category={editingCategory}
        saving={createCategory.isPending || updateCategory.isPending}
        onClose={closeCategoryForm}
        onSave={handleSaveCategory}
      />
    </div>
  )
}
