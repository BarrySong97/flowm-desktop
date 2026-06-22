/**
 * @purpose Render and manage the present-asset assets page workflow.
 * @role    Renderer feature surface for manually maintained asset snapshots.
 * @deps    React, tRPC queries, and shared renderer UI components.
 * @gotcha  Do not infer asset balances from imported statement lines.
 */

import "./assets.css"

import { memo, useMemo, useState } from "react"
import {
  Group as PanelGroup,
  Panel,
  Separator as PanelResizeHandle,
} from "@mock/_shim/resizable-panels"
import { Button, Drawer } from "@heroui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { AssetItemSummary, AssetSnapshotSummary } from "@flowm/shared/contracts"
import { trpc } from "@mock/lib/trpc"

// The mock tRPC proxy is a read-only canned-data registry: its mutationOptions / queryFilter
// helpers aren't typed for useMutation. The mutation + invalidation handlers below are never
// reached in the static mock (every surface that fires them — add/edit modal, detail panel — is
// stubbed to null), so route those calls through an `any` view to keep the source verbatim.
const trpcMut = trpc as any
import { usePagePerf } from "@mock/lib/debug/perf"
import { ASSET_GROUP_COLORS, ASSET_GROUPS, ASSET_TYPE_LABELS } from "@mock/lib/domainDisplay"
import { useMoney } from "@mock/lib/useMoney"
import { todayKey } from "@mock/lib/dates"
import { ScrollArea } from "../components/ui/ScrollArea"
import { Kicker } from "../components/ui/Kicker"
import { BigNumber } from "../components/ui/BigNumber"
import { StatBlock } from "../components/ui/StatBlock"
import { SectionTitle } from "../components/ui/SectionTitle"
import { ColorDot } from "../components/ui/ColorDot"
import { Dim } from "../components/ui/Dim"
import { AssetTreemap } from "../components/charts/AssetTreemap"
import { useCurrentRates } from "@mock/lib/useCurrentRates"
import { currencySymbol } from "@flowm/shared"

// Interaction-only surfaces (add/edit modal, asset detail panel) are stubbed to
// null in the marketing mock: they only appear after a click, and the default
// render must stay faithful without pulling in form/IPC machinery.
const TYPE_LABEL = ASSET_TYPE_LABELS

interface AssetForm {
  id?: AssetSnapshotSummary["id"]
  assetItemId?: AssetSnapshotSummary["assetItemId"]
  accountName: string
  assetType: AssetSnapshotSummary["assetType"]
  valueNumber: string
  valueCurrency: string
  snapshotAt: string
  note: string
}

function AddAssetModal(_props: {
  open: boolean
  form: AssetForm
  mode?: "add" | "balance" | "account"
  saving: boolean
  onSave: (form: AssetForm) => void
  onClose: () => void
}) {
  return null
}

function AssetDetailPanel(_props: {
  asset: AssetSnapshotSummary
  onBack: () => void
  onEdit: (a: AssetSnapshotSummary, mode: "balance" | "account") => void
  onDelete: (assetItemId: AssetSnapshotSummary["assetItemId"]) => void | Promise<void>
}) {
  return null
}

const EMPTY: AssetForm = {
  accountName: "",
  assetType: "bank",
  valueNumber: "",
  valueCurrency: "CNY",
  snapshotAt: todayKey(),
  note: "",
}

const NO_CHANGE = { label: "—", positive: true }

interface AssetRowProps {
  asset: AssetSnapshotSummary
  change: { label: string; positive: boolean }
  onSelect: (asset: AssetSnapshotSummary) => void
}

const AssetRow = memo(function AssetRow({ asset, change, onSelect }: AssetRowProps) {
  const fmt = useMoney()
  const rawValue = Number(asset.valueNumber || 0)
  const isLiability = asset.assetType === "liability"
  const val = isLiability ? -Math.abs(rawValue) : rawValue
  return (
    <div style={{ borderBottom: "1px solid var(--hair-3)" }}>
      <Button
        variant="ghost"
        onPress={() => onSelect(asset)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          padding: "10px 6px",
          gap: 10,
          height: "auto",
          border: "none",
          borderRadius: 4,
          outline: "none",
          textAlign: "left",
          justifyContent: "flex-start",
          boxShadow: "none",
        }}
      >
        <div style={{ width: 160, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--ink)" }}>
            {asset.accountName}
          </div>
          <Dim style={{ fontSize: 10.5, marginTop: 1 }}>
            {asset.note ? asset.note : TYPE_LABEL[asset.assetType]}
          </Dim>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div
            style={{
              fontFamily: "IBM Plex Mono, monospace",
              fontSize: 14,
              fontWeight: 500,
              color: isLiability ? "var(--red)" : "var(--ink)",
            }}
          >
            {isLiability ? "−" : ""}
            {currencySymbol(asset.valueCurrency)}
            {fmt(Math.abs(val))}
          </div>
          <div
            style={{
              fontSize: 10.5,
              marginTop: 1,
              color: change.positive ? "var(--accent)" : "var(--red)",
            }}
          >
            {change.label}
          </div>
        </div>
      </Button>
    </div>
  )
})

interface ArchivedAssetsDrawerProps {
  open: boolean
  items: AssetItemSummary[]
  latestSnapshots: Map<string, AssetSnapshotSummary>
  restoring: boolean
  onRestore: (assetItemId: AssetItemSummary["id"]) => void | Promise<void>
  onClose: () => void
}

function ArchivedAssetsDrawer({
  open,
  items,
  latestSnapshots,
  restoring,
  onRestore,
  onClose,
}: ArchivedAssetsDrawerProps) {
  const fmt = useMoney()
  return (
    <Drawer.Backdrop
      isOpen={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <Drawer.Content placement="right">
        <Drawer.Dialog style={{ width: 576, maxWidth: "85vw", touchAction: "none" }}>
          <Drawer.CloseTrigger />
          <Drawer.Header>
            <Drawer.Heading style={{ fontSize: 14 }}>归档账户</Drawer.Heading>
            <Dim style={{ fontSize: 11, marginTop: 2 }}>
              不计入当前资产、净值和资产构成，可恢复后继续更新余额。
            </Dim>
          </Drawer.Header>
          <Drawer.Body>
            {items.length === 0 ? (
              <div style={{ padding: "16px 0", fontSize: 12, color: "var(--ink-4)" }}>
                暂无归档账户。
              </div>
            ) : (
              <div>
                {items.map((item) => {
                  const latest = latestSnapshots.get(String(item.id))
                  const symbol = latest ? currencySymbol(latest.valueCurrency) : ""
                  return (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "10px 4px",
                        borderBottom: "1px solid var(--hair-3)",
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                          {item.name}
                        </div>
                        <Dim style={{ fontSize: 10.5, marginTop: 2 }}>
                          {TYPE_LABEL[item.assetType]} ·{" "}
                          {item.archivedAt ? `归档于 ${item.archivedAt.slice(0, 10)}` : "已归档"}
                        </Dim>
                      </div>
                      {latest && (
                        <div
                          style={{
                            fontFamily: "IBM Plex Mono, monospace",
                            fontSize: 12,
                            color: item.assetType === "liability" ? "var(--red)" : "var(--ink-2)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {symbol}
                          {fmt(Math.abs(Number(latest.valueNumber || 0)))}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="primary"
                        isDisabled={restoring}
                        style={{ borderRadius: 5, flexShrink: 0 }}
                        onPress={() => onRestore(item.id)}
                      >
                        恢复
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}
          </Drawer.Body>
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer.Backdrop>
  )
}

export function AssetsPage() {
  const fmt = useMoney()
  const queryClient = useQueryClient()
  const assetSnapshotsQuery = useQuery(trpc.assets.snapshots.queryOptions({ latestOnly: true }))
  const assetItemsQuery = useQuery(trpc.assets.items.queryOptions({ includeArchived: true }))
  const allLatestSnapshotsQuery = useQuery(
    trpc.assets.snapshots.queryOptions({ latestOnly: true, includeArchived: true }),
  )
  const assetSparklinesQuery = useQuery(trpc.assets.sparklines.queryOptions({}))
  const createAssetItem = useMutation(trpcMut.assets.createItem.mutationOptions()) as any
  const updateAssetItem = useMutation(trpcMut.assets.updateItem.mutationOptions()) as any
  const archiveAssetItem = useMutation(trpcMut.assets.archiveItem.mutationOptions()) as any
  const restoreAssetItem = useMutation(trpcMut.assets.restoreItem.mutationOptions()) as any
  const addAssetSnapshot = useMutation(trpcMut.assets.addSnapshot.mutationOptions()) as any
  usePagePerf("assets", [
    { name: "assets.snapshots.latest", query: assetSnapshotsQuery },
    { name: "assets.items.all", query: assetItemsQuery },
    { name: "assets.snapshots.allLatest", query: allLatestSnapshotsQuery },
    { name: "assets.sparklines", query: assetSparklinesQuery },
  ])

  const [form, setForm] = useState<AssetForm>(EMPTY)
  const [formMode, setFormMode] = useState<"add" | "balance" | "account">("add")
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [detailAsset, setDetailAsset] = useState<AssetSnapshotSummary | null>(null)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const assetSnapshots = assetSnapshotsQuery.data ?? []
  const archivedItems = useMemo(
    () => (assetItemsQuery.data ?? []).filter((item) => item.archived),
    [assetItemsQuery.data],
  )
  const latestSnapshotByAsset = useMemo(() => {
    const map = new Map<string, AssetSnapshotSummary>()
    for (const snapshot of allLatestSnapshotsQuery.data ?? []) {
      map.set(String(snapshot.assetItemId), snapshot)
    }
    return map
  }, [allLatestSnapshotsQuery.data])

  const changeByAsset = useMemo(() => {
    const grouped = new Map<string, number[]>()
    for (const point of assetSparklinesQuery.data ?? []) {
      const key = String(point.assetItemId)
      const rows = grouped.get(key) ?? []
      rows.push(Number(point.valueNumber || 0))
      grouped.set(key, rows)
    }
    const changes = new Map<string, { label: string; positive: boolean }>()
    for (const [assetItemId, history] of grouped) {
      if (history.length < 2) continue
      const latest = history[history.length - 1]
      const previous = history[history.length - 2]
      const delta = latest - previous
      const pct = previous === 0 ? 0 : (delta / previous) * 100
      changes.set(assetItemId, {
        label: `${delta >= 0 ? "+" : "−"}${Math.abs(pct).toFixed(1)}%`,
        positive: delta >= 0,
      })
    }
    return changes
  }, [assetSparklinesQuery.data])

  const { toDisplay, baseSymbol } = useCurrentRates()
  const nonLiab = assetSnapshots.filter((a) => a.assetType !== "liability")
  const liabilities = assetSnapshots.filter((a) => a.assetType === "liability")
  // Convert each snapshot to the base currency before summing (see useCurrentRates).
  const totalAssets = nonLiab.reduce(
    (s, a) => s + (toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0),
    0,
  )
  const totalLiab = liabilities.reduce(
    (s, a) => s + Math.abs(toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0),
    0,
  )
  const liquidAssets = assetSnapshots
    .filter((a) => ["cash", "bank", "wallet"].includes(a.assetType))
    .reduce((s, a) => s + (toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0), 0)

  const groups = useMemo(() => {
    const map = new Map<string, AssetSnapshotSummary[]>()
    for (const a of assetSnapshots) {
      const g = ASSET_GROUPS[a.assetType] ?? "其他"
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(a)
    }
    return map
  }, [assetSnapshots])

  const treemapGroups = useMemo(() => {
    const order = ["不动产", "固定资产", "投资", "现金", "其他"]
    return order
      .filter((g) => groups.has(g))
      .map((g) => ({
        name: g,
        sum: (groups.get(g) ?? []).reduce(
          (s, a) => s + Math.abs(toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0),
          0,
        ),
        color: ASSET_GROUP_COLORS[g] ?? "#8c8fa0",
      }))
      .filter((g) => g.sum > 0)
  }, [groups, toDisplay])

  const drilldownItems = useMemo(() => {
    if (!selectedGroup) return null
    return (groups.get(selectedGroup) ?? []).map((a) => ({
      name: a.accountName,
      sum: Math.abs(toDisplay(Number(a.valueNumber || 0), a.valueCurrency) ?? 0),
      color: ASSET_GROUP_COLORS[selectedGroup] ?? "#8c8fa0",
    }))
  }, [selectedGroup, groups, toDisplay])

  const currentTreemapData = drilldownItems ?? treemapGroups
  const panelTotal = drilldownItems ? drilldownItems.reduce((s, x) => s + x.sum, 0) : totalAssets

  const lastUpdated = useMemo(() => {
    if (assetSnapshots.length === 0) return "—"
    const latest = assetSnapshots.reduce((a, b) => (a.snapshotAt > b.snapshotAt ? a : b))
    return latest.snapshotAt.slice(0, 10).slice(5)
  }, [assetSnapshots])

  function openAdd() {
    setForm(EMPTY)
    setFormMode("add")
    setShowForm(true)
  }

  function openEdit(a: AssetSnapshotSummary, mode: "balance" | "account") {
    setForm({
      // Balance updates append a fresh reading: default to today with an empty
      // amount. Account edits keep the existing meta loaded for editing.
      id: mode === "account" ? a.id : undefined,
      assetItemId: a.assetItemId,
      accountName: a.accountName,
      assetType: a.assetType,
      valueNumber: mode === "balance" ? "" : String(Math.abs(Number(a.valueNumber))),
      valueCurrency: a.valueCurrency,
      snapshotAt: mode === "balance" ? todayKey() : a.snapshotAt.slice(0, 10),
      note: mode === "balance" ? "" : (a.note ?? ""),
    })
    setFormMode(mode)
    setShowForm(true)
  }

  async function save(values: AssetForm) {
    if (formMode === "account") {
      if (!values.assetItemId || !values.accountName.trim()) return
      setSaving(true)
      try {
        await updateAssetItem.mutateAsync({
          id: values.assetItemId,
          name: values.accountName.trim(),
          assetType: values.assetType,
          note: values.note.trim() || null,
        })
        await queryClient.invalidateQueries(trpcMut.assets.snapshots.queryFilter())
        await queryClient.invalidateQueries(trpcMut.assets.items.queryFilter())
        setShowForm(false)
        setForm(EMPTY)
      } finally {
        setSaving(false)
      }
      return
    }
    if (!values.accountName.trim() || !values.valueNumber) return
    setSaving(true)
    try {
      const val = Number(values.valueNumber)
      if (formMode === "balance") {
        // Updating a balance appends a new dated snapshot to the existing
        // account so the history/trend keeps growing — it does not overwrite
        // the latest reading.
        if (!values.assetItemId) return
        await addAssetSnapshot.mutateAsync({
          assetItemId: values.assetItemId,
          snapshotAt: `${values.snapshotAt}T00:00:00.000Z`,
          valueAmount: Math.abs(val).toFixed(2),
          valueCurrency: values.valueCurrency || "CNY",
          sourceKind: "manual",
          note: values.note.trim() || null,
        })
      } else {
        const item = await createAssetItem.mutateAsync({
          name: values.accountName.trim(),
          assetType: values.assetType,
          defaultCurrency: values.valueCurrency || "CNY",
          valuationMethod: ["fund", "stock", "crypto", "investment"].includes(values.assetType)
            ? "manual_market_value"
            : "manual_balance",
          note: values.note.trim() || null,
        })
        await addAssetSnapshot.mutateAsync({
          assetItemId: item.id,
          snapshotAt: `${values.snapshotAt}T00:00:00.000Z`,
          valueAmount: Math.abs(val).toFixed(2),
          valueCurrency: values.valueCurrency || "CNY",
          sourceKind: "manual",
          note: values.note.trim() || null,
        })
      }
      await queryClient.invalidateQueries(trpcMut.assets.snapshots.queryFilter())
      await queryClient.invalidateQueries(trpcMut.assets.items.queryFilter())
      await queryClient.invalidateQueries(trpcMut.assets.sparklines.queryFilter())
      await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
      await queryClient.invalidateQueries(trpcMut.reference.currentRates.queryFilter())
      setShowForm(false)
      setForm(EMPTY)
    } finally {
      setSaving(false)
    }
  }

  async function removeAsset(assetItemId: AssetSnapshotSummary["assetItemId"]) {
    await archiveAssetItem.mutateAsync({ id: assetItemId })
    await queryClient.invalidateQueries(trpcMut.assets.items.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.snapshots.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.sparklines.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
  }

  async function restoreAsset(assetItemId: AssetItemSummary["id"]) {
    await restoreAssetItem.mutateAsync({ id: assetItemId })
    await queryClient.invalidateQueries(trpcMut.assets.items.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.snapshots.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.sparklines.queryFilter())
    await queryClient.invalidateQueries(trpcMut.assets.netWorth.queryFilter())
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        background: "white",
      }}
    >
      {/* Header — fixed, never scrolls */}
      <div
        style={{
          flexShrink: 0,
          position: "relative",
          padding: "28px 32px 16px",
          borderBottom: "1px solid var(--hair-2)",
        }}
      >
        <span
          onClick={() => setShowArchived(true)}
          className="absolute top-7 right-8 cursor-pointer text-[11px] text-[var(--accent)] hover:opacity-75 transition-opacity"
        >
          归档账户{archivedItems.length > 0 ? ` · ${archivedItems.length}` : ""} →
        </span>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 36 }}>
          <div>
            <Kicker className="mb-1.5">资产 · 现在有多少钱</Kicker>
            <BigNumber style={{ fontSize: 40 }}>
              <span style={{ fontSize: 18, marginRight: 6, fontWeight: 400 }}>{baseSymbol}</span>
              {fmt(totalAssets)}
            </BigNumber>
          </div>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              gap: 30,
              paddingTop: 20,
              alignItems: "center",
            }}
          >
            <StatBlock label="流动资产" value={`${baseSymbol}${fmt(liquidAssets)}`} />
            <StatBlock
              label="负债"
              value={
                <span style={{ color: "var(--red)" }}>
                  {baseSymbol}
                  {fmt(totalLiab)}
                </span>
              }
            />
            <StatBlock label="账户数" value={assetSnapshots.length} />
            <StatBlock label="上次更新" value={lastUpdated} />
            <Button size="sm" variant="primary" style={{ borderRadius: 5 }} onPress={openAdd}>
              ＋ 添加账户
            </Button>
          </div>
        </div>
      </div>

      {/* Content — fills remaining height */}
      <PanelGroup orientation="horizontal" style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {/* Left: independently scrollable asset list */}
        <Panel defaultSize={60} minSize={30}>
          <ScrollArea className="h-full">
            <div style={{ padding: "16px 32px 112px" }}>
              {(selectedGroup ? [selectedGroup] : ["现金", "投资", "不动产", "负债", "其他"]).map(
                (g) => {
                  const items = groups.get(g)
                  if (!items || items.length === 0) return null
                  return (
                    <div key={g}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--ink-4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          padding: "12px 0 4px",
                        }}
                      >
                        {g}
                      </div>
                      {items.map((a) => (
                        <AssetRow
                          key={a.id}
                          asset={a}
                          change={changeByAsset.get(String(a.assetItemId)) ?? NO_CHANGE}
                          onSelect={setDetailAsset}
                        />
                      ))}
                    </div>
                  )
                },
              )}
              {assetSnapshots.length === 0 && (
                <div
                  style={{
                    padding: "28px 0",
                    fontSize: 12,
                    color: "var(--ink-4)",
                    lineHeight: 1.7,
                  }}
                >
                  暂无资产快照。添加账户后，这里会显示最新余额和历史增长。
                </div>
              )}
              <div style={{ marginTop: 16, fontSize: 11, color: "var(--ink-4)", lineHeight: 1.6 }}>
                余额自己手动记录，不从流水推算。允许和流水之间有误差。
              </div>
            </div>
          </ScrollArea>
        </Panel>

        <PanelResizeHandle
          style={{
            position: "relative",
            width: 4,
            background: "transparent",
            cursor: "col-resize",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: "1.5px",
              width: 1,
              background: "var(--hair-2)",
            }}
          />
        </PanelResizeHandle>

        {/* Right: detail panel or treemap */}
        <Panel defaultSize={40} minSize={20}>
          <ScrollArea className="h-full">
            {detailAsset ? (
              <AssetDetailPanel
                asset={detailAsset}
                onBack={() => setDetailAsset(null)}
                onEdit={openEdit}
                onDelete={async (assetItemId) => {
                  await removeAsset(assetItemId)
                  setDetailAsset(null)
                }}
              />
            ) : (
              <div style={{ padding: "16px 32px 112px" }}>
                {/* Header row */}
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
                >
                  {selectedGroup ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="ghost"
                        onPress={() => setSelectedGroup(null)}
                        style={{ width: 24, height: 24, minWidth: 24, borderRadius: 5 }}
                      >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path
                            d="M9 2L4 7L9 12"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </Button>
                      <SectionTitle>{selectedGroup}</SectionTitle>
                    </div>
                  ) : (
                    <SectionTitle>资产构成</SectionTitle>
                  )}
                  <Dim style={{ fontSize: 10.5 }}>
                    {selectedGroup ? (
                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: 12,
                          color: "var(--ink-2)",
                        }}
                      >
                        {baseSymbol}
                        {fmt(panelTotal)}
                      </span>
                    ) : (
                      "面积 = 占总资产比例"
                    )}
                  </Dim>
                </div>
                {/* Treemap */}
                <div style={{ marginTop: 12 }}>
                  <AssetTreemap
                    groups={currentTreemapData}
                    total={panelTotal}
                    height={220}
                    symbol={baseSymbol}
                  />
                </div>
                {/* Legend list */}
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 5 }}>
                  {currentTreemapData.map((g) => (
                    <div
                      key={g.name}
                      onClick={() => {
                        if (selectedGroup) {
                          const acct = (groups.get(selectedGroup) ?? []).find(
                            (a) => a.accountName === g.name,
                          )
                          if (acct) setDetailAsset(acct)
                        } else {
                          setSelectedGroup(g.name)
                        }
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        borderRadius: 4,
                        padding: "2px 0",
                      }}
                    >
                      <ColorDot color={g.color} />
                      <span style={{ fontSize: 12, color: "var(--ink-2)" }}>{g.name}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: 12,
                          paddingRight: 8,
                        }}
                      >
                        {baseSymbol}
                        {fmt(g.sum)}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: "var(--ink-4)",
                          width: 28,
                          textAlign: "right",
                        }}
                      >
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

      <AddAssetModal
        open={showForm}
        form={form}
        mode={formMode}
        saving={saving}
        onSave={(values) => void save(values)}
        onClose={() => setShowForm(false)}
      />
      <ArchivedAssetsDrawer
        open={showArchived}
        items={archivedItems}
        latestSnapshots={latestSnapshotByAsset}
        restoring={restoreAssetItem.isPending}
        onRestore={(assetItemId) => void restoreAsset(assetItemId)}
        onClose={() => setShowArchived(false)}
      />
    </div>
  )
}
