import { Button, Calendar, DateField, DatePicker, Input, Label, ListBox, Modal, Select } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import type { AssetSnapshotType } from "@flowm/api"

export const TYPE_LABEL: Record<AssetSnapshotType, string> = {
  cash: "现金", bank: "银行", wallet: "钱包", investment: "投资",
  fixed_asset: "不动产", liability: "负债", other: "其他",
}

const ASSET_TYPES: AssetSnapshotType[] = ["cash", "bank", "wallet", "investment", "fixed_asset", "liability", "other"]

export interface AssetForm {
  id?: number
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
  saving: boolean
  onSave: () => void
  onClose: () => void
  onChange: (patch: Partial<AssetForm>) => void
}

export function AddAssetModal({ open, form, saving, onSave, onClose, onChange }: Props) {
  return (
    <Modal.Backdrop isOpen={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <Modal.Container>
        <Modal.Dialog>
          <Modal.CloseTrigger />
          <Modal.Header>
            <Modal.Heading>{form.id ? "更新余额" : "添加账户"}</Modal.Heading>
            <p style={{ fontSize: 12, color: "var(--ink-4)", marginTop: 2 }}>手动记录账户当前余额</p>
          </Modal.Header>

          <Modal.Body>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Account name */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>账户名称</Label>
                <Input
                  variant="secondary"
                  value={form.accountName}
                  placeholder="例如：招商银行储蓄卡"
                  onChange={(e) => onChange({ accountName: e.target.value })}
                />
              </div>

              {/* Asset type */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>类型</Label>
                <Select
                  variant="secondary"
                  selectedKey={form.assetType}
                  onSelectionChange={(key) => onChange({ assetType: key as AssetSnapshotType })}
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
              </div>

              {/* Balance */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>当前余额</Label>
                <div style={{ display: "flex", gap: 8 }}>
                  <Input
                    variant="secondary"
                    style={{ flex: 1 }}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.valueNumber}
                    placeholder="0.00"
                    onChange={(e) => onChange({ valueNumber: e.target.value })}
                  />
                  <Input
                    variant="secondary"
                    style={{ width: 72 }}
                    value={form.valueCurrency}
                    onChange={(e) => onChange({ valueCurrency: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <DatePicker
                  value={parseDate(form.snapshotAt)}
                  onChange={(v: DateValue | null) => {
                    if (v) onChange({ snapshotAt: v.toString() })
                  }}
                >
                  <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>日期</Label>
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
              </div>

              {/* Note */}
              <div>
                <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>
                  备注 <span className="opt">可选</span>
                </Label>
                <Input
                  variant="secondary"
                  value={form.note}
                  placeholder="银行名称、账号后四位等"
                  onChange={(e) => onChange({ note: e.target.value })}
                />
              </div>

            </div>
          </Modal.Body>

          <Modal.Footer>
            <Button variant="primary" isDisabled={saving} onPress={onSave}>
              {saving ? "保存中…" : "保存"}
            </Button>
            <Button variant="outline" slot="close">取消</Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  )
}
