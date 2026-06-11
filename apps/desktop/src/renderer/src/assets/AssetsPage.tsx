import { useEffect, useMemo, useState } from "react"
import { Button } from "@heroui/react"
import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Shell } from "../components/layout/Shell"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Kicker } from "../components/ui/Kicker"
import { BigNumber } from "../components/ui/BigNumber"
import { StatBlock } from "../components/ui/StatBlock"
import { SectionTitle } from "../components/ui/SectionTitle"
import { ColorDot } from "../components/ui/ColorDot"
import { Dim } from "../components/ui/Dim"
import { AssetTreemap } from "../components/charts/AssetTreemap"
import { AddAssetModal, TYPE_LABEL } from "./AddAssetModal"
import type { AssetForm } from "./AddAssetModal"

function fmt(n: number, d = 0) {
  return n.toLocaleString("zh-CN", { minimumFractionDigits: d, maximumFractionDigits: d })
}

const GROUP_MAP: Record<AssetSnapshotType, string> = {
  cash: "现金", bank: "现金", wallet: "现金",
  investment: "投资", fixed_asset: "不动产",
  liability: "负债", other: "其他",
}

const GROUP_COLOR: Record<string, string> = {
  "现金": "var(--accent)",
  "投资": "#6c72cb",
  "不动产": "#e07b39",
  "负债": "var(--red)",
  "其他": "#8c8fa0",
}

const EMPTY: AssetForm = {
  accountName: "", assetType: "bank", valueNumber: "",
  valueCurrency: "CNY", snapshotAt: new Date().toISOString().slice(0, 10), note: "",
}

export function AssetsPage() {
  const assetSnapshots = useFlowmStore((s) => s.assetSnapshots)
  const loadAssetSnapshots = useFlowmStore((s) => s.loadAssetSnapshots)
  const upsertAssetSnapshot = useFlowmStore((s) => s.upsertAssetSnapshot)
  const removeAssetSnapshot = useFlowmStore((s) => s.removeAssetSnapshot)

  const [form, setForm] = useState<AssetForm>(EMPTY)
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
        color: GROUP_COLOR[g] ?? "#8c8fa0",
      }))
      .filter((g) => g.sum > 0)
  }, [groups])

  const lastUpdated = useMemo(() => {
    if (assetSnapshots.length === 0) return "—"
    const latest = assetSnapshots.reduce((a, b) => a.snapshotAt > b.snapshotAt ? a : b)
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
          <Kicker className="mb-1.5">资产 · 现在有多少钱</Kicker>
          <BigNumber style={{ fontSize: 40 }}>
            <span style={{ fontSize: 18, marginRight: 6, fontWeight: 400 }}>¥</span>{fmt(totalAssets)}
          </BigNumber>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 30, paddingTop: 20, alignItems: "center" }}>
          <StatBlock label="流动资产" value={`¥${fmt(liquidAssets)}`} />
          <StatBlock label="负债" value={<span style={{ color: "var(--red)" }}>¥{fmt(totalLiab)}</span>} />
          <StatBlock label="账户数" value={assetSnapshots.length} />
          <StatBlock label="上次更新" value={lastUpdated} />
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
          <ScrollArea style={{ flex: 1, minHeight: 0 }}>
            {(["现金", "投资", "不动产", "负债", "其他"] as const).map((g) => {
              const items = groups.get(g)
              if (!items || items.length === 0) return null
              return (
                <div key={g}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "10px 0 4px" }}>
                    {g}
                  </div>
                  {items.map((a) => {
                    const val = Number(a.valueNumber || 0)
                    return (
                      <div
                        key={a.id}
                        style={{ display: "flex", alignItems: "center", padding: "10px 0", gap: 14, borderBottom: "1px solid var(--hair-3)" }}
                      >
                        <div style={{ width: 180, flex: "0 0 180px", minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{a.accountName}</div>
                          <Dim style={{ fontSize: 10.5, marginTop: 1 }}>
                            {TYPE_LABEL[a.assetType]} · {a.snapshotAt.slice(0, 10).slice(5)}
                          </Dim>
                        </div>
                        <div style={{ marginLeft: "auto", textAlign: "right" }}>
                          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 500, color: val < 0 ? "var(--red)" : "var(--ink)" }}>
                            {val < 0 ? "−" : ""}¥{fmt(Math.abs(val))}
                          </div>
                          {a.note && <Dim style={{ fontSize: 10.5, marginTop: 1 }}>{a.note}</Dim>}
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
          </ScrollArea>

          {/* Treemap + legend */}
          <div style={{ alignSelf: "stretch", display: "flex", flexDirection: "column" }}>
            <SectionTitle>资产构成</SectionTitle>
            <Dim style={{ fontSize: 10.5, marginTop: 2 }}>面积 = 占总资产比例</Dim>
            <div style={{ marginTop: 12, flex: 1, minHeight: 220 }}>
              <AssetTreemap groups={treemapGroups} total={totalAssets} height={220} />
            </div>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {treemapGroups.map((g) => (
                <div key={g.name} className="legend-r">
                  <ColorDot color={g.color} />
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{g.name}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>¥{fmt(g.sum)}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", width: 32, textAlign: "right" }}>
                    {totalAssets > 0 ? Math.round((g.sum / totalAssets) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <AddAssetModal
        open={showForm}
        form={form}
        saving={saving}
        onSave={() => void save()}
        onClose={() => setShowForm(false)}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />
    </Shell>
  )
}
