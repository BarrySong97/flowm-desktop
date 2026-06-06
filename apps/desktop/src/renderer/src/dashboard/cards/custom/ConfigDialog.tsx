import { useCallback, useEffect, useState } from "react"
import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { getFlowmApi } from "@flowm/api"
import {
  Button,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Modal,
  Select,
  TextArea,
} from "@heroui/react"
import { ScrollArea } from "@flowm/ui"
import type { CardConfigDialogProps } from "../../registry"
import { columnLabel } from "./columnLabel"
import { defaultConfigForViz } from "./defaults"
import type { CustomCardConfig, CustomKpiFormat, CustomVizKind } from "./types"

const VIZ_OPTIONS: CustomVizKind[] = [
  "kpi",
  "table",
  "line",
  "area",
  "bar",
  "pie",
  "donut",
  "text",
  "progress",
]

const FORMAT_KINDS: CustomKpiFormat["kind"][] = ["number", "currency", "percent"]

export function CustomCardConfigDialog({ config, onSave, onClose }: CardConfigDialogProps<CustomCardConfig>) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<CustomCardConfig>(config)
  const [columns, setColumns] = useState<string[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [previewRows, setPreviewRows] = useState<number | null>(null)

  const setField = <K extends keyof CustomCardConfig>(key: K, value: CustomCardConfig[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const setFormat = (patch: Partial<CustomKpiFormat>) => {
    setDraft((current) => ({
      ...current,
      format: {
        kind: current.format?.kind ?? "number",
        decimals: current.format?.decimals,
        currency: current.format?.currency,
        ...patch,
      },
    }))
  }

  const runPreview = useCallback(async (sql: string | undefined) => {
    if (sql == null || sql.trim().length === 0) {
      setColumns([])
      setPreviewRows(null)
      setPreviewError(null)
      return
    }
    setPreviewLoading(true)
    setPreviewError(null)
    try {
      const api = getFlowmApi()
      const response = await api.runFlowQuery({ sql })
      if (response.success) {
        setColumns(response.data.columns)
        setPreviewRows(response.data.rows.length)
      } else {
        setColumns([])
        setPreviewRows(null)
        setPreviewError(response.error)
      }
    } catch (err) {
      setColumns([])
      setPreviewRows(null)
      setPreviewError(err instanceof Error ? err.message : String(err))
    } finally {
      setPreviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (draft.viz !== "text") {
      void runPreview(draft.sql)
    }
    // Run once on mount; user can re-run via the Run button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeViz = (nextViz: CustomVizKind) => {
    setDraft((current) => {
      const fresh = defaultConfigForViz(nextViz)
      return {
        ...fresh,
        ...current,
        viz: nextViz,
        // When switching INTO text, preserve markdown if present; otherwise reset SQL-only fields if needed.
        sql: nextViz === "text" ? current.sql : current.sql ?? fresh.sql,
        markdown: nextViz === "text" ? current.markdown ?? "" : current.markdown,
      }
    })
  }

  const viz = draft.viz
  const showSql = viz !== "text"

  return (
    <Modal isOpen onOpenChange={(next) => { if (!next) onClose() }}>
      <Modal.Backdrop />
      <Modal.Container size="lg">
        <Modal.Dialog>
          <Modal.Header>
            <Modal.Heading>{t("cards.custom.dialog.title")}</Modal.Heading>
            <p className="mt-0.5 text-[11px] text-[var(--term-ink-3)]">{t("cards.custom.dialog.description")}</p>
          </Modal.Header>
          <Modal.Body>
            <ScrollArea className="max-h-[60vh]">
              <div className="grid grid-cols-1 gap-3 pr-1 lg:grid-cols-2">
                <FullWidth>
                  <FieldRow label={t("cards.custom.viz")}>
                    <Select
                      selectedKey={draft.viz}
                      onSelectionChange={(key) => changeViz(String(key) as CustomVizKind)}
                      fullWidth
                    >
                      <Select.Trigger>
                        <Select.Value />
                        <Select.Indicator />
                      </Select.Trigger>
                      <Select.Popover>
                        <ListBox>
                          {VIZ_OPTIONS.map((kind) => (
                            <ListBoxItem key={kind} id={kind}>
                              {t(`cards.custom.vizOption.${kind}`)}
                            </ListBoxItem>
                          ))}
                        </ListBox>
                      </Select.Popover>
                    </Select>
                  </FieldRow>
                </FullWidth>

                {showSql && (
                  <FullWidth>
                    <FieldRow label={t("cards.custom.sql")}>
                      <TextArea
                        value={draft.sql ?? ""}
                        onChange={(event) => setField("sql", event.target.value)}
                        className="h-28 font-mono text-[11px]"
                        spellCheck={false}
                      />
                      <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[var(--term-ink-3)]">
                        <Button
                          size="sm"
                          variant="outline"
                          onPress={() => void runPreview(draft.sql)}
                          isDisabled={previewLoading}
                        >
                          {previewLoading ? t("cards.custom.loading") : t("cards.custom.run")}
                        </Button>
                        {previewError ? (
                          <span className="font-mono text-[var(--term-red)]">{previewError}</span>
                        ) : previewRows != null ? (
                          <span className="font-mono">
                            {t("cards.custom.dialog.previewRows", { count: previewRows })}
                            {columns.length > 0 && (
                              <span className="ml-2 text-[var(--term-ink-2)]">
                                [{columns.map((column) => columnLabel(t, column)).join(", ")}]
                              </span>
                            )}
                          </span>
                        ) : null}
                      </div>
                    </FieldRow>
                  </FullWidth>
                )}

                {viz === "text" && (
                  <FullWidth>
                    <FieldRow label={t("cards.custom.markdown")}>
                      <TextArea
                        value={draft.markdown ?? ""}
                        onChange={(event) => setField("markdown", event.target.value)}
                        className="h-40 font-sans text-[12px]"
                        placeholder={t("cards.custom.markdownPlaceholder") ?? ""}
                      />
                    </FieldRow>
                  </FullWidth>
                )}

                {(viz === "line" || viz === "area" || viz === "bar") && (
                  <>
                    <FieldRow label={t("cards.custom.xColumn")}>
                      <ColumnSelect value={draft.xColumn} columns={columns} onChange={(value) => setField("xColumn", value)} />
                    </FieldRow>
                    <FieldRow label={t("cards.custom.yColumns")}>
                      <YColumnsSelect value={draft.yColumns} columns={columns} xColumn={draft.xColumn} onChange={(value) => setField("yColumns", value)} />
                    </FieldRow>
                    <FieldRow label={t("cards.custom.seriesColumn")}>
                      <ColumnSelect value={draft.seriesColumn} columns={columns} onChange={(value) => setField("seriesColumn", value)} />
                    </FieldRow>
                    <FieldRow label={t("cards.custom.valueColumn")}>
                      <ColumnSelect value={draft.valueColumn} columns={columns} onChange={(value) => setField("valueColumn", value)} />
                    </FieldRow>
                  </>
                )}

                {(viz === "line" || viz === "area") && (
                  <FieldRow label={t("cards.custom.smooth")}>
                    <ToggleButton active={draft.smooth ?? true} onToggle={() => setField("smooth", !(draft.smooth ?? true))}>
                      {draft.smooth ?? true ? t("cards.custom.on") : t("cards.custom.off")}
                    </ToggleButton>
                  </FieldRow>
                )}

                {viz === "bar" && (
                  <FieldRow label={t("cards.custom.stacked")}>
                    <ToggleButton active={draft.stacked ?? false} onToggle={() => setField("stacked", !(draft.stacked ?? false))}>
                      {draft.stacked ? t("cards.custom.on") : t("cards.custom.off")}
                    </ToggleButton>
                  </FieldRow>
                )}

                {(viz === "pie" || viz === "donut") && (
                  <>
                    <FieldRow label={t("cards.custom.labelColumn")}>
                      <ColumnSelect value={draft.labelColumn} columns={columns} onChange={(value) => setField("labelColumn", value)} />
                    </FieldRow>
                    <FieldRow label={t("cards.custom.valueColumn")}>
                      <ColumnSelect value={draft.valueColumn} columns={columns} onChange={(value) => setField("valueColumn", value)} />
                    </FieldRow>
                  </>
                )}

                {(viz === "kpi" || viz === "progress") && (
                  <>
                    <FieldRow label={t("cards.custom.valueColumn")}>
                      <ColumnSelect value={draft.valueColumn} columns={columns} onChange={(value) => setField("valueColumn", value)} />
                    </FieldRow>
                    <FieldRow label={t("cards.custom.formatKind")}>
                      <Select
                        selectedKey={draft.format?.kind ?? "number"}
                        onSelectionChange={(key) => setFormat({ kind: String(key) as CustomKpiFormat["kind"] })}
                        fullWidth
                      >
                        <Select.Trigger>
                          <Select.Value />
                          <Select.Indicator />
                        </Select.Trigger>
                        <Select.Popover>
                          <ListBox>
                            {FORMAT_KINDS.map((kind) => (
                              <ListBoxItem key={kind} id={kind}>
                                {t(`cards.custom.formatKindOption.${kind}`)}
                              </ListBoxItem>
                            ))}
                          </ListBox>
                        </Select.Popover>
                      </Select>
                    </FieldRow>
                    <FieldRow label={t("cards.custom.decimals")}>
                      <Input
                        type="number"
                        min={0}
                        max={6}
                        value={String(draft.format?.decimals ?? "")}
                        onChange={(event) => {
                          const raw = event.target.value
                          setFormat({ decimals: raw === "" ? undefined : Number(raw) })
                        }}
                      />
                    </FieldRow>
                    {viz === "progress" && (
                      <FieldRow label={t("cards.custom.target")}>
                        <Input
                          type="number"
                          value={String(draft.target ?? "")}
                          onChange={(event) => {
                            const raw = event.target.value
                            setField("target", raw === "" ? undefined : Number(raw))
                          }}
                        />
                      </FieldRow>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onPress={onClose}>
              {t("cards.custom.cancel")}
            </Button>
            <Button onPress={() => onSave(draft)}>
              {t("cards.custom.saveAndRun")}
            </Button>
          </Modal.Footer>
        </Modal.Dialog>
      </Modal.Container>
    </Modal>
  )
}

interface FullWidthProps {
  children: ReactNode
}

function FullWidth({ children }: FullWidthProps) {
  return <div className="lg:col-span-2">{children}</div>
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</Label>
      {children}
    </div>
  )
}

interface ColumnSelectProps {
  value: string | undefined
  columns: string[]
  onChange: (value: string | undefined) => void
}

function ColumnSelect({ value, columns, onChange }: ColumnSelectProps) {
  const { t } = useTranslation()
  return (
    <Select
      selectedKey={value ?? ""}
      onSelectionChange={(key) => onChange(String(key) === "" ? undefined : String(key))}
      fullWidth
    >
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      <Select.Popover>
        <ListBox>
          <ListBoxItem id="">—</ListBoxItem>
          {columns.map((column) => (
            <ListBoxItem key={column} id={column}>
              {columnLabel(t, column)}
            </ListBoxItem>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  )
}

interface YColumnsSelectProps {
  value: string[] | undefined
  columns: string[]
  xColumn?: string
  onChange: (value: string[] | undefined) => void
}

function YColumnsSelect({ value, columns, xColumn, onChange }: YColumnsSelectProps) {
  const { t } = useTranslation()
  const selected = value ?? []
  const available = columns.filter((column) => column !== xColumn)
  if (available.length === 0) {
    return <span className="text-[11px] text-[var(--term-ink-3)]">—</span>
  }
  return (
    <div className="flex flex-wrap gap-1.5">
      {available.map((column) => {
        const active = selected.includes(column)
        return (
          <button
            key={column}
            type="button"
            onClick={() => {
              const next = active ? selected.filter((c) => c !== column) : [...selected, column]
              onChange(next.length === 0 ? undefined : next)
            }}
            className={
              active
                ? "rounded-[6px] border border-[var(--term-accent)] bg-[var(--term-accent-soft)] px-2 py-0.5 font-mono text-[10px] text-[var(--term-ink-1)]"
                : "rounded-[6px] border border-[var(--term-border)] bg-[var(--term-panel-alt)] px-2 py-0.5 font-mono text-[10px] text-[var(--term-ink-2)] hover:border-[var(--term-accent)]"
            }
          >
            {columnLabel(t, column)}
          </button>
        )
      })}
    </div>
  )
}

interface ToggleButtonProps {
  active: boolean
  onToggle: () => void
  children: ReactNode
}

function ToggleButton({ active, onToggle, children }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={
        active
          ? "h-8 rounded-[6px] border border-[var(--term-accent)] bg-[var(--term-accent-soft)] px-2 text-[11px] text-[var(--term-ink-1)]"
          : "h-8 rounded-[6px] border border-[var(--term-border-hi)] bg-[var(--term-input)] px-2 text-[11px] text-[var(--term-ink-2)]"
      }
    >
      {children}
    </button>
  )
}
