import { useEffect, useMemo, useState } from "react"
import { Button, Calendar, DateField, DatePicker, Input, Label, Modal } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import type { CategorySummary } from "@flowm/api"
import { todayKey } from "@/lib/dates"

export interface TxForm {
  flowKind: "expense" | "income"
  amount: string
  counterparty: string
  categoryId: CategorySummary["id"] | null
  source: string
  date: string
}

function emptyForm(): TxForm {
  return {
    flowKind: "expense",
    amount: "",
    counterparty: "",
    categoryId: null,
    source: "现金",
    date: todayKey(),
  }
}

interface Props {
  open: boolean
  categories: CategorySummary[]
  onClose: () => void
  onSave: (form: TxForm) => void
}

function TypeButton({ active, onPress, children }: { active: boolean; onPress: () => void; children: string }) {
  return (
    <button
      onClick={onPress}
      style={{
        padding: "5px 18px", borderRadius: 7, fontSize: 13, fontWeight: 500, cursor: "pointer",
        border: active ? "none" : "1px solid var(--hair-2)",
        background: active ? "var(--accent)" : "white",
        color: active ? "white" : "var(--ink-3)",
        transition: "all 0.15s",
      }}
    >{children}</button>
  )
}

function CatChip({ category, active, onPress }: { category: CategorySummary; active: boolean; onPress: () => void }) {
  const color = category.color ?? "var(--c-other)"
  return (
    <button
      onClick={onPress}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
        border: active ? "none" : "1px solid var(--hair-2)",
        background: active ? `${color}22` : "white",
        color: active ? color : "var(--ink-3)",
        fontWeight: active ? 600 : 400,
        transition: "all 0.12s",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 2, background: color, flexShrink: 0 }} />
      {category.name}
    </button>
  )
}

export function AddTxModal({ open, categories, onClose, onSave }: Props) {
  const [form, setForm] = useState<TxForm>(() => emptyForm())
  const [saving, setSaving] = useState(false)

  const categoryOptions = useMemo(() => {
    const active = categories.filter((category) => !category.archived)
    const preferred = active.filter((category) => category.categoryKind === form.flowKind || category.kind === form.flowKind)
    return preferred.length > 0 ? preferred : active
  }, [categories, form.flowKind])

  useEffect(() => {
    if (!open) return
    if (categoryOptions.length === 0) {
      if (form.categoryId != null) setForm((current) => ({ ...current, categoryId: null }))
      return
    }
    if (!categoryOptions.some((category) => String(category.id) === String(form.categoryId))) {
      setForm((current) => ({ ...current, categoryId: categoryOptions[0]?.id ?? null }))
    }
  }, [categoryOptions, form.categoryId, open])

  function patch(p: Partial<TxForm>) { setForm((f) => ({ ...f, ...p })) }

  const amtNum = parseFloat(form.amount) || 0
  const amtDisplay = form.flowKind === "expense"
    ? `−¥ ${amtNum.toFixed(2)}`
    : `+¥ ${amtNum.toFixed(2)}`

  function handleClose() { setForm(emptyForm()); onClose() }

  function handleSave() {
    if (!form.amount || !form.counterparty) return
    setSaving(true)
    try { onSave(form) } finally { setSaving(false); handleClose() }
  }

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Modal.Container>
        <Modal.Dialog style={{ maxWidth: 400 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>记一笔</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>用于现金等未绑卡的支出</p>
          </Modal.Header>

          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* 类型 */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>类型</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <TypeButton active={form.flowKind === "expense"} onPress={() => patch({ flowKind: "expense" })}>支出</TypeButton>
                  <TypeButton active={form.flowKind === "income"} onPress={() => patch({ flowKind: "income" })}>收入</TypeButton>
                </div>
              </div>

              {/* 金额 */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>金额</Label>
                <div style={{
                  border: "1px solid var(--hair-2)", borderRadius: 10,
                  padding: "12px 16px", background: "var(--surface-2)",
                  display: "flex", alignItems: "center",
                }}>
                  <span style={{
                    fontFamily: "IBM Plex Mono, monospace", fontSize: 28, fontWeight: 700, flex: 1,
                    color: form.flowKind === "expense" ? "var(--red)" : "var(--accent)",
                    letterSpacing: "-0.02em",
                  }}>
                    {amtDisplay}
                  </span>
                  <input
                    type="number" min="0" step="0.01"
                    value={form.amount}
                    onChange={(e) => patch({ amount: e.target.value })}
                    placeholder="0.00"
                    style={{
                      position: "absolute", opacity: 0, width: 1, height: 1, pointerEvents: "none",
                    }}
                  />
                  <input
                    type="number" min="0" step="0.01"
                    value={form.amount}
                    onChange={(e) => patch({ amount: e.target.value })}
                    placeholder="输入金额"
                    style={{
                      border: "none", background: "transparent", outline: "none",
                      fontSize: 14, color: "var(--ink-3)", width: 90, textAlign: "right",
                    }}
                  />
                </div>
              </div>

              {/* 项目 */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>项目</Label>
                <Input
                  variant="secondary"
                  value={form.counterparty}
                  placeholder="例如：菜市场/现金红包"
                  onChange={(e) => patch({ counterparty: e.target.value })}
                />
              </div>

              {/* 类别 */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>类别</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {categoryOptions.map((category) => (
                    <CatChip
                      key={category.id}
                      category={category}
                      active={String(form.categoryId) === String(category.id)}
                      onPress={() => patch({ categoryId: category.id })}
                    />
                  ))}
                  {categoryOptions.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--ink-4)" }}>暂无分类</span>
                  )}
                </div>
              </div>

              {/* 来源 + 日期 */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>来源</Label>
                  <Input
                    variant="secondary"
                    value={form.source}
                    placeholder="例如：现金"
                    onChange={(e) => patch({ source: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <DatePicker
                    value={parseDate(form.date)}
                    onChange={(v: DateValue | null) => { if (v) patch({ date: v.toString() }) }}
                  >
                    <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>日期</Label>
                    <DateField.Group fullWidth variant="secondary">
                      <DateField.Input>
                        {(segment) => <DateField.Segment segment={segment} />}
                      </DateField.Input>
                      <DateField.Suffix>
                        <DatePicker.Trigger><DatePicker.TriggerIndicator /></DatePicker.Trigger>
                      </DateField.Suffix>
                    </DateField.Group>
                    <DatePicker.Popover placement="top" style={{ maxWidth: "none" }}>
                      <Calendar>
                        <Calendar.Header>
                          <Calendar.YearPickerTrigger>
                            <Calendar.YearPickerTriggerHeading />
                            <Calendar.YearPickerTriggerIndicator />
                          </Calendar.YearPickerTrigger>
                          <Calendar.NavButton slot="previous" />
                          <Calendar.NavButton slot="next" />
                        </Calendar.Header>
                        <Calendar.Grid>
                          <Calendar.GridHeader>
                            {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
                          </Calendar.GridHeader>
                          <Calendar.GridBody>
                            {(date) => <Calendar.Cell date={date} />}
                          </Calendar.GridBody>
                        </Calendar.Grid>
                      </Calendar>
                    </DatePicker.Popover>
                  </DatePicker>
                </div>
              </div>

            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" style={{ borderRadius: 5 }} isDisabled={saving || !form.amount || !form.counterparty} onPress={handleSave}>
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" style={{ borderRadius: 5 }} slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
