/**
 * @purpose Pick cashflow events (with full filtering + multi-select) to bind to a subscription/loan.
 * @role    Renderer modal that writes object_links via cashflow.bind for the deduction binding feature.
 * @deps    React, tRPC cashflow.list/bind + reference.categories, HeroUI Modal/Checkbox, notify, filterControls.
 * @gotcha  Binding is display-only — it must not mutate subscription/loan forecast aggregates.
 */

import { useMemo, useState } from "react"
import { Button, Checkbox, Input, Modal, Spinner } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { currencySymbol } from "@flowm/shared"
import { notify } from "@flowm/ui"
import type { CashflowEventSummary, CashflowLinkOwnerType } from "@flowm/api"
import { trpc } from "@/lib/trpc"
import { useMoney } from "@/lib/useMoney"
import { DateRangeFilter, FilterSelectField } from "../imports/filterControls"

interface Props {
  open: boolean
  ownerType: CashflowLinkOwnerType
  ownerId: string
  /** Event ids already bound to this owner — shown checked + disabled so re-binding is a no-op. */
  alreadyLinkedIds: Set<string>
  onClose: () => void
}

const KIND_OPTIONS = [
  { key: "all", label: "全部类型" },
  { key: "expense", label: "支出" },
  { key: "income", label: "收入" },
]

const FILTER_FIELD_CLASS = "min-w-0 flex-1"

function flowKindFilter(kind: string): ["income", "expense"] | "income" | "expense" {
  if (kind === "income") return "income"
  if (kind === "expense") return "expense"
  return ["income", "expense"]
}

function eventLabel(event: CashflowEventSummary): string {
  return event.title || event.counterparty || event.description || "未命名流水"
}

export function CashflowPickerModal({
  open,
  ownerType,
  ownerId,
  alreadyLinkedIds,
  onClose,
}: Props) {
  const fmt = useMoney()
  const queryClient = useQueryClient()
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: "", to: "" })
  const [sourceFilter, setSourceFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [kindFilter, setKindFilter] = useState("all")
  const [keyword, setKeyword] = useState("")
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const categoriesQuery = useQuery(trpc.reference.categories.queryOptions())
  const cashflowQuery = useQuery(
    trpc.cashflow.list.queryOptions({
      status: "active",
      flowKind: flowKindFilter(kindFilter),
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      keyword: keyword.trim() || undefined,
      dateFrom: dateRange.from || undefined,
      dateTo: dateRange.to || undefined,
      limit: 500,
    }),
  )

  const events = useMemo(() => cashflowQuery.data ?? [], [cashflowQuery.data])

  const sourceOptions = useMemo(() => {
    const sources = [...new Set(events.map((event) => event.source ?? "未知"))].sort((a, b) =>
      a.localeCompare(b),
    )
    return [
      { key: "all", label: "全部来源" },
      ...sources.map((source) => ({ key: source, label: source })),
    ]
  }, [events])

  const categoryOptions = useMemo(() => {
    const rows = (categoriesQuery.data ?? [])
      .filter((category) => !category.archived)
      .sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
    return [
      { key: "all", label: "全部分类" },
      ...rows.map((category) => ({ key: String(category.id), label: category.name })),
    ]
  }, [categoriesQuery.data])

  const visibleEvents = useMemo(
    () =>
      sourceFilter === "all"
        ? events
        : events.filter((event) => (event.source ?? "未知") === sourceFilter),
    [events, sourceFilter],
  )

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const bind = useMutation(
    trpc.cashflow.bind.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.cashflow.linkedTo.queryFilter())
      },
    }),
  )

  function handleClose() {
    setSelected(new Set())
    onClose()
  }

  async function handleConfirm() {
    const eventIds = [...selected].filter((id) => !alreadyLinkedIds.has(id))
    if (eventIds.length === 0) return
    try {
      const count = await bind.mutateAsync({ ownerType, ownerId, eventIds })
      notify.success(`已绑定 ${count} 笔流水`)
      handleClose()
    } catch (error) {
      notify.error(`绑定失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const newSelectedCount = [...selected].filter((id) => !alreadyLinkedIds.has(id)).length

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 680, width: "92vw" }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>添加扣款流水</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
              筛选并勾选要绑定到此{ownerType === "loan" ? "贷款" : "订阅"}的流水。
            </p>
          </Modal.Header>

          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: "1 1 200px", minWidth: 200 }}>
                  <span className="mb-1 block text-[10.5px] leading-[1.2] text-[var(--ink-3)]">
                    日期范围
                  </span>
                  <DateRangeFilter value={dateRange} onChange={setDateRange} />
                </div>
                <FilterSelectField
                  label="来源"
                  value={sourceFilter}
                  options={sourceOptions}
                  onChange={setSourceFilter}
                  className={FILTER_FIELD_CLASS}
                />
                <FilterSelectField
                  label="分类"
                  value={categoryFilter}
                  options={categoryOptions}
                  onChange={setCategoryFilter}
                  className={FILTER_FIELD_CLASS}
                />
                <FilterSelectField
                  label="类型"
                  value={kindFilter}
                  options={KIND_OPTIONS}
                  onChange={setKindFilter}
                  className={FILTER_FIELD_CLASS}
                />
              </div>
              <Input
                variant="secondary"
                placeholder="搜索商户 / 备注"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-[30px] min-h-[30px] text-[11.5px]"
              />

              <div
                style={{
                  border: "1px solid var(--hair-2)",
                  borderRadius: 8,
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                {cashflowQuery.isLoading ? (
                  <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
                    <Spinner />
                  </div>
                ) : visibleEvents.length === 0 ? (
                  <div
                    style={{
                      padding: "24px 0",
                      textAlign: "center",
                      fontSize: 12,
                      color: "var(--ink-4)",
                    }}
                  >
                    没有符合条件的流水。
                  </div>
                ) : (
                  visibleEvents.map((event) => {
                    const id = String(event.id)
                    const linked = alreadyLinkedIds.has(id)
                    const checked = linked || selected.has(id)
                    const isOut = event.direction === "out"
                    return (
                      <Checkbox
                        key={id}
                        variant="secondary"
                        isSelected={checked}
                        isDisabled={linked}
                        onChange={() => toggle(id)}
                        className="w-full justify-between border-b border-[var(--hair-3)] px-3 py-2 last:border-b-0 hover:bg-[var(--surface-2)]"
                      >
                        <span className="flex min-w-0 flex-1 items-center gap-3">
                          <Checkbox.Control>
                            <Checkbox.Indicator />
                          </Checkbox.Control>
                          <Checkbox.Content>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--ink)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {eventLabel(event)}
                            </span>
                            <span style={{ fontSize: 10.5, color: "var(--ink-4)", marginTop: 2 }}>
                              {event.date} · {event.categoryName ?? "未分类"} ·{" "}
                              {event.source ?? "未知"}
                              {linked ? " · 已绑定" : ""}
                            </span>
                          </Checkbox.Content>
                        </span>
                        <span
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: 12,
                            color: isOut ? "var(--red)" : "var(--accent)",
                            whiteSpace: "nowrap",
                            flexShrink: 0,
                          }}
                        >
                          {isOut ? "−" : "+"}
                          {currencySymbol(event.currency)}
                          {fmt(Math.abs(Number(event.amount || 0)), 2)}
                        </span>
                      </Checkbox>
                    )
                  })
                )}
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              isDisabled={newSelectedCount === 0 || bind.isPending}
              onPress={() => void handleConfirm()}
            >
              {bind.isPending
                ? "绑定中…"
                : `绑定 ${newSelectedCount > 0 ? `(${newSelectedCount})` : ""}`.trim()}
            </Button>
            <Button variant="outline" onPress={handleClose}>
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
