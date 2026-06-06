import { useTranslation } from "react-i18next"
import { cn } from "@flowm/ui"
import { useFlowmStore } from "../../lib/stores/flowmStore"

export function GlobalBar() {
  const { t } = useTranslation()
  const status = useFlowmStore((state) => state.status)
  const now = new Date().toLocaleTimeString("en-GB", { hour12: false })
  const isMacElectron = typeof window !== "undefined" && window.flowm?.platform.isMac === true

  return (
    <header
      data-electron-drag-region
      className={cn(
        "flex h-8 shrink-0 items-center overflow-hidden border-b border-[var(--term-border)] bg-[var(--term-topbar)] text-[11px] text-[var(--term-ink-2)] [&_*]:pointer-events-none",
      )}
    >
      {isMacElectron ? <span className="w-[132px] shrink-0" aria-hidden="true" /> : null}
      <span className="min-w-0 flex-1" />
      <span className="hidden h-full items-center border-l border-[var(--term-border)] px-3 2xl:inline-flex">
        <span className="mr-1 inline-block size-1.5 rounded-full bg-[var(--term-accent-2)]" />
        {t("global.sync")} {status === "live" ? t("global.syncOk") : t("global.syncWait")}
      </span>
      <span className="hidden h-full items-center border-l border-[var(--term-border)] px-3 text-[var(--term-ink-2)] xl:inline-flex">
        {t("global.lastSync")} <span className="ml-1 font-mono text-[var(--term-ink-1)]">{now}</span>
      </span>
      <span className="flex h-full items-center border-l border-[var(--term-border)] px-3">{t("global.book")} <span className="ml-1 font-mono text-[var(--term-amber)]">{t("global.sqlite")}</span></span>
      <span className="flex h-full items-center border-l border-[var(--term-border)] px-3 text-[var(--term-ink-1)]">{t("global.termVersion")}</span>
      <span className="flex h-full items-center bg-[var(--term-accent)] px-4 font-mono text-[10px] font-bold tracking-[0.12em] text-white">{t("global.brand")}</span>
    </header>
  )
}
