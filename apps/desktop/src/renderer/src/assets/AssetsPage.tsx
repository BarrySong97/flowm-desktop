import { useEffect, useMemo, useState } from "react"
import { Group as PanelGroup, Panel, Separator as PanelResizeHandle } from "react-resizable-panels"
import { Button } from "@heroui/react"
import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"
import { Dock } from "../components/layout/Dock"
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
import { AssetDetailPanel } from "./AssetDetailPanel"
import { MiniSparkline, fakeChange } from "../components/charts/MiniSparkline"

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

const M = { quantityNumber: null, quantityCurrency: null, source: "manual", meta: null }

const MOCK_SNAPSHOTS: AssetSnapshotSummary[] = [
  { ...M, id: 1,  accountName: "招商银行 · 储蓄卡", assetType: "bank",         valueNumber: "48230.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "· · 6621" },
  { ...M, id: 2,  accountName: "美元活期",           assetType: "bank",         valueNumber: "30156.00",   valueCurrency: "USD", snapshotAt: "2026-06-01T00:00:00.000Z", note: "$4,200 · 7.18" },
  { ...M, id: 3,  accountName: "支付宝 · 余额宝",    assetType: "wallet",       valueNumber: "23805.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "7日 1.42%" },
  { ...M, id: 4,  accountName: "工商银行 · 储蓄卡",  assetType: "bank",         valueNumber: "12500.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "· · 0473 · 工资" },
  { ...M, id: 5,  accountName: "微信 · 零钱",        assetType: "wallet",       valueNumber: "3420.00",    valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "零钱通" },
  { ...M, id: 6,  accountName: "现金",               assetType: "cash",         valueNumber: "1200.00",    valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "钱包" },
  { ...M, id: 7,  accountName: "券商 · 股票+基金",   assetType: "investment",   valueNumber: "152340.00",  valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "华泰证券" },
  { ...M, id: 8,  accountName: "住房公积金",         assetType: "investment",   valueNumber: "86420.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "每月入账" },
  { ...M, id: 9,  accountName: "比特币",             assetType: "investment",   valueNumber: "43800.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "冷钱包" },
  { ...M, id: 10, accountName: "ETF · 沪深300",      assetType: "investment",   valueNumber: "28600.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "510300" },
  { ...M, id: 11, accountName: "上海 · 住宅",        assetType: "fixed_asset",  valueNumber: "3200000.00", valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "浦东新区" },
  { ...M, id: 12, accountName: "车辆",               assetType: "fixed_asset",  valueNumber: "180000.00",  valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "特斯拉 Model 3" },
  { ...M, id: 13, accountName: "房贷",               assetType: "liability",    valueNumber: "-1850000.00",valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "30年 · 4.1%" },
  { ...M, id: 14, accountName: "信用卡 · 招行",      assetType: "liability",    valueNumber: "-8200.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "账单日 15日" },
  { ...M, id: 15, accountName: "花呗",               assetType: "liability",    valueNumber: "-3100.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: null },
  { ...M, id: 16, accountName: "建设银行 · 理财",    assetType: "bank",         valueNumber: "55000.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "90天封闭" },
  { ...M, id: 17, accountName: "货币基金",           assetType: "investment",   valueNumber: "19800.00",   valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "天天基金" },
  { ...M, id: 18, accountName: "港股账户",           assetType: "investment",   valueNumber: "67200.00",   valueCurrency: "HKD", snapshotAt: "2026-06-01T00:00:00.000Z", note: "富途牛牛" },
  { ...M, id: 19, accountName: "备用金",             assetType: "cash",         valueNumber: "5000.00",    valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "抽屉里" },
  { ...M, id: 20, accountName: "车贷",               assetType: "liability",    valueNumber: "-62000.00",  valueCurrency: "CNY", snapshotAt: "2026-06-01T00:00:00.000Z", note: "3年 · 3.85%" },
]

export function AssetsPage() {
  useFlowmStore((s) => s.assetSnapshots)
  const loadAssetSnapshots = useFlowmStore((s) => s.loadAssetSnapshots)
  const upsertAssetSnapshot = useFlowmStore((s) => s.upsertAssetSnapshot)
  const removeAssetSnapshot = useFlowmStore((s) => s.removeAssetSnapshot)

  const [form, setForm] = useState<AssetForm>(EMPTY)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailAsset, setDetailAsset] = useState<AssetSnapshotSummary | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)

  useEffect(() => { void loadAssetSnapshots() }, [loadAssetSnapshots])

  const assetSnapshots = MOCK_SNAPSHOTS

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

  const drilldownItems = useMemo(() => {
    if (!selectedGroup) return null
    return (groups.get(selectedGroup) ?? []).map((a) => ({
      name: a.accountName,
      sum: Math.abs(Number(a.valueNumber || 0)),
      color: GROUP_COLOR[selectedGroup] ?? "#8c8fa0",
    }))
  }, [selectedGroup, groups])

  const currentTreemapData = drilldownItems ?? treemapGroups
  const panelTotal = drilldownItems
    ? drilldownItems.reduce((s, x) => s + x.sum, 0)
    : totalAssets

  const lastUpdated = useMemo(() => {
    if (assetSnapshots.length === 0) return "—"
    const latest = assetSnapshots.reduce((a, b) => a.snapshotAt > b.snapshotAt ? a : b)
    return latest.snapshotAt.slice(0, 10).slice(5)
  }, [assetSnapshots])

  function openAdd() { setForm(EMPTY); setShowForm(true) }

  function openEdit(a: AssetSnapshotSummary) {
    setForm({
      id: a.id,
      accountName: a.accountName,
      assetType: a.assetType,
      valueNumber: String(Math.abs(Number(a.valueNumber))),
      valueCurrency: a.valueCurrency,
      snapshotAt: a.snapshotAt.slice(0, 10),
      note: a.note ?? "",
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
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "white" }}>

      {/* Header — fixed, never scrolls */}
      <div style={{ flexShrink: 0, padding: "28px 32px 16px", borderBottom: "1px solid var(--hair-2)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
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
            <Button size="sm" variant="primary" style={{ borderRadius: 5 }} onPress={openAdd}>＋ 添加账户</Button>
          </div>
        </div>
      </div>

      {/* Content — fills remaining height */}
      <PanelGroup orientation="horizontal" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>

        {/* Left: independently scrollable asset list */}
        <Panel defaultSize={60} minSize={30}>
        <ScrollArea className="h-full">
          <div style={{ padding: "16px 32px 112px" }}>
            {(selectedGroup ? [selectedGroup] : ["现金", "投资", "不动产", "负债", "其他"]).map((g) => {
              const items = groups.get(g)
              if (!items || items.length === 0) return null
              return (
                <div key={g}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-4)", textTransform: "uppercase", letterSpacing: "0.1em", padding: "12px 0 4px" }}>
                    {g}
                  </div>
                  {items.map((a) => {
                    const val = Number(a.valueNumber || 0)
                    const change = fakeChange(a.id)
                    return (
                      <div key={a.id} style={{ borderBottom: "1px solid var(--hair-3)" }}>
                      <Button
                        variant="ghost"
                        onPress={() => setDetailAsset(a)}
                        style={{
                          width: "100%", display: "flex", alignItems: "center",
                          padding: "10px 6px", gap: 10, height: "auto",
                          border: "none", borderRadius: 4, outline: "none",
                          textAlign: "left", justifyContent: "flex-start",
                          boxShadow: "none",
                        }}
                      >
                        <div style={{ width: 160, flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>{a.accountName}</div>
                          <Dim style={{ fontSize: 10.5, marginTop: 1 }}>
                            {a.note ? a.note : TYPE_LABEL[a.assetType]}
                          </Dim>
                        </div>
                        <MiniSparkline seed={a.id} color={val < 0 ? "var(--red)" : "var(--ink-4)"} />
                        <div style={{ flex: 1 }} />
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 14, fontWeight: 500, color: val < 0 ? "var(--red)" : "var(--ink)" }}>
                            {val < 0 ? "−" : ""}¥{fmt(Math.abs(val))}
                          </div>
                          <div style={{ fontSize: 10.5, marginTop: 1, color: change.positive ? "var(--accent)" : "var(--red)" }}>
                            {change.label}
                          </div>
                        </div>
                      </Button>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
              余额自己手动记录，不从流水推算。允许和流水之间有误差。
            </div>
          </div>
        </ScrollArea>
        </Panel>

        <PanelResizeHandle style={{ position: "relative", width: 4, background: "transparent", cursor: "col-resize" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: "1.5px", width: 1, background: "var(--hair-2)" }} />
        </PanelResizeHandle>

        {/* Right: detail panel or treemap */}
        <Panel defaultSize={40} minSize={20}>
        <ScrollArea className="h-full">
          {detailAsset ? (
            <AssetDetailPanel
              asset={detailAsset}
              onBack={() => setDetailAsset(null)}
              onEdit={openEdit}
              onDelete={(id) => { void removeAssetSnapshot(id); setDetailAsset(null) }}
            />
          ) : (
          <div style={{ padding: "16px 32px 112px" }}>
            {/* Header row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              {selectedGroup ? (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Button isIconOnly size="sm" variant="ghost" onPress={() => setSelectedGroup(null)}
                    style={{ width: 24, height: 24, minWidth: 24, borderRadius: 5 }}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Button>
                  <SectionTitle>{selectedGroup}</SectionTitle>
                </div>
              ) : (
                <SectionTitle>资产构成</SectionTitle>
              )}
              <Dim style={{ fontSize: 10.5 }}>
                {selectedGroup
                  ? <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink-2)" }}>¥{fmt(panelTotal)}</span>
                  : "面积 = 占总资产比例"
                }
              </Dim>
            </div>
            {/* Treemap */}
            <div style={{ marginTop: 12 }}>
              <AssetTreemap groups={currentTreemapData} total={panelTotal} height={220} />
            </div>
            {/* Legend list */}
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5 }}>
              {currentTreemapData.map((g) => (
                <div
                  key={g.name}
                  onClick={() => {
                    if (selectedGroup) {
                      // drill-down level: click account name to open detail
                      const acct = (groups.get(selectedGroup) ?? []).find((a) => a.accountName === g.name)
                      if (acct) setDetailAsset(acct)
                    } else {
                      setSelectedGroup(g.name)
                    }
                  }}
                  style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", borderRadius: 4, padding: "2px 0" }}
                >
                  <ColorDot color={g.color} />
                  <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{g.name}</span>
                  <span style={{ marginLeft: "auto", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, paddingRight: 8 }}>¥{fmt(g.sum)}</span>
                  <span style={{ fontSize: 11, color: "var(--ink-4)", width: 28, textAlign: "right" }}>
                    {panelTotal > 0 ? Math.round((g.sum / panelTotal) * 100) : 0}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          )}
        </ScrollArea>
        </Panel>
      </PanelGroup>

      <Dock />

      <AddAssetModal
        open={showForm}
        form={form}
        saving={saving}
        onSave={() => void save()}
        onClose={() => setShowForm(false)}
        onChange={(patch) => setForm((f) => ({ ...f, ...patch }))}
      />
    </div>
  )
}
