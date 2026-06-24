/**
 * @purpose Render and manage imported cashflow add tx modal workflow.
 * @role    Renderer feature surface for statement lines and cashflow details.
 * @deps    React, tRPC import/cashflow queries, and table/detail UI.
 * @gotcha  Imports describe past cashflow and must not update asset balances automatically.
 */

import { useEffect, useMemo } from "react"
import { Button, Calendar, DateField, DatePicker, Input, Label, Modal } from "@heroui/react"
import { Controller, useForm } from "react-hook-form"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import type { CategorySummary } from "@flowm/api"
import { todayKey } from "@/lib/dates"
import { FormField } from "../components/ui/FormField"

export interface TxForm {
  flowKind: "expense" | "income"
  amount: string
  counterparty: string
  categoryId: CategorySummary["id"] | null
  source: string
  date: string
  note: string
}

export function emptyTxForm(): TxForm {
  return {
    flowKind: "expense",
    amount: "",
    counterparty: "",
    categoryId: null,
    source: "现金",
    date: todayKey(),
    note: "",
  }
}

interface Props {
  open: boolean
  categories: CategorySummary[]
  initial?: TxForm
  title?: string
  subtitle?: string
  onClose: () => void
  onSave: (form: TxForm) => void
}

function TypeButton({
  active,
  onPress,
  children,
}: {
  active: boolean
  onPress: () => void
  children: string
}) {
  return (
    <button
      type="button"
      onClick={onPress}
      style={{
        padding: "5px 18px",
        borderRadius: 7,
        fontSize: 13,
        fontWeight: 500,
        cursor: "pointer",
        border: active ? "none" : "1px solid var(--hair-2)",
        background: active ? "var(--accent)" : "white",
        color: active ? "white" : "var(--ink-3)",
        transition: "all 0.15s",
      }}
    >
      {children}
    </button>
  )
}

function CatChip({
  category,
  active,
  onPress,
}: {
  category: CategorySummary
  active: boolean
  onPress: () => void
}) {
  const color = category.color ?? "var(--c-other)"
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onPress={onPress}
      className="h-[28px] min-w-0 px-3 text-[12px]"
      style={{
        gap: 5,
        borderRadius: 6,
        borderColor: active ? color : "var(--hair-2)",
        background: active ? `${color}1f` : "white",
        color: active ? color : "var(--ink-3)",
        fontWeight: active ? 650 : 500,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }}
      />
      {category.name}
    </Button>
  )
}

export function AddTxModal({
  open,
  categories,
  initial,
  title = "记一笔",
  subtitle = "用于现金等未绑卡的支出",
  onClose,
  onSave,
}: Props) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
  } = useForm<TxForm>({ defaultValues: initial ?? emptyTxForm() })
  const form = watch()

  const selectedCategory = useMemo(
    () => categories.find((category) => String(category.id) === String(form.categoryId)),
    [categories, form.categoryId],
  )
  const categoryOptions = useMemo(() => {
    const active = categories.filter((category) => !category.archived)
    const preferred = active.filter(
      (category) => category.categoryKind === form.flowKind || category.kind === form.flowKind,
    )
    const options = preferred.length > 0 ? preferred : active
    if (
      selectedCategory &&
      !options.some((category) => String(category.id) === String(selectedCategory.id))
    ) {
      return [selectedCategory, ...options]
    }
    return options
  }, [categories, form.flowKind, selectedCategory])

  useEffect(() => {
    if (!open) return
    reset(initial ?? emptyTxForm())
  }, [initial, open, reset])

  useEffect(() => {
    if (!open) return
    if (categoryOptions.length === 0) {
      if (form.categoryId != null) setValue("categoryId", null)
      return
    }
    if (form.categoryId == null) {
      setValue("categoryId", categoryOptions[0]?.id ?? null)
    }
  }, [categoryOptions, form.categoryId, open, setValue])

  function setFlowKind(flowKind: TxForm["flowKind"]) {
    if (form.flowKind === flowKind) return
    setValue("flowKind", flowKind)
    setValue("categoryId", null)
  }

  const amtNum = parseFloat(form.amount) || 0
  const amtDisplay =
    form.flowKind === "expense" ? `−¥ ${amtNum.toFixed(2)}` : `+¥ ${amtNum.toFixed(2)}`

  function handleClose() {
    reset(emptyTxForm())
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
        <Modal.Dialog style={{ maxWidth: 400 }}>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{title}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>{subtitle}</p>
          </Modal.Header>

          <Modal.Body>
            <form
              id="tx-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit((values) => {
                  onSave(values)
                  handleClose()
                })()
              }}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              {/* 类型 */}
              <div>
                <Label
                  style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}
                >
                  类型
                </Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <TypeButton
                    active={form.flowKind === "expense"}
                    onPress={() => setFlowKind("expense")}
                  >
                    支出
                  </TypeButton>
                  <TypeButton
                    active={form.flowKind === "income"}
                    onPress={() => setFlowKind("income")}
                  >
                    收入
                  </TypeButton>
                </div>
              </div>

              {/* 金额 */}
              <div>
                <Label
                  style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}
                >
                  金额
                </Label>
                <div
                  style={{
                    border: "1px solid var(--hair-2)",
                    borderRadius: 10,
                    padding: "12px 16px",
                    background: "var(--surface-2)",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "IBM Plex Mono, monospace",
                      fontSize: 28,
                      fontWeight: 700,
                      flex: 1,
                      color: form.flowKind === "expense" ? "var(--red)" : "var(--accent)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {amtDisplay}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="输入金额"
                    aria-invalid={Boolean(errors.amount)}
                    {...register("amount", {
                      validate: (value) =>
                        (value.trim().length > 0 && Number(value) > 0) || "请输入大于 0 的金额",
                    })}
                    style={{
                      border: "none",
                      background: "transparent",
                      outline: "none",
                      fontSize: 14,
                      color: "var(--ink-3)",
                      width: 90,
                      textAlign: "right",
                    }}
                  />
                </div>
                {errors.amount?.message && (
                  <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.4, color: "var(--red)" }}>
                    {errors.amount.message}
                  </div>
                )}
              </div>

              {/* 项目 */}
              <FormField label="项目" required error={errors.counterparty?.message}>
                <Input
                  variant="secondary"
                  placeholder="例如：菜市场/现金红包"
                  aria-invalid={Boolean(errors.counterparty)}
                  {...register("counterparty", {
                    validate: (value) => value.trim().length > 0 || "请输入项目",
                  })}
                />
              </FormField>

              {/* 类别 */}
              <div>
                <Label
                  style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 8, display: "block" }}
                >
                  类别
                </Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {categoryOptions.map((category) => (
                    <CatChip
                      key={category.id}
                      category={category}
                      active={String(form.categoryId) === String(category.id)}
                      onPress={() => setValue("categoryId", category.id)}
                    />
                  ))}
                  {categoryOptions.length === 0 && (
                    <span style={{ fontSize: 12, color: "var(--ink-4)" }}>暂无分类</span>
                  )}
                </div>
              </div>

              {/* 来源 + 日期 */}
              <div style={{ display: "flex", gap: 12 }}>
                <FormField label="来源" className="flex-1">
                  <Input variant="secondary" placeholder="例如：现金" {...register("source")} />
                </FormField>
                <FormField label="日期" required error={errors.date?.message} className="flex-1">
                  <Controller
                    control={control}
                    name="date"
                    rules={{ required: "请选择日期" }}
                    render={({ field }) => (
                      <DatePicker
                        value={parseDate(field.value)}
                        onChange={(v: DateValue | null) => {
                          if (v) field.onChange(v.toString())
                        }}
                      >
                        <DateField.Group fullWidth variant="secondary">
                          <DateField.Input>
                            {(segment) => <DateField.Segment segment={segment} />}
                          </DateField.Input>
                          <DateField.Suffix>
                            <DatePicker.Trigger>
                              <DatePicker.TriggerIndicator />
                            </DatePicker.Trigger>
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
                    )}
                  />
                </FormField>
              </div>
              <FormField label="备注">
                <Input variant="secondary" placeholder="可选" {...register("note")} />
              </FormField>
            </form>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="primary"
              style={{ borderRadius: 5 }}
              isDisabled={isSubmitting}
              onPress={() =>
                void handleSubmit((values) => {
                  onSave(values)
                  handleClose()
                })()
              }
            >
              {isSubmitting ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" style={{ borderRadius: 5 }} slot="close">
              取消
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
