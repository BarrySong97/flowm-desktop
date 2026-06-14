/**
 * @purpose Render and manage the budget add budget modal workflow.
 * @role    Renderer feature surface for budget review and editing.
 * @deps    React, tRPC queries, and budget UI helpers.
 * @gotcha  Budget views summarize cashflow without turning plans into actual expenses.
 */

import { useEffect, useState } from "react"
import { Button, Input, Label, Modal } from "@heroui/react"

export interface BudgetForm {
  name: string
  plannedAmount: string
  color: string
}

const SWATCHES = [
  "#e07b3a", "#4a8fc4", "#c46a9e", "#7c6ac4",
  "#d4a017", "#5bac8e", "#2e86ab", "#5e9e9f",
  "#14794a", "#c5242a", "#d4071c", "#e60012",
]

const EMPTY: BudgetForm = { name: "", plannedAmount: "", color: SWATCHES[0] }

interface Props {
  open: boolean
  saving: boolean
  onSave: (form: BudgetForm) => void
  onClose: () => void
  /** When provided, the modal opens in edit mode pre-filled with these values. */
  initial?: BudgetForm
  title?: string
  subtitle?: string
}

export function AddBudgetModal({ open, saving, onSave, onClose, initial, title, subtitle }: Props) {
  const [form, setForm] = useState<BudgetForm>(initial ?? EMPTY)
  function patch(p: Partial<BudgetForm>) { setForm((f) => ({ ...f, ...p })) }

  // Re-seed the form whenever the modal is (re)opened.
  useEffect(() => {
    if (open) setForm(initial ?? EMPTY)
  }, [open, initial])

  function handleClose() { setForm(EMPTY); onClose() }
  function handleSave() {
    if (!form.name.trim() || !form.plannedAmount) return
    onSave(form)
  }

  return (
    <Modal.Backdrop isOpen={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title ?? "添加预算项"}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>{subtitle ?? "为当前预算周期添加一个支出限额"}</p>
          </Modal.Header>

          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>预算名称</Label>
                <Input
                  variant="secondary"
                  value={form.name}
                  placeholder="例如：餐饮预算"
                  onChange={(e) => patch({ name: e.target.value })}
                />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>金额限制</Label>
                <Input
                  variant="secondary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.plannedAmount}
                  placeholder="0.00"
                  onChange={(e) => patch({ plannedAmount: e.target.value })}
                />
              </div>
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}>颜色</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {SWATCHES.map((c) => (
                    <button
                      key={c}
                      onClick={() => patch({ color: c })}
                      style={{
                        width: 24, height: 24, borderRadius: 6, background: c, border: "none",
                        cursor: "pointer", flexShrink: 0,
                        outline: form.color === c ? `2px solid ${c}` : "2px solid transparent",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" isDisabled={saving || !form.name.trim() || !form.plannedAmount} onPress={handleSave}>
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
