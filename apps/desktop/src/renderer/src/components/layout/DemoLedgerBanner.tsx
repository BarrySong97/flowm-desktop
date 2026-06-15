/**
 * @purpose Render the demo ledger banner layout component for the desktop shell.
 * @role    Reusable renderer shell/navigation building block.
 * @deps    React, route state, platform metadata, and local UI primitives.
 * @gotcha  Keep the demo banner non-dismissible until the user explicitly switches ledgers.
 */

import { useMutation, useQuery } from "@tanstack/react-query"
import { Button, InfoIcon } from "@heroui/react"
import { trpc } from "@/lib/trpc"
import { useLedgerSwitch } from "@/lib/switchLedger"

export function DemoLedgerBanner() {
  const activeQuery = useQuery(trpc.ledgers.active.queryOptions())
  const switchLedger = useLedgerSwitch()
  const switchToPersonal = useMutation(trpc.ledgers.switchToPersonal.mutationOptions())

  const active = activeQuery.data
  if (!active || !active.isDemo) return null

  // On macOS the traffic-light window controls occupy the top-left; reserve that
  // horizontal space instead of making the banner tall.
  const isMac = window.flowm?.platform?.isMac ?? false

  return (
    <div
      className={`flex min-h-[32px] shrink-0 items-center gap-1.5 overflow-hidden border-b border-[var(--hair)] bg-[var(--accent-soft)] py-1 text-[11.5px] leading-none ${isMac ? "pl-[84px] pr-3" : "px-3"}`}
    >
      <InfoIcon className="size-[11px] shrink-0 text-[var(--accent)]" aria-hidden="true" />
      <span className="shrink-0 font-semibold text-[var(--ink)]">这是样例账本</span>
      <span className="text-[var(--ink-5)]">·</span>
      <span className="min-w-0 truncate text-[var(--ink-3)]">
        数据是虚构的，让你先看看 Flowm 怎么用
      </span>

      <div className="ml-auto flex shrink-0 items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          className="no-drag-region relative z-[10000] shrink-0"
          style={{
            borderRadius: 6,
            height: 24,
            minHeight: 24,
            padding: "0 8px",
            fontSize: 11.5,
            lineHeight: 1,
          }}
          isDisabled={switchToPersonal.isPending}
          onPress={() => switchLedger(() => switchToPersonal.mutateAsync())}
        >
          换成我的数据 →
        </Button>
      </div>
    </div>
  )
}
