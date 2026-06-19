/**
 * @purpose Render and manage the present-asset add asset modal workflow.
 * @role    Renderer feature surface for manually maintained asset snapshots.
 * @deps    React, tRPC queries, and shared renderer UI components.
 * @gotcha  Do not infer asset balances from imported statement lines.
 */

import {
  Button,
  Calendar,
  DateField,
  DatePicker,
  Input,
  ListBox,
  Modal,
  Select,
} from "@heroui/react"
import { useEffect } from "react"
import { Controller, useForm } from "react-hook-form"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import type { AssetSnapshotType, FlowmId } from "@flowm/shared/contracts"
import { ASSET_TYPE_LABELS, ASSET_TYPES } from "@/lib/domainDisplay"
import { FormField } from "../components/ui/FormField"
import { CurrencySelect } from "../components/ui/CurrencySelect"

export const TYPE_LABEL = ASSET_TYPE_LABELS

export interface AssetForm {
  id?: FlowmId
  assetItemId?: FlowmId
  accountName: string
  assetType: AssetSnapshotType
  valueNumber: string
  valueCurrency: string
  snapshotAt: string
  note: string
}

interface Props {
  open: boolean
  form: AssetForm
  mode?: "add" | "balance" | "account"
  saving: boolean
  onSave: (form: AssetForm) => void
  onClose: () => void
}

const TITLE: Record<NonNullable<Props["mode"]>, string> = {
  add: "添加账户",
  balance: "更新余额",
  account: "编辑账户",
}

export function AddAssetModal({ open, form, mode = "add", saving, onSave, onClose }: Props) {
  const showNameType = mode === "add" || mode === "account"
  const showBalance = mode === "add" || mode === "balance"
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<AssetForm>({ defaultValues: form })

  useEffect(() => {
    if (open) reset(form)
  }, [form, open, reset])

  return (
    <Modal.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{TITLE[mode]}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>
              {mode === "balance"
                ? "记录账户当前最新余额"
                : mode === "account"
                  ? "修改账户名称或类型"
                  : "手动记录账户当前余额"}
            </p>
          </Modal.Header>

          <Modal.Body>
            <form
              id="asset-form"
              onSubmit={(event) => {
                event.preventDefault()
                void handleSubmit(onSave)()
              }}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {/* Account name */}
              {showNameType && (
                <FormField label="账户名称" required error={errors.accountName?.message}>
                  <Input
                    variant="secondary"
                    placeholder="例如：招商银行储蓄卡"
                    aria-invalid={Boolean(errors.accountName)}
                    {...register("accountName", {
                      validate: (value) =>
                        !showNameType || value.trim().length > 0 || "请输入账户名称",
                    })}
                  />
                </FormField>
              )}

              {/* Asset type */}
              {showNameType && (
                <FormField label="类型" required error={errors.assetType?.message}>
                  <Controller
                    control={control}
                    name="assetType"
                    rules={{ required: "请选择账户类型" }}
                    render={({ field }) => (
                      <Select
                        variant="secondary"
                        selectedKey={field.value}
                        onSelectionChange={(key) => field.onChange(key as AssetSnapshotType)}
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {ASSET_TYPES.map((t) => (
                              <ListBox.Item key={t} id={t} textValue={TYPE_LABEL[t]}>
                                {TYPE_LABEL[t]}
                                <ListBox.ItemIndicator />
                              </ListBox.Item>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    )}
                  />
                </FormField>
              )}

              {/* Balance */}
              {showBalance && (
                <FormField label="当前余额" required error={errors.valueNumber?.message}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Input
                      variant="secondary"
                      style={{ flex: 1 }}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      aria-invalid={Boolean(errors.valueNumber)}
                      {...register("valueNumber", {
                        validate: (value) =>
                          !showBalance ||
                          (value.trim().length > 0 && Number(value) >= 0) ||
                          "请输入有效余额",
                      })}
                    />
                    <Controller
                      control={control}
                      name="valueCurrency"
                      render={({ field }) => (
                        <CurrencySelect
                          value={field.value}
                          onChange={field.onChange}
                          className="w-[140px]"
                        />
                      )}
                    />
                  </div>
                </FormField>
              )}

              {/* Date */}
              {showBalance && (
                <FormField label="日期" required error={errors.snapshotAt?.message}>
                  <Controller
                    control={control}
                    name="snapshotAt"
                    rules={{
                      validate: (value) => !showBalance || Boolean(value) || "请选择日期",
                    }}
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
              )}

              {/* Note */}
              <FormField label="备注">
                <Input
                  variant="secondary"
                  placeholder="银行名称、账号后四位等"
                  {...register("note")}
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
