import { useEffect, useMemo, useState } from "react"
import { Button, Input } from "@heroui/react"
import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

const TYPE_LABEL: Record<AssetSnapshotType, string> = {
  cash: "现金", bank: "银行", wallet: "钱包", investment: "投资",
  fixed_asset: "不动产", liability: "负债", other: "其他",
}

const GROUP_MAP: Record<AssetSnapshotType, string> = {
  cash: "现金", bank: "现金", wallet: "现金",
  investment: "投资", fixed_asset: "不动产",
  liability: "负债", other: "其他",
}

const GROUP_COLOR: Record<string, string> = {
  "现金": "var(--accent)", "投资": "var(--c-invest)",
  "不动产": "var(--c-live)", "负债": "var(--red)", "其他": "var(--c-other)",
}

const ASSET_TYPES: AssetSnapshotType[] = ["cash", "bank", "wallet", "investment", "fixed_asset", "liability", "other"]

interface Form {
  id?: number
  accountName: string
  assetType: AssetSnapshotType
  valueNumber: string
  valueCurrency: string
  snapshotAt: string
  note: string
}

const EMPTY: Form = {
  accountName: "", assetType: "bank", valueNumber: "",
  valueCurrency: "CNY", snapshotAt: new Date().toISOString().slice(0, 10), note: "",
}

export function AssetsPage() {
  const assetSnapshots = useFlowmStore((s) => s.assetSnapshots)
  const loadAssetSnapshots = useFlowmStore((s) => s.loadAssetSnapshots)
  const upsertAssetSnapshot = useFlowmStore((s) => s.upsertAssetSnapshot)
  const removeAssetSnapshot = useFlowmStore((s) => s.removeAssetSnapshot)

  const [form, setForm] = useState<Form>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { void loadAssetSnapshots() }, [loadAssetSnapshots])

  const nonLiab = assetSnapshots.filter((a) => a.assetType !== "liability")
  const liabilities = assetSnapshots.filter((a) => a.assetType === "liability")
  const totalAssets = nonLiab.reduce((s, a) => s + Number(a.valueNumber || 0), 0)
  const totalLiab = liabilities.reduce((s, a) => s + Math.abs(Number(a.valueNumber || 0)), 0)
  const liquidAssets = assetSnapshots
    .filter((a) => ["cash", "bank", "wallet"].includes(a.assetType))
    .reduce((s, a) => s + Number(a.valueNumber || 0), 0)

  const groups = useMemo(() => {
    const map = new Map<string, AssetSnapshotSummary[]>()
    for (const a of assetSnapshots) {
      const g = GROUP_MAP[a.assetType] ?? "其他"
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(a)
    }
    return map
  }, [assetSnapshots])

  const treemapGroups = useMemo(() => {
    const order = ["不动产", "投资", "现金", "其他"]
    return order
      .filter((g) => groups.has(g))
      .map((g) => ({
        name: g,
        sum: (groups.get(g) ?? []).reduce((s, a) => s + Math.abs(Number(a.valueNumber || 0)), 0),
        accounts: (groups.get(g) ?? []).sort((a, b) => Math.abs(Number(b.valueNumber)) - Math.abs(Number(a.valueNumber))),
        color: GROUP_COLOR[g] ?? "var(--c-other)",
      }))
      .filter((g) => g.sum > 0)
  }, [groups])

  const lastUpdated = useMemo(() => {
    if (assetSnapshots.length === 0) return "—"
    const latest = assetSnapshots.reduce((a, b) =>
      a.snapshotAt > b.snapshotAt ? a : b,
    )
    return latest.snapshotAt.slice(0, 10).slice(5)
  }, [assetSnapshots])

  function openAdd() { setForm(EMPTY); setShowForm(true) }
  function openEdit(a: AssetSnapshotSummary) {
    setForm({
      id: a.id, accountName: a.accountName, assetType: a.assetType,
      valueNumber: String(Math.abs(Number(a.valueNumber))),
      valueCurrency: a.valueCurrency, snapshotAt: a.snapshotAt.slice(0, 10), note: a.note ?? "",
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.accountName.trim() || !form.valueNumber) return
    setSaving(true)
    try {
      const val = Number(form.valueNumber)
      await upsertAssetSnapshot({
        id: form.id,
        accountName: form.accountName.trim(),
        assetType: form.assetType,
        snapshotAt: `${form.snapshotAt}T00:00:00.000Z`,
        valueNumber: (form.assetType === "liability" ? -Math.abs(val) : Math.abs(val)).toFixed(2),
        valueCurrency: form.valueCurrency || "CNY",
        note: form.note.trim() || null,
      })
      setShowForm(false)
      setForm(EMPTY)
    } finally { setSaving(false) }
  }

  return (
    <Shell>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 36, paddingBottom: 16, borderBottom: "1px solid var(--hair-2)" }}>
        <div>
          <div className="dm-kick" style={{ marginBottom: 6 }}>资产 · 现在有多少钱</div>
          <div className="dm-num" style={{ fontSize: 40 }}>
            <span className="cu" style={{ fontSize: 18, marginRight: 6 }}>¥</span>{fmt(totalAssets)}
          </div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 30, paddingTop: 20, alignItems: "center" }}>
          <div className="dm-stat"><div className="l">流动资产</div><div className="v">¥{fmt(liquidAssets)}</div></div>
          <div className="dm-stat"><div className="l">负债</div><div className="v neg">¥{fmt(totalLiab)}</div></div>
          <div className="dm-stat"><div className="l">账户数</div><div className="v">{assetSnapshots.length}</div></div>
          <div className="dm-stat"><div className="l">上次更新</div><div className="v">{lastUpdated}</div></div>
          <Button size="sm" variant="primary" onPress={openAdd}>＋ 添加账户</Button>
        </div>
      </div>

      {assetSnapshots.length === 0 ? (
        <div className="es-wrap">
          <div className="es-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 7l10-5 10 5-10 5zM2 7v10l10 5 10-5V7" />
            </svg>
          </div>
          <div className="es-title">还没有资产记录</div>
          <div className="es-sub">添加你的储蓄卡、投资账户、房产等，Flowm 会帮你汇总净资产。</div>
          <div className="es-actions">
            <Button variant="primary" onPress={openAdd}>添加第一个账户</Button>
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 30, flex: 1, minHeight: 0, marginTop: 16 }}>
          {/* Asset list */}
          <div style={{ overflow: "hidden" }}>
            {(["现金", "投资", "不动产", "负债", "其他"] as const).map((g) => {
              const items = groups.get(g)
              if (!items || items.length === 0) return null
              return (
                <div key={g}>
                  <div className="da-sub-h">{g}</div>
                  {items.map((a) => {
                    const val = Number(a.valueNumber || 0)
                    return (
                      <div className="da-row" key={a.id} style={{ padding: "10px 0", gap: 14 }}>
                        <div style={{ width: 180, flex: "0 0 180px", minWidth: 0 }}>
                          <div className="nm">{a.accountName}</div>
                          <div className="dim" style={{ fontSize: 10.5, marginTop: 1 }}>
                            {TYPE_LABEL[a.assetType]} · {a.snapshotAt.slice(0, 10).slice(5)}
                          </div>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div className="mono" style={{ fontSize: 14, fontWeight: 500, color: val < 0 ? "var(--red)" : "var(--ink)" }}>
                            {val < 0 ? "−" : ""}¥{fmt(Math.abs(val))}
                          </div>
                          {a.note && <div className="dim" style={{ fontSize: 10.5, marginTop: 1 }}>{a.note}</div>}
                        </div>
                        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                          <Button size="sm" variant="secondary" onPress={() => openEdit(a)}>更新</Button>
                          <Button size="sm" variant="danger-soft" onPress={() => void removeAssetSnapshot(a.id)}>删除</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--hair)", fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
              余额自己手动记录，不从流水推算。允许和流水之间有误差。
            </div>
          </div>

          {/* Treemap */}
          <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
            <div className="dm-sec">资产构成</div>
            <div className="dim" style={{ fontSize: 10.5, marginTop: 2 }}>面积 = 占总资产比例</div>
            <div style={{ marginTop: 12, flex: 1, minHeight: 220, display: "flex", flexDirection: "column", gap: 4 }}>
              {treemapGroups.map((g) => (
                <div key={g.name} style={{ flex: g.sum, minHeight: 26, display: "flex", gap: 3 }}>
                  {g.accounts.map((a, i) => {
                    const v = Math.abs(Number(a.valueNumber || 0))
                    const showLabel = v / totalAssets > 0.03
                    return (
                      <div
                        key={a.id}
                        style={{
                          flex: v, position: "relative", borderRadius: 5, overflow: "hidden",
                          background: g.color, opacity: 1 - i * 0.12, padding: "7px 9px", minWidth: 0,
                          display: "flex", flexDirection: "column", justifyContent: "space-between",
                        }}
                      >
                        <div style={{ fontSize: 10, color: "#fff", fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", opacity: .96 }}>
                          {i === 0 ? g.name : a.accountName.split(" ")[0]}
                        </div>
                        {showLabel && (
                          <div className="mono" style={{ fontSize: 10.5, color: "#fff", fontWeight: 600 }}>
                            ¥{fmt(v)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {treemapGroups.map((g) => (
                <div className="legend-r" key={g.name}>
                  <span className="cdot" style={{ background: g.color }} />
                  <span className="nm">{g.name}</span>
                  <span className="vl">¥{fmt(g.sum)}</span>
                  <span className="pc">{totalAssets > 0 ? Math.round((g.sum / totalAssets) * 100) : 0}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="wf-scrim" onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div className="wf-modal">
            <div className="wf-head">
              <div>
                <div className="wf-title">{form.id ? "更新余额" : "添加账户"}</div>
                <div className="wf-sub">手动记录账户当前余额</div>
              </div>
              <Button isIconOnly size="sm" variant="secondary" onPress={() => setShowForm(false)}>✕</Button>
            </div>
            <div className="wf-body">
              <div className="wf-field nb">
                <div className="wf-flabel">账户名称</div>
                <Input
                  variant="primary"
                  value={form.accountName}
                  placeholder="例如：招商银行储蓄卡"
                  onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
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
                      onPress={() => setForm((f) => ({ ...f, assetType: t }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, valueNumber: e.target.value }))}
                  />
                  <Input
                    variant="primary"
                    style={{ width: 72 }}
                    value={form.valueCurrency}
                    onChange={(e) => setForm((f) => ({ ...f, valueCurrency: e.target.value.toUpperCase() }))}
                  />
                </div>
              </div>
              <div className="wf-field">
                <div className="wf-flabel">日期</div>
                <input className="wf-input" type="date" value={form.snapshotAt}
                  onChange={(e) => setForm((f) => ({ ...f, snapshotAt: e.target.value }))} />
              </div>
              <div className="wf-field">
                <div className="wf-flabel">备注 <span className="opt">可选</span></div>
                <Input
                  variant="primary"
                  value={form.note}
                  placeholder="银行名称、账号后四位等"
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
            </div>
            <div className="wf-foot">
              <Button variant="primary" isDisabled={saving} onPress={() => void save()}>
                {saving ? "保存中…" : "保存"}
              </Button>
              <Button variant="outline" onPress={() => setShowForm(false)}>取消</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
