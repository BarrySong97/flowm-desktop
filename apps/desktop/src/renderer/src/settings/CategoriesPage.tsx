/**
 * @purpose Render and manage the settings categories page workflow.
 * @role    Renderer feature surface for app configuration and reference data.
 * @deps    React, tRPC settings/reference queries, HeroUI controls, and local UI components.
 * @gotcha  Category names can repeat across kinds; use category ids for stats and edits.
 */

import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Button, Chip, Input, Modal } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import type { CashflowEventSummary, CategorySummary } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { usePagePerf } from "@/lib/debug/perf"
import { useMoney } from "@/lib/useMoney"
import { Dock } from "../components/layout/Dock"
import { ScrollArea } from "../components/ui/ScrollArea"
import { useConfirm } from "../components/ui/ConfirmModal"
import { ColorPickerField } from "../components/ui/ColorPickerField"
import { ColorDot } from "../components/ui/ColorDot"
import { FormField } from "../components/ui/FormField"

const CATEGORY_KINDS = [
  { value: "expense", label: "支出" },
  { value: "income", label: "收入" },
  { value: "transfer", label: "转账" },
  { value: "debt", label: "债务" },
  { value: "asset_movement", label: "资产流转" },
  { value: "adjustment", label: "调整" },
] as const

const KIND_META: Record<string, { label: string; tone: string }> = {
  expense: { label: "支出", tone: "var(--red)" },
  income: { label: "收入", tone: "var(--accent)" },
  transfer: { label: "转账", tone: "var(--ink-3)" },
  debt: { label: "债务", tone: "var(--red)" },
  asset_movement: { label: "资产流转", tone: "var(--ink-3)" },
  adjustment: { label: "调整", tone: "var(--ink-3)" },
  neutral: { label: "中性", tone: "var(--ink-3)" },
}

const KIND_FALLBACK_COLOR: Record<string, string> = {
  expense: "var(--red)",
  income: "var(--accent)",
  transfer: "var(--ink-3)",
  debt: "var(--red)",
  asset_movement: "var(--ink-3)",
  adjustment: "var(--ink-3)",
  neutral: "var(--ink-3)",
}

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

function kindOf(category: CategorySummary) {
  return category.categoryKind || category.kind || "expense"
}

function colorFor(category: CategorySummary) {
  const kind = kindOf(category)
  return category.color ?? KIND_FALLBACK_COLOR[kind] ?? "var(--ink-4)"
}

function buildStats(events: CashflowEventSummary[], monthPrefix: string) {
  const stats = new Map<string, CategoryStats>()
  for (const event of events) {
    if (event.categoryId == null) continue
    const key = String(event.categoryId)
    const amount = Math.abs(Number(event.amount) || 0)
    const current = stats.get(key) ?? { count: 0, monthAmount: 0 }
    current.count += 1
    if (event.date.startsWith(monthPrefix)) current.monthAmount += amount
    stats.set(key, current)
  }
  return stats
}

function statFor(category: CategorySummary, stats: Map<string, CategoryStats>) {
  return stats.get(String(category.id)) ?? { count: 0, monthAmount: 0 }
}

function GroupLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 10.5,
        fontWeight: 600,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        color: "var(--ink-4)",
        marginBottom: 4,
      }}
    >
      {children}
    </div>
  )
}

function KindBadge({ kind, archived }: { kind: string; archived?: boolean }) {
  const meta = KIND_META[kind] ?? { label: kind, tone: "var(--ink-3)" }
  return <Chip size="sm">{archived ? "已归档" : meta.label}</Chip>
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
            categoryKind: kindOf(category),
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
              分类只影响流水归类和统计，不改变现金流金额。
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
                  {CATEGORY_KINDS.map((kind) => {
                    const active = form.categoryKind === kind.value
                    return (
                      <button
                        key={kind.value}
                        type="button"
                        onClick={() => setValue("categoryKind", kind.value)}
                        style={{
                          height: 30,
                          border: active ? "1px solid var(--accent)" : "1px solid var(--hair-2)",
                          borderRadius: 6,
                          background: active ? "var(--accent-soft)" : "white",
                          color: active ? "var(--accent)" : "var(--ink-2)",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: 500,
                          padding: "0 10px",
                        }}
                      >
                        {kind.label}
                      </button>
                    )
                  })}
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
              style={{ borderRadius: 5 }}
            >
              {saving ? "保存中..." : "保存"}
            </Button>
            <Button variant="outline" onPress={onClose} style={{ borderRadius: 5 }}>
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
  const fmt = useMoney()
  const kind = kindOf(category)
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(160px, 1fr) 88px 116px 86px 110px",
        alignItems: "center",
        gap: 12,
        minHeight: 50,
        padding: "10px 0",
        borderTop: "1px solid var(--hair-3)",
        opacity: category.archived ? 0.46 : 1,
      }}
    >
      <div style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 9 }}>
        <ColorDot color={colorFor(category)} size={9} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 500,
              color: "var(--ink)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {category.name}
          </div>
        </div>
      </div>
      <KindBadge kind={kind} archived={category.archived} />
      <span style={{ fontSize: 11.5, color: "var(--ink-3)", whiteSpace: "nowrap" }}>
        {stats.count > 0 ? `${stats.count} 笔` : "暂无流水"}
      </span>
      <span
        style={{
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 12,
          color: stats.monthAmount > 0 ? "var(--ink)" : "var(--ink-4)",
          textAlign: "right",
          whiteSpace: "nowrap",
        }}
      >
        ¥{fmt(stats.monthAmount)}
      </span>
      {!category.archived ? (
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          <Button size="sm" variant="outline" onPress={() => onEdit(category)}>
            编辑
          </Button>
          <Button size="sm" variant="danger" onPress={() => onArchive(category)}>
            归档
          </Button>
        </div>
      ) : (
        <span style={{ fontSize: 11.5, color: "var(--ink-4)", textAlign: "right" }}>不可选</span>
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
  const activeCount = categories.filter((category) => !category.archived).length

  return (
    <section style={{ marginTop: 30 }}>
      <GroupLabel>{title}</GroupLabel>
      <div style={{ display: "flex", alignItems: "baseline", marginBottom: 6 }}>
        <span style={{ fontSize: 13.5, color: "var(--ink)", fontWeight: 500 }}>
          {activeCount} 个可用
        </span>
        <span style={{ fontSize: 11.5, color: "var(--ink-4)", marginLeft: 8 }}>{note}</span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(160px, 1fr) 88px 116px 86px 110px",
          gap: 12,
          padding: "4px 0 7px",
          borderTop: "1px solid var(--hair-2)",
          color: "var(--ink-4)",
          fontSize: 10.5,
          fontWeight: 500,
        }}
      >
        <span>分类</span>
        <span>类型</span>
        <span>引用</span>
        <span style={{ textAlign: "right" }}>本月</span>
        <span style={{ textAlign: "right" }}>操作</span>
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
          style={{
            padding: "18px 0",
            fontSize: 12,
            color: "var(--ink-4)",
            borderTop: "1px solid var(--hair-3)",
          }}
        >
          暂无分类
        </div>
      )}
    </section>
  )
}

export function CategoriesPage() {
  const confirm = useConfirm()
  const navigate = useNavigate()
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
    () => categories.filter((category) => kindOf(category) === "expense"),
    [categories],
  )
  const incomeCategories = useMemo(
    () => categories.filter((category) => kindOf(category) === "income"),
    [categories],
  )
  const otherCategories = useMemo(
    () =>
      categories.filter((category) => {
        const kind = kindOf(category)
        return kind !== "expense" && kind !== "income"
      }),
    [categories],
  )
  const activeCount = categories.filter((category) => !category.archived).length
  const archivedCount = categories.length - activeCount

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
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          padding: "28px 32px 20px",
          borderBottom: "1px solid var(--hair-2)",
        }}
      >
        <div style={{ width: 720, maxWidth: "100%", margin: "0 auto" }}>
          <button
            type="button"
            onClick={() => void navigate({ to: "/settings" })}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: "none",
              background: "none",
              padding: 0,
              marginBottom: 14,
              cursor: "pointer",
              color: "var(--ink-3)",
              fontSize: 12.5,
              fontWeight: 500,
            }}
          >
            ‹ 返回设置
          </button>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 26,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  color: "var(--ink)",
                  marginBottom: 4,
                }}
              >
                分类管理
              </div>
              <div style={{ fontSize: 12.5, color: "var(--ink-4)" }}>
                分类按收入、支出和其他现金流分组；同名分类可以存在于不同类型。
              </div>
            </div>
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>可用</span>
                <span
                  style={{
                    fontFamily: "IBM Plex Mono, monospace",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  {activeCount}
                </span>
                <span style={{ fontSize: 12, color: "var(--ink-4)" }}>归档 {archivedCount}</span>
              </div>
              <Button
                size="sm"
                variant="primary"
                style={{ borderRadius: 5 }}
                onPress={() => openCategoryForm(null)}
              >
                + 新建分类
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-full" style={{ flex: 1, minHeight: 0 }}>
        <div
          style={{
            width: 720,
            maxWidth: "100%",
            boxSizing: "border-box",
            margin: "0 auto",
            padding: "0 0 112px",
          }}
        >
          <CategorySection
            title="支出分类"
            note="用于消费结构、预算引用和流水筛选"
            categories={expenseCategories}
            stats={stats}
            onEdit={openCategoryForm}
            onArchive={confirmArchiveCategory}
          />

          <CategorySection
            title="收入分类"
            note="用于收入结构分析，不进入支出预算"
            categories={incomeCategories}
            stats={stats}
            onEdit={openCategoryForm}
            onArchive={confirmArchiveCategory}
          />

          <CategorySection
            title="其他现金流"
            note="转账、债务、资产流转和调整类分类"
            categories={otherCategories}
            stats={stats}
            onEdit={openCategoryForm}
            onArchive={confirmArchiveCategory}
          />
        </div>
      </ScrollArea>
      <Dock />
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
