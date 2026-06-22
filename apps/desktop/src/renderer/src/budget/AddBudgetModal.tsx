/**
 * @purpose Render and manage the budget add budget modal workflow.
 * @role    Renderer feature surface for budget review and editing.
 * @deps    React, tRPC queries, and budget UI helpers.
 * @gotcha  Budget views summarize cashflow without turning plans into actual expenses.
 */

import { useEffect } from "react"
import { Button, Input, ListBox, Modal, Select } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import { ColorPickerField, DEFAULT_COLOR_SWATCHES } from "../components/ui/ColorPickerField"
import { FormField } from "../components/ui/FormField"

export interface BudgetForm {
  name: string
  plannedAmount: string
  color: string
  /** Bound expense categories; empty means an overall budget over all expenses. */
  categoryIds: string[]
}

const EMPTY: BudgetForm = {
  name: "",
  plannedAmount: "",
  color: DEFAULT_COLOR_SWATCHES[0],
  categoryIds: [],
}

interface Props {
  open: boolean
  saving: boolean
  onSave: (form: BudgetForm) => void
  onClose: () => void
  /** Expense categories selectable for the budget's scope. */
  categories: { id: string; name: string }[]
  /** When provided, the modal opens in edit mode pre-filled with these values. */
  initial?: BudgetForm
  title?: string
  subtitle?: string
}

export function AddBudgetModal({
  open,
  saving,
  onSave,
  onClose,
  categories,
  initial,
  title,
  subtitle,
}: Props) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<BudgetForm>({ defaultValues: initial ?? EMPTY })

  // Re-seed the form whenever the modal is (re)opened.
  useEffect(() => {
    if (open) reset(initial ?? EMPTY)
  }, [open, initial, reset])

  function handleClose() {
    reset(EMPTY)
    onClose()
  }

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title ?? "添加预算项"}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
              {subtitle ?? "为当前预算周期添加一个支出限额"}
            </p>
          </Modal.Header>

          <Modal.Body>
            <form
              id="budget-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit(onSave)()
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              <FormField label="预算名称" required error={errors.name?.message}>
                <Input
                  variant="secondary"
                  placeholder="例如：餐饮预算"
                  aria-invalid={Boolean(errors.name)}
                  {...register("name", {
                    validate: (value) => value.trim().length > 0 || "请输入预算名称",
                  })}
                />
              </FormField>
              <FormField label="金额限制" required error={errors.plannedAmount?.message}>
                <Input
                  variant="secondary"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-invalid={Boolean(errors.plannedAmount)}
                  {...register("plannedAmount", {
                    validate: (value) =>
                      (value.trim().length > 0 && Number(value) > 0) || "请输入大于 0 的金额",
                  })}
                />
              </FormField>
              <FormField label="覆盖分类">
                <Controller
                  control={control}
                  name="categoryIds"
                  render={({ field }) => {
                    const selectedNames = categories
                      .filter((category) => field.value.includes(category.id))
                      .map((category) => category.name)
                      .join("、")
                    return (
                      <Select
                        variant="secondary"
                        selectionMode="multiple"
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(Array.isArray(value) ? value.map(String) : [])
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        placeholder="全部支出"
                        isDisabled={categories.length === 0}
                      >
                        <Select.Trigger>
                          <Select.Value>{selectedNames || "全部支出"}</Select.Value>
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {categories.map((category) => (
                              <ListBox.Item
                                key={category.id}
                                id={category.id}
                                textValue={category.name}
                              >
                                {category.name}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )
                  }}
                />
                <div style={{ fontSize: 11, color: "var(--ink-4)", marginTop: 5 }}>
                  不选 = 统计全部支出（总额预算）；选了就只统计这些分类的流水。
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
              isDisabled={saving}
              onPress={() => void handleSubmit(onSave)()}
            >
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" slot="close">
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
