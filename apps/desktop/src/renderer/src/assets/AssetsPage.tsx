import { useEffect, useMemo, useState, type ReactNode } from "react"
import { Button, Card, Drawer, Input, Label, ListBox, ListBoxItem, Select, Table, TextArea, TextField } from "@heroui/react"
import { useTranslation } from "react-i18next"
import {
  ScrollArea,
} from "@flowm/ui"
import type { AssetSnapshotSummary, AssetSnapshotType } from "@flowm/api"
import { useFlowmStore } from "../lib/stores/flowmStore"

const ASSET_TYPES: AssetSnapshotType[] = ["cash", "bank", "wallet", "investment", "fixed_asset", "liability", "other"]

interface AssetFormState {
  accountName: string
  assetType: AssetSnapshotType
  valueNumber: string
  valueCurrency: string
  snapshotAt: string
  note: string
  quantityNumber: string
  unit: string
  costBasis: string
  purchaseValue: string
  location: string
  monthlyPayment: string
  dueDay: string
}

const EMPTY_FORM: AssetFormState = {
  accountName: "",
  assetType: "bank",
  valueNumber: "",
  valueCurrency: "CNY",
  snapshotAt: new Date().toISOString().slice(0, 10),
  note: "",
  quantityNumber: "",
  unit: "",
  costBasis: "",
  purchaseValue: "",
  location: "",
  monthlyPayment: "",
  dueDay: "",
}

function money(value: number, currency = "CNY") {
  return `${currency} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function absoluteNumber(value: string) {
  return Math.abs(Number(value) || 0)
}

function metricSum(snapshots: AssetSnapshotSummary[], predicate: (snapshot: AssetSnapshotSummary) => boolean) {
  return snapshots.filter(predicate).reduce((sum, snapshot) => sum + Number(snapshot.valueNumber || 0), 0)
}

export function AssetsPage() {
  const { t } = useTranslation()
  const assetSnapshots = useFlowmStore((state) => state.assetSnapshots)
  const loadAssetSnapshots = useFlowmStore((state) => state.loadAssetSnapshots)
  const loadAssetSnapshotHistory = useFlowmStore((state) => state.loadAssetSnapshotHistory)
  const upsertAssetSnapshot = useFlowmStore((state) => state.upsertAssetSnapshot)
  const removeAssetSnapshot = useFlowmStore((state) => state.removeAssetSnapshot)
  const error = useFlowmStore((state) => state.error)
  const [form, setForm] = useState<AssetFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [selectedAccountName, setSelectedAccountName] = useState<string | null>(null)
  const [selectedHistory, setSelectedHistory] = useState<AssetSnapshotSummary[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  useEffect(() => {
    void loadAssetSnapshots()
  }, [loadAssetSnapshots])

  const metrics = useMemo(() => {
    const netWorth = metricSum(assetSnapshots, () => true)
    const liquid = metricSum(assetSnapshots, (snapshot) => ["cash", "bank", "wallet"].includes(snapshot.assetType))
    const investment = metricSum(assetSnapshots, (snapshot) => snapshot.assetType === "investment")
    const fixed = metricSum(assetSnapshots, (snapshot) => snapshot.assetType === "fixed_asset")
    const liability = assetSnapshots
      .filter((snapshot) => snapshot.assetType === "liability")
      .reduce((sum, snapshot) => sum + absoluteNumber(snapshot.valueNumber), 0)
    return { netWorth, liquid, investment, fixed, liability }
  }, [assetSnapshots])
  const selectedSnapshot = selectedAccountName == null
    ? null
    : assetSnapshots.find((snapshot) => snapshot.accountName === selectedAccountName) ?? selectedHistory[0] ?? null

  useEffect(() => {
    if (selectedAccountName == null) {
      setSelectedHistory([])
      return
    }
    let canceled = false
    setHistoryLoading(true)
    void loadAssetSnapshotHistory(selectedAccountName).then((rows) => {
      if (canceled) return
      setSelectedHistory(rows)
      setHistoryLoading(false)
    })
    return () => {
      canceled = true
    }
  }, [loadAssetSnapshotHistory, selectedAccountName])

  const updateForm = <K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const fillFromSnapshot = (snapshot: AssetSnapshotSummary) => {
    const meta = snapshot.meta ?? {}
    setForm({
      accountName: snapshot.accountName,
      assetType: snapshot.assetType,
      valueNumber: String(absoluteNumber(snapshot.valueNumber)),
      valueCurrency: snapshot.valueCurrency,
      snapshotAt: new Date().toISOString().slice(0, 10),
      note: snapshot.note ?? "",
      quantityNumber: String(meta.quantityNumber ?? snapshot.quantityNumber ?? ""),
      unit: String(meta.unit ?? meta.symbol ?? snapshot.quantityCurrency ?? ""),
      costBasis: String(meta.costBasis ?? ""),
      purchaseValue: String(meta.purchaseValue ?? ""),
      location: String(meta.location ?? ""),
      monthlyPayment: String(meta.monthlyPayment ?? ""),
      dueDay: String(meta.dueDay ?? ""),
    })
  }

  const editSnapshot = (snapshot: AssetSnapshotSummary) => {
    fillFromSnapshot(snapshot)
    setSelectedAccountName(null)
  }

  const deleteSnapshot = async (snapshot: AssetSnapshotSummary) => {
    const accountName = snapshot.accountName
    await removeAssetSnapshot(snapshot.id)
    const rows = await loadAssetSnapshotHistory(accountName)
    setSelectedHistory(rows)
    if (rows.length === 0) setSelectedAccountName(null)
  }

  const submit = async () => {
    if (form.accountName.trim().length === 0) return
    const valueNumber = Number(form.valueNumber)
    if (!Number.isFinite(valueNumber) || valueNumber < 0) return
    setSubmitting(true)
    try {
      await upsertAssetSnapshot({
        accountName: form.accountName.trim(),
        assetType: form.assetType,
        snapshotAt: `${form.snapshotAt}T00:00:00.000Z`,
        valueNumber: valueNumber.toFixed(2),
        valueCurrency: form.valueCurrency || "CNY",
        quantityNumber: form.quantityNumber.trim() || null,
        quantityCurrency: form.unit.trim() || null,
        note: form.note.trim() || null,
        meta: {
          unit: form.unit.trim() || undefined,
          quantityNumber: form.quantityNumber.trim() || undefined,
          costBasis: form.costBasis.trim() || undefined,
          marketValue: form.assetType === "investment" ? valueNumber.toFixed(2) : undefined,
          purchaseValue: form.purchaseValue.trim() || undefined,
          estimatedValue: form.assetType === "fixed_asset" ? valueNumber.toFixed(2) : undefined,
          location: form.location.trim() || undefined,
          remainingPrincipal: form.assetType === "liability" ? valueNumber.toFixed(2) : undefined,
          monthlyPayment: form.monthlyPayment.trim() || undefined,
          dueDay: form.dueDay.trim() || undefined,
        },
      })
      setForm(EMPTY_FORM)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-1 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-3">
        <h1 className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--term-ink-1)]">
          {t("assets.title")}
        </h1>
        <p className="text-[11px] text-[var(--term-ink-3)]">{t("assets.description")}</p>
      </header>
      <ScrollArea className="min-h-0 flex-1" contentClassName="flex flex-col gap-4 p-4 pb-[var(--flowm-bottom-nav-safe)]">
        <section className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label={t("assets.summary.netWorth")} value={money(metrics.netWorth)} />
          <Metric label={t("assets.summary.liquid")} value={money(metrics.liquid)} />
          <Metric label={t("assets.summary.investment")} value={money(metrics.investment)} />
          <Metric label={t("assets.summary.fixed")} value={money(metrics.fixed)} />
          <Metric label={t("assets.summary.liability")} value={money(metrics.liability)} />
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]">
            <SectionHeader title={t("assets.list.title")} description={t("assets.list.description")} />
            {assetSnapshots.length === 0 ? (
              <div className="px-3 py-8 text-center text-[12px] text-[var(--term-ink-3)]">{t("assets.empty")}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <Table.Content>
                  <Table.Header>
                      <Table.Column>{t("assets.table.account")}</Table.Column>
                      <Table.Column>{t("assets.table.type")}</Table.Column>
                      <Table.Column>{t("assets.table.value")}</Table.Column>
                      <Table.Column>{t("assets.table.date")}</Table.Column>
                      <Table.Column>{t("assets.table.actions")}</Table.Column>
                  </Table.Header>
                  <Table.Body>
                    {assetSnapshots.map((snapshot) => (
                      <Table.Row
                        key={snapshot.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedAccountName(snapshot.accountName)}
                      >
                        <Table.Cell className="font-medium text-[var(--term-ink-1)]">{snapshot.accountName}</Table.Cell>
                        <Table.Cell>{t(`assets.types.${snapshot.assetType}`)}</Table.Cell>
                        <Table.Cell>{money(Number(snapshot.valueNumber), snapshot.valueCurrency)}</Table.Cell>
                        <Table.Cell>{snapshot.snapshotAt.slice(0, 10)}</Table.Cell>
                        <Table.Cell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(event) => event.stopPropagation()}
                              onPress={() => {
                                fillFromSnapshot(snapshot)
                              }}
                            >
                              {t("assets.actions.update")}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(event) => event.stopPropagation()}
                              onPress={() => {
                                void deleteSnapshot(snapshot)
                              }}
                            >
                              {t("assets.actions.delete")}
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Content>
                </Table>
              </div>
            )}
          </Card>

          <Card className="rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]">
            <SectionHeader title={t("assets.form.title")} description={t("assets.form.description")} />
            <div className="grid gap-3 p-3">
              <FieldRow label={t("assets.form.accountName")}><TextField><Input value={form.accountName} onChange={(event) => updateForm("accountName", event.target.value)} /></TextField></FieldRow>
              <div className="grid gap-3 sm:grid-cols-3">
                <SelectField
                  label={t("assets.form.type")}
                  value={form.assetType}
                  options={ASSET_TYPES.map((type) => ({ value: type, label: t(`assets.types.${type}`) }))}
                  onChange={(value) => updateForm("assetType", value as AssetSnapshotType)}
                />
                <FieldRow label={t("assets.form.value")}><TextField><Input type="number" min="0" step="0.01" value={form.valueNumber} onChange={(event) => updateForm("valueNumber", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("assets.form.currency")}><TextField><Input value={form.valueCurrency} onChange={(event) => updateForm("valueCurrency", event.target.value.toUpperCase())} /></TextField></FieldRow>
              </div>
              <TypeSpecificFields form={form} updateForm={updateForm} />
              <div className="grid gap-3 sm:grid-cols-2">
                <FieldRow label={t("assets.form.snapshotAt")}><TextField><Input type="date" value={form.snapshotAt} onChange={(event) => updateForm("snapshotAt", event.target.value)} /></TextField></FieldRow>
                <FieldRow label={t("assets.form.note")}><TextField><TextArea className="min-h-8" value={form.note} onChange={(event) => updateForm("note", event.target.value)} /></TextField></FieldRow>
              </div>
              {error ? <div className="text-[11px] text-[var(--term-red)]">{error}</div> : null}
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onPress={() => setForm(EMPTY_FORM)}>{t("assets.actions.reset")}</Button>
                <Button onPress={() => void submit()} isDisabled={submitting}>{t("assets.actions.save")}</Button>
              </div>
            </div>
          </Card>
        </section>
      </ScrollArea>
      <AssetDetailSheet
        snapshot={selectedSnapshot}
        history={selectedHistory}
        loading={historyLoading}
        onOpenChange={(open) => {
          if (!open) setSelectedAccountName(null)
        }}
        onEdit={editSnapshot}
        onDelete={deleteSnapshot}
      />
    </main>
  )
}

function AssetDetailSheet({
  snapshot,
  history,
  loading,
  onOpenChange,
  onEdit,
  onDelete,
}: {
  snapshot: AssetSnapshotSummary | null
  history: AssetSnapshotSummary[]
  loading: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (snapshot: AssetSnapshotSummary) => void
  onDelete: (snapshot: AssetSnapshotSummary) => Promise<void>
}) {
  const { t } = useTranslation()

  return (
    <Drawer isOpen={snapshot != null} onOpenChange={onOpenChange}>
      <Drawer.Backdrop />
      <Drawer.Content placement="right" className="w-full sm:!max-w-[1280px]">
        <Drawer.Dialog>
        {snapshot ? (
          <>
            <Drawer.Header className="border-b border-[var(--term-border)]">
              <Drawer.Heading>{snapshot.accountName}</Drawer.Heading>
              <p className="text-[12px] text-[var(--term-ink-3)]">
                {t(`assets.types.${snapshot.assetType}`)} · {snapshot.snapshotAt.slice(0, 10)}
              </p>
            </Drawer.Header>

            <div className="grid min-h-0 flex-1 grid-cols-[minmax(280px,360px)_1fr] divide-x divide-[var(--term-border)]">
              <aside className="flex min-h-0 flex-col gap-4 overflow-auto px-4 pb-4 pt-3">
                <Section title={t("assets.detail.terms")}>
                  <KV label={t("assets.detail.currentValue")} value={money(Number(snapshot.valueNumber), snapshot.valueCurrency)} />
                  <KV label={t("assets.table.type")} value={t(`assets.types.${snapshot.assetType}`)} />
                  <KV label={t("assets.table.date")} value={snapshot.snapshotAt.slice(0, 10)} />
                  <KV label={t("assets.detail.source")} value={snapshot.source || "manual"} />
                  {snapshotDetailRows(snapshot).map((row) => (
                    <KV key={row.label} label={t(row.label)} value={row.value} />
                  ))}
                  <KV label={t("assets.form.note")} value={snapshot.note || "—"} />
                </Section>
                <Section title={t("assets.detail.actions")}>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onPress={() => onEdit(snapshot)}>
                      {t("assets.actions.update")}
                    </Button>
                    <Button variant="ghost" size="sm" onPress={() => void onDelete(snapshot)}>
                      {t("assets.actions.delete")}
                    </Button>
                  </div>
                </Section>
              </aside>

              <section className="flex min-h-0 flex-col">
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-2">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">
                    {t("assets.detail.history")}
                  </h2>
                  <span className="font-mono text-[10px] text-[var(--term-ink-3)]">{history.length}</span>
                </div>
                {loading ? (
                  <div className="px-4 py-4 text-[12px] text-[var(--term-ink-3)]">
                    {t("assets.detail.loading")}
                  </div>
                ) : history.length === 0 ? (
                  <div className="px-4 py-4 text-[11px] text-[var(--term-ink-3)]">
                    {t("assets.detail.emptyHistory")}
                  </div>
                ) : (
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <Table.Content>
                      <Table.Header>
                          <Table.Column>{t("assets.table.date")}</Table.Column>
                          <Table.Column>{t("assets.table.type")}</Table.Column>
                          <Table.Column className="text-right">{t("assets.table.value")}</Table.Column>
                          <Table.Column>{t("assets.form.note")}</Table.Column>
                          <Table.Column>{t("assets.table.actions")}</Table.Column>
                      </Table.Header>
                      <Table.Body>
                        {history.map((entry) => (
                          <Table.Row key={entry.id}>
                            <Table.Cell>{entry.snapshotAt.slice(0, 10)}</Table.Cell>
                            <Table.Cell>{t(`assets.types.${entry.assetType}`)}</Table.Cell>
                            <Table.Cell className="text-right font-mono">{money(Number(entry.valueNumber), entry.valueCurrency)}</Table.Cell>
                            <Table.Cell className="max-w-[260px] truncate text-[var(--term-ink-2)]">
                              {entry.note || snapshotMetaLine(entry, t) || "—"}
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" onPress={() => onEdit(entry)}>
                                  {t("assets.actions.update")}
                                </Button>
                                <Button size="sm" variant="ghost" onPress={() => void onDelete(entry)}>
                                  {t("assets.actions.delete")}
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                    </Table>
                  </ScrollArea>
                )}
              </section>
            </div>
          </>
        ) : null}
        </Drawer.Dialog>
      </Drawer.Content>
    </Drawer>
  )
}

function snapshotDetailRows(snapshot: AssetSnapshotSummary) {
  const meta = snapshot.meta ?? {}
  const rows: Array<{ label: string; value: string }> = []
  const add = (label: string, value: unknown) => {
    if (value == null || value === "") return
    rows.push({ label, value: String(value) })
  }
  add("assets.form.quantity", meta.quantityNumber ?? snapshot.quantityNumber)
  add("assets.form.unit", meta.unit ?? meta.symbol ?? snapshot.quantityCurrency)
  add("assets.form.costBasis", meta.costBasis)
  add("assets.form.purchaseValue", meta.purchaseValue)
  add("assets.form.location", meta.location)
  add("assets.form.monthlyPayment", meta.monthlyPayment)
  add("assets.form.dueDay", meta.dueDay)
  return rows
}

function snapshotMetaLine(snapshot: AssetSnapshotSummary, t: (key: string) => string) {
  return snapshotDetailRows(snapshot)
    .map((row) => `${t(row.label)} ${row.value}`)
    .join(" · ")
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </section>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[var(--term-border)] py-1.5 text-[12px] last:border-0">
      <span className="text-[var(--term-ink-3)]">{label}</span>
      <span className="max-w-[180px] truncate text-right font-mono text-[var(--term-ink-1)]">{value}</span>
    </div>
  )
}

function TypeSpecificFields({
  form,
  updateForm,
}: {
  form: AssetFormState
  updateForm: <K extends keyof AssetFormState>(key: K, value: AssetFormState[K]) => void
}) {
  const { t } = useTranslation()
  if (form.assetType === "investment") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <FieldRow label={t("assets.form.quantity")}><TextField><Input value={form.quantityNumber} onChange={(event) => updateForm("quantityNumber", event.target.value)} /></TextField></FieldRow>
        <FieldRow label={t("assets.form.unit")}><TextField><Input value={form.unit} onChange={(event) => updateForm("unit", event.target.value)} /></TextField></FieldRow>
        <FieldRow label={t("assets.form.costBasis")}><TextField><Input type="number" min="0" step="0.01" value={form.costBasis} onChange={(event) => updateForm("costBasis", event.target.value)} /></TextField></FieldRow>
      </div>
    )
  }
  if (form.assetType === "fixed_asset") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow label={t("assets.form.purchaseValue")}><TextField><Input type="number" min="0" step="0.01" value={form.purchaseValue} onChange={(event) => updateForm("purchaseValue", event.target.value)} /></TextField></FieldRow>
        <FieldRow label={t("assets.form.location")}><TextField><Input value={form.location} onChange={(event) => updateForm("location", event.target.value)} /></TextField></FieldRow>
      </div>
    )
  }
  if (form.assetType === "liability") {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        <FieldRow label={t("assets.form.monthlyPayment")}><TextField><Input type="number" min="0" step="0.01" value={form.monthlyPayment} onChange={(event) => updateForm("monthlyPayment", event.target.value)} /></TextField></FieldRow>
        <FieldRow label={t("assets.form.dueDay")}><TextField><Input type="number" min="1" max="31" step="1" value={form.dueDay} onChange={(event) => updateForm("dueDay", event.target.value)} /></TextField></FieldRow>
      </div>
    )
  }
  return null
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card className="rounded-[8px] p-0 shadow-none border border-[var(--term-border)]">
      <Card.Content className="px-3 py-2 gap-0">
        <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</div>
        <div className="mt-1 truncate text-[16px] font-semibold text-[var(--term-ink-1)]">{value}</div>
      </Card.Content>
    </Card>
  )
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="grid gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</Label>
      <Select selectedKey={value} onSelectionChange={(key) => onChange(String(key))} fullWidth>
        <Select.Trigger><Select.Value /><Select.Indicator /></Select.Trigger>
        <Select.Popover>
          <ListBox>
            {options.map((opt) => <ListBoxItem key={opt.value} id={opt.value}>{opt.label}</ListBoxItem>)}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  )
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</Label>
      {children}
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <header className="border-b border-[var(--term-border)] bg-[var(--term-panel-alt)] px-3 py-2">
      <h2 className="text-[12px] font-semibold text-[var(--term-ink-1)]">{title}</h2>
      <p className="mt-0.5 text-[11px] text-[var(--term-ink-3)]">{description}</p>
    </header>
  )
}
