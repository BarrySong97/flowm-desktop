import { Button, Calendar, DateField, DatePicker, Drawer, Input, Label, ListBox, Select } from "@heroui/react"
import type { DateValue } from "@internationalized/date"
import { parseDate } from "@internationalized/date"
import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/api"
import { useEffect, useState } from "react"
import { ASSET_TYPES, TYPE_LABEL } from "./AddAssetModal"
import type { AssetForm } from "./AddAssetModal"

interface Props {
  asset: AssetSnapshotSummary | null
  onClose: () => void
  onSave: (form: AssetForm) => Promise<void>
  onDelete: (id: AssetSnapshotSummary["id"]) => void
}

export function AssetDrawer({ asset, onClose, onSave, onDelete }: Props) {
  const [form, setForm] = useState<AssetForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (asset) {
      setForm({
        id: asset.id,
        accountName: asset.accountName,
        assetType: asset.assetType,
        valueNumber: String(Math.abs(Number(asset.valueNumber))),
        valueCurrency: asset.valueCurrency,
        snapshotAt: asset.snapshotAt.slice(0, 10),
        note: asset.note ?? "",
      })
      setConfirming(false)
    }
  }, [asset])

  async function handleSave() {
    if (!form || !form.accountName.trim() || !form.valueNumber) return
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } finally { setSaving(false) }
  }

  function handleDelete() {
    if (!asset) return
    if (!confirming) { setConfirming(true); return }
    onDelete(asset.id)
    onClose()
  }

  return (
    <Drawer.Backdrop isOpen={asset !== null} onOpenChange={(v) => { if (!v) onClose() }}>
      <Drawer.Content placement="right">
        <Drawer.Dialog>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading className="text-sm font-semibold">
              {form?.accountName || "账户详情"}
            </Drawer.Heading>
            {form && (
              <p className="text-[11.5px] text-[var(--ink-4)] mt-0.5">{TYPE_LABEL[form.assetType]}</p>
            )}
          </Drawer.Header>

          {form && (
            <Drawer.Body>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {/* Account name */}
                <div>
                  <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>账户名称</Label>
                  <Input
                    variant="secondary"
                    value={form.accountName}
                    placeholder="例如：招商银行储蓄卡"
                    onChange={(e) => setForm((f) => f && ({ ...f, accountName: e.target.value }))}
                  />
                </div>

                {/* Asset type */}
                <div>
                  <Label style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}>类型</Label>
                  <Select
                    variant="secondary"
                    selectedKey={form.assetType}
                    onSelectionChange={(key) => setForm((f) => f && ({ ...f, assetType: key as AssetSnapshotType }))}
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
                      onChange={(e) => setForm((f) => f && ({ ...f, valueNumber: e.target.value }))}
                    />
                    <Input
                      variant="secondary"
                      style={{ width: 68 }}
                      value={form.valueCurrency}
                      onChange={(e) => setForm((f) => f && ({ ...f, valueCurrency: e.target.value.toUpperCase() }))}
                    />
                  </div>
                </div>

                {/* Date */}
                <div>
                  <DatePicker
                    value={parseDate(form.snapshotAt)}
                    onChange={(v: DateValue | null) => {
                      if (v) setForm((f) => f && ({ ...f, snapshotAt: v.toString() }))
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
                    onChange={(e) => setForm((f) => f && ({ ...f, note: e.target.value }))}
                  />
                </div>

              </div>
            </Drawer.Body>
          )}

          <Drawer.Footer>
            <Button
              size="sm"
              variant="primary"
              style={{ borderRadius: 5 }}
              isDisabled={saving}
              onPress={() => void handleSave()}
            >
              {saving ? "保存中…" : "保存更新"}
            </Button>
            <Button
              size="sm"
              variant={confirming ? "danger" : "danger-soft"}
              style={{ borderRadius: 5 }}
              onPress={handleDelete}
            >
              {confirming ? "确认删除" : "删除账户"}
            </Button>
          </Drawer.Footer>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}
