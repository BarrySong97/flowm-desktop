import { useEffect, useState } from "react"
import { Button, Card, Input } from "@heroui/react"
import { RefreshCw, Save } from "lucide-react"
import { useTranslation } from "react-i18next"
import { ScrollArea } from "@flowm/ui"
import { LanguageSwitcher } from "../components/terminal/LanguageSwitcher"
import { useFlowmStore } from "../lib/stores/flowmStore"

export function SettingsPage() {
  const { t } = useTranslation()
  const currencySettings = useFlowmStore((state) => state.currencySettings)
  const exchangeRates = useFlowmStore((state) => state.exchangeRates)
  const loadCurrencySettings = useFlowmStore((state) => state.loadCurrencySettings)
  const updateCurrencySettings = useFlowmStore((state) => state.updateCurrencySettings)
  const refreshExchangeRates = useFlowmStore((state) => state.refreshExchangeRates)
  const error = useFlowmStore((state) => state.error)
  const [displayCurrency, setDisplayCurrency] = useState("")

  useEffect(() => {
    void loadCurrencySettings()
  }, [loadCurrencySettings])

  useEffect(() => {
    setDisplayCurrency(currencySettings?.displayCurrency ?? "CNY")
  }, [currencySettings?.displayCurrency])

  const normalizedDisplayCurrency = displayCurrency.trim().toUpperCase()
  const canSave =
    /^[A-Z]{3}$/.test(normalizedDisplayCurrency) &&
    normalizedDisplayCurrency !== currencySettings?.displayCurrency

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex shrink-0 flex-col gap-1 border-b border-[var(--term-border)] bg-[var(--term-topbar)] px-4 py-3">
        <h1 className="font-mono text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--term-ink-1)]">
          {t("settings.title")}
        </h1>
        <p className="text-[11px] text-[var(--term-ink-3)]">{t("settings.description")}</p>
      </header>
      <ScrollArea className="min-h-0 flex-1" contentClassName="flex flex-col gap-4 p-4 pb-[var(--flowm-bottom-nav-safe)]">
        <Card render={(props) => <section {...props} />} className="rounded-[8px] p-0 shadow-none border border-[var(--term-border)]">
          <Card.Content className="px-3 py-2 flex items-center justify-between gap-0">
            <div className="flex flex-col">
              <span className="text-[12px] font-semibold text-[var(--term-ink-1)]">
                {t("settings.language.title")}
              </span>
              <span className="text-[11px] text-[var(--term-ink-3)]">
                {t("settings.language.description")}
              </span>
            </div>
            <LanguageSwitcher />
          </Card.Content>
        </Card>
        <Card render={(props) => <section {...props} />} className="rounded-[8px] p-0 shadow-none border border-[var(--term-border)]">
          <Card.Content className="px-3 py-3 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] font-semibold text-[var(--term-ink-1)]">
                {t("settings.currency.title")}
              </span>
              <span className="text-[11px] text-[var(--term-ink-3)]">
                {t("settings.currency.description")}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                value={displayCurrency}
                maxLength={3}
                className="h-9 w-24 font-mono uppercase"
                onChange={(event) => setDisplayCurrency(event.target.value.toUpperCase())}
              />
              <Button
                type="button"
                size="sm"
                isDisabled={!canSave}
                onPress={() => void updateCurrencySettings({ displayCurrency: normalizedDisplayCurrency })}
              >
                <Save className="size-4" />
                {t("settings.currency.save")}
              </Button>
              <Button type="button" size="sm" variant="outline" onPress={() => void refreshExchangeRates()}>
                <RefreshCw className="size-4" />
                {t("settings.currency.refresh")}
              </Button>
            </div>
            <div className="grid gap-2 text-[11px] text-[var(--term-ink-2)] sm:grid-cols-3">
              <KV label={t("settings.currency.current")} value={currencySettings?.displayCurrency ?? "CNY"} />
              <KV label={t("settings.currency.provider")} value={currencySettings?.fxProvider ?? "frankfurter"} />
              <KV label={t("settings.currency.cached")} value={String(exchangeRates.length)} />
            </div>
            {exchangeRates.length > 0 ? (
              <div className="overflow-hidden rounded-[8px] border border-[var(--term-border)]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr] bg-[var(--term-hover)] px-2 py-1 font-mono text-[10px] uppercase text-[var(--term-ink-3)]">
                  <span>{t("settings.currency.table.pair")}</span>
                  <span>{t("settings.currency.table.date")}</span>
                  <span>{t("settings.currency.table.rate")}</span>
                  <span>{t("settings.currency.table.sourceDate")}</span>
                </div>
                {exchangeRates.slice(0, 8).map((rate) => (
                  <div
                    key={`${rate.fromCurrency}-${rate.toCurrency}-${rate.rateDate}-${rate.provider}`}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr] border-t border-[var(--term-border)] px-2 py-1 font-mono text-[11px] text-[var(--term-ink-2)]"
                  >
                    <span>{rate.fromCurrency}/{rate.toCurrency}</span>
                    <span>{rate.rateDate}</span>
                    <span>{rate.rate}</span>
                    <span>{rate.sourceDate ?? "-"}</span>
                  </div>
                ))}
              </div>
            ) : null}
            {error ? <p className="text-[11px] text-red-500">{error}</p> : null}
          </Card.Content>
        </Card>
      </ScrollArea>
    </main>
  )
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col rounded-[8px] border border-[var(--term-border)] bg-[var(--term-hover)] px-2 py-1">
      <span className="text-[10px] uppercase text-[var(--term-ink-3)]">{label}</span>
      <span className="truncate font-mono text-[12px] text-[var(--term-ink-1)]">{value}</span>
    </div>
  )
}
