import { Button, Input } from "@heroui/react"
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
  if (!open) return null
  return (
    <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="wf-modal">
        <div className="wf-head">
          <div>
            <div className="wf-title">{form.id ? "更新余额" : "添加账户"}</div>
            <div className="wf-sub">手动记录账户当前余额</div>
          </div>
          <Button isIconOnly size="sm" variant="secondary" onPress={onClose}>✕</Button>
        </div>
        <div className="wf-body">
          <div className="wf-field nb">
            <div className="wf-flabel">账户名称</div>
            <Input
              variant="primary"
              value={form.accountName}
              placeholder="例如：招商银行储蓄卡"
              onChange={(e) => onChange({ accountName: e.target.value })}
            />
          </div>
          <div className="wf-field">
            <div className="wf-flabel">类型</div>
            <div className="wf-chips">
              {ASSET_TYPES.map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={form.assetType === t ? "primary" : "outline"}
                  onPress={() => onChange({ assetType: t })}
                >
                  {TYPE_LABEL[t]}
                </Button>
              ))}
            </div>
          </div>
          <div className="wf-field">
            <div className="wf-flabel">当前余额</div>
            <div style={{ display: "flex", gap: 8 }}>
              <Input
                variant="primary"
                style={{ flex: 1 }}
                type="number"
                min="0"
                step="0.01"
                value={form.valueNumber}
                placeholder="0.00"
                onChange={(e) => onChange({ valueNumber: e.target.value })}
              />
              <Input
                variant="primary"
                style={{ width: 72 }}
                value={form.valueCurrency}
                onChange={(e) => onChange({ valueCurrency: e.target.value.toUpperCase() })}
              />
            </div>
          </div>
          <div className="wf-field">
            <div className="wf-flabel">日期</div>
            <input className="wf-input" type="date" value={form.snapshotAt}
              onChange={(e) => onChange({ snapshotAt: e.target.value })} />
          </div>
          <div className="wf-field">
            <div className="wf-flabel">备注 <span className="opt">可选</span></div>
            <Input
              variant="primary"
              value={form.note}
              placeholder="银行名称、账号后四位等"
              onChange={(e) => onChange({ note: e.target.value })}
            />
          </div>
        </div>
        <div className="wf-foot">
          <Button variant="primary" isDisabled={saving} onPress={onSave}>
            {saving ? "保存中…" : "保存"}
          </Button>
          <Button variant="outline" onPress={onClose}>取消</Button>
        </div>
      </div>
    </div>
  )
}
