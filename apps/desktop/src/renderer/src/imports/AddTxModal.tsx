import { useState } from "react"
import { Button, Calendar, DateField, DatePicker, Input, Label, Modal } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"

const CATEGORIES = ["居住", "餐饮", "交通", "购物", "订阅", "娱乐", "理财", "收入", "其他"] as const
type Category = typeof CATEGORIES[number]

const CAT_COLOR: Record<Category, string> = {
  居住: "#5bac8e", 餐饮: "#e07b3a", 交通: "#4a8fc4", 购物: "#c46a9e",
  订阅: "#7c6ac4", 娱乐: "#d4a017", 理财: "#2e86ab", 收入: "#14794a", 其他: "#9caca3",
}

const SOURCES = ["现金", "其它"] as const
type Source = typeof SOURCES[number]

interface TxForm {
  flowKind: "expense" | "income"
  amount: string
  counterparty: string
  category: Category
  source: Source
  date: string
}

const EMPTY: TxForm = {
  flowKind: "expense",
  amount: "",
  counterparty: "",
  category: "餐饮",
  source: "现金",
  date: "2026-06-11",
}

interface Props {
  open: boolean
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

function CatChip({ name, active, onPress }: { name: Category; active: boolean; onPress: () => void }) {
  const color = CAT_COLOR[name]
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
      {name}
    </button>
  )
}

function SourceChip({ label, active, onPress }: { label: Source; active: boolean; onPress: () => void }) {
  return (
    <button
      onClick={onPress}
      style={{
        padding: "5px 16px", borderRadius: 7, fontSize: 12, fontWeight: 500, cursor: "pointer",
        border: active ? "none" : "1px solid var(--hair-2)",
        background: active ? "var(--accent)" : "white",
        color: active ? "white" : "var(--ink-3)",
        transition: "all 0.15s",
      }}
    >{label}</button>
  )
}

export function AddTxModal({ open, onClose, onSave }: Props) {
  const [form, setForm] = useState<TxForm>(EMPTY)
  const [saving, setSaving] = useState(false)

  function patch(p: Partial<TxForm>) { setForm((f) => ({ ...f, ...p })) }

  const amtNum = parseFloat(form.amount) || 0
  const amtDisplay = form.flowKind === "expense"
    ? `−¥ ${amtNum.toFixed(2)}`
    : `+¥ ${amtNum.toFixed(2)}`

  function handleClose() { setForm(EMPTY); onClose() }

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
                  {CATEGORIES.map((c) => (
                    <CatChip key={c} name={c} active={form.category === c} onPress={() => patch({ category: c })} />
                  ))}
                </div>
              </div>

              {/* 来源 + 日期 */}
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>来源</Label>
                  <div style={{ display: "flex", gap: 6 }}>
                    {SOURCES.map((s) => (
                      <SourceChip key={s} label={s} active={form.source === s} onPress={() => patch({ source: s })} />
                    ))}
                  </div>
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
