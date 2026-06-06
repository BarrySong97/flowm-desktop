import { useMemo, useState } from "react"
import { Button, Card, Chip, ListBox, ListBoxItem, Select, Table } from "@heroui/react"
import { FileSpreadsheet, RefreshCcw, Upload } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
  ScrollArea,
} from "@flowm/ui"
import {
  parseStatementFile,
  type NormalizedStatementEntry,
  type StatementParseResult,
  type StatementSource,
} from "@flowm/business"
import { useFlowmStore } from "../lib/stores/flowmStore"

const SOURCE_OPTIONS: Array<{ value: StatementSource; labelKey: string }> = [
  { value: "alipay_personal_csv", labelKey: "imports.sources.alipay" },
  { value: "wechat_personal_xlsx", labelKey: "imports.sources.wechat" },
]

export function ImportsPage() {
  const { t } = useTranslation()
  const importedEntries = useFlowmStore((state) => state.importedEntries)
  const importNormalizedStatementEntries = useFlowmStore((state) => state.importNormalizedStatementEntries)
  const loadImportedEntries = useFlowmStore((state) => state.loadImportedEntries)
  const [source, setSource] = useState<StatementSource>("alipay_personal_csv")
  const [fileName, setFileName] = useState<string>("")
  const [fileHash, setFileHash] = useState<string | null>(null)
  const [parseResult, setParseResult] = useState<StatementParseResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const previewRows = useMemo(() => parseResult?.entries.slice(0, 100) ?? [], [parseResult])

  const handleFile = async (file: File | null) => {
    setError(null)
    setParseResult(null)
    setFileName(file?.name ?? "")
    setFileHash(null)
    if (file == null) return
    setBusy(true)
    try {
      const buffer = await file.arrayBuffer()
      const result = parseStatementFile(source, buffer)
      setParseResult(result)
      setFileHash(await sha256(buffer))
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const commitImport = async () => {
    if (parseResult == null) return
    setBusy(true)
    try {
      await importNormalizedStatementEntries({
        sourceName: parseResult.source,
        importedAt: new Date().toISOString(),
        fileName,
        fileHash,
        entries: parseResult.entries,
        summary: parseResult.summary,
      })
      setParseResult(null)
      setFileName("")
      setFileHash(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-1 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-3">
        <h1 className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--term-ink-1)]">
          {t("imports.title")}
        </h1>
        <p className="text-[11px] text-[var(--term-ink-3)]">{t("imports.description")}</p>
      </header>

      <section className="grid shrink-0 gap-3 border-b border-[var(--term-border)] bg-[var(--term-panel)] p-3 md:grid-cols-[180px_minmax(220px,1fr)_auto_auto]">
        <Select
          selectedKey={source}
          onSelectionChange={(key) => {
            if (key == null) return
            setSource(String(key) as StatementSource)
            setParseResult(null)
            setError(null)
          }}
          aria-label={t("imports.source")}
        >
          <Select.Trigger>
            <Select.Value>{sourceLabel(source, t)}</Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {SOURCE_OPTIONS.map((option) => (
                <ListBoxItem key={option.value} id={option.value}>
                  {t(option.labelKey)}
                </ListBoxItem>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
        <label className="flex h-8 cursor-pointer items-center gap-2 rounded-[6px] border border-[var(--term-border-hi)] bg-[var(--term-input)] px-2 text-[12px] text-[var(--term-ink-2)]">
          <FileSpreadsheet className="size-4" />
          <span className="truncate">{fileName || t("imports.chooseFile")}</span>
          <input
            type="file"
            className="sr-only"
            accept={source === "alipay_personal_csv" ? ".csv,text/csv" : ".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
            onChange={(event) => void handleFile(event.currentTarget.files?.[0] ?? null)}
          />
        </label>
        <Button isDisabled={parseResult == null || busy} onPress={() => void commitImport()}>
          <Upload className="size-4" />
          {t("imports.import")}
        </Button>
        <Button variant="outline" isDisabled={busy} onPress={() => void loadImportedEntries()}>
          <RefreshCcw className="size-4" />
          {t("imports.refresh")}
        </Button>
      </section>

      {error != null ? (
        <div className="shrink-0 border-b border-[var(--term-border)] bg-[var(--term-red-soft)] px-4 py-2 text-[12px] text-[var(--term-red)]">
          {error}
        </div>
      ) : null}

      {parseResult != null ? (
        <PreviewSummary result={parseResult} entries={previewRows} />
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-2">
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-[var(--term-ink-2)]">
            {t("imports.importedTitle")}
          </span>
          <span className="ml-auto text-[11px] text-[var(--term-ink-3)]">
            {t("imports.count", { count: importedEntries.length })}
          </span>
        </div>
        <ScrollArea className="min-h-0 flex-1" contentClassName="pb-[var(--flowm-bottom-nav-safe)]">
          <Table>
            <Table.Content>
            <Table.Header>
                <Table.Column>{t("imports.table.date")}</Table.Column>
                <Table.Column>{t("imports.table.source")}</Table.Column>
                <Table.Column>{t("imports.table.counterparty")}</Table.Column>
                <Table.Column>{t("imports.table.description")}</Table.Column>
                <Table.Column>{t("imports.table.account")}</Table.Column>
                <Table.Column>{t("imports.table.classification")}</Table.Column>
                <Table.Column className="text-right">{t("imports.table.amount")}</Table.Column>
            </Table.Header>
            <Table.Body>
              {importedEntries.length === 0 ? (
                <Table.Row>
                  <Table.Cell colSpan={7} className="text-center text-[var(--term-ink-3)]">
                    {t("imports.empty")}
                  </Table.Cell>
                </Table.Row>
              ) : (
                importedEntries.map((entry) => (
                  <Table.Row key={entry.id}>
                    <Table.Cell className="font-mono text-[11px]">{entry.date}</Table.Cell>
                    <Table.Cell>{sourceLabel(entry.sourceName, t)}</Table.Cell>
                    <Table.Cell>{entry.payee ?? "-"}</Table.Cell>
                    <Table.Cell className="max-w-[280px] truncate">{entry.narration ?? "-"}</Table.Cell>
                    <Table.Cell className="font-mono text-[11px]">{entry.accountName}</Table.Cell>
                    <Table.Cell>
                      <ClassificationBadge value={entry.classification ?? "ambiguous"} />
                    </Table.Cell>
                    <Table.Cell className="text-right font-mono">{formatAmount(entry.amountNumber, entry.currency)}</Table.Cell>
                  </Table.Row>
                ))
              )}
            </Table.Body>
          </Table.Content>
          </Table>
        </ScrollArea>
      </section>
    </main>
  )
}

function PreviewSummary({
  result,
  entries,
}: {
  result: StatementParseResult
  entries: NormalizedStatementEntry[]
}) {
  const { t } = useTranslation()
  return (
    <section className="max-h-[38vh] shrink-0 overflow-hidden border-b border-[var(--term-border)]">
      <div className="grid grid-cols-4 gap-px bg-[var(--term-border)] md:grid-cols-6">
        <Metric label={t("imports.metrics.total")} value={result.summary.total} />
        <Metric label={t("imports.metrics.expense")} value={result.summary.expense} />
        <Metric label={t("imports.metrics.income")} value={result.summary.income} />
        <Metric label={t("imports.metrics.neutral")} value={result.summary.neutral} />
        <Metric label={t("imports.metrics.ignored")} value={result.summary.ignored} />
        <Metric label={t("imports.metrics.accounts")} value={Object.keys(result.summary.byAccount).length} />
      </div>
      <ScrollArea className="h-[calc(38vh-54px)]">
        <Table>
          <Table.Content>
          <Table.Header>
              <Table.Column>{t("imports.table.date")}</Table.Column>
              <Table.Column>{t("imports.table.counterparty")}</Table.Column>
              <Table.Column>{t("imports.table.description")}</Table.Column>
              <Table.Column>{t("imports.table.account")}</Table.Column>
              <Table.Column>{t("imports.table.classification")}</Table.Column>
              <Table.Column className="text-right">{t("imports.table.amount")}</Table.Column>
          </Table.Header>
          <Table.Body>
            {entries.map((entry, index) => (
              <Table.Row key={`${entry.externalId ?? entry.occurredAt}-${index}`}>
                <Table.Cell className="font-mono text-[11px]">{entry.date}</Table.Cell>
                <Table.Cell>{entry.counterparty ?? "-"}</Table.Cell>
                <Table.Cell className="max-w-[280px] truncate">{entry.description || "-"}</Table.Cell>
                <Table.Cell className="font-mono text-[11px]">{entry.sourceAccountName}</Table.Cell>
                <Table.Cell>
                  <ClassificationBadge value={entry.classification} />
                </Table.Cell>
                <Table.Cell className="text-right font-mono">{formatAmount(entry.amountNumber, entry.currency)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
        </Table>
      </ScrollArea>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card className="rounded-[8px] p-0 shadow-none border border-[var(--term-border)]">
      <Card.Content className="px-3 py-2 gap-0">
        <div className="text-[10px] uppercase tracking-[0.08em] text-[var(--term-ink-3)]">{label}</div>
        <div className="font-mono text-[16px] text-[var(--term-ink-1)]">{value}</div>
      </Card.Content>
    </Card>
  )
}

function ClassificationBadge({ value }: { value: string }) {
  const color = value === "external_expense_candidate" ? "success" : value === "closed_or_failed" ? "danger" : value.includes("transfer") ? "warning" : "default"
  return <Chip color={color} size="sm" variant="soft">{value}</Chip>
}

function sourceLabel(source: string, t: (key: string, options?: Record<string, unknown>) => string) {
  if (source === "alipay_personal_csv") return t("imports.sources.alipay")
  if (source === "wechat_personal_xlsx") return t("imports.sources.wechat")
  return source
}

function formatAmount(value: string, currency: string) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return `${value} ${currency}`
  const symbol = currency === "CNY" ? "¥" : `${currency} `
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

async function sha256(buffer: ArrayBuffer) {
  if (globalThis.crypto?.subtle == null) return null
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer)
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("")
}
