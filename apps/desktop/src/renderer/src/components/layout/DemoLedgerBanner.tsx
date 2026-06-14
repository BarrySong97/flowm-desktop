/**
 * @purpose Render the demo ledger banner layout component for the desktop shell.
 * @role    Reusable renderer shell/navigation building block.
 * @deps    React, route state, platform metadata, and local UI primitives.
 * @gotcha  Keep layout concerns separate from product data mutations.
 */

import { useMutation, useQuery } from "@tanstack/react-query"
import { useAtom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { Button } from "@heroui/react"
import { trpc } from "@/lib/trpc"
import { useLedgerSwitch } from "@/lib/switchLedger"

const dismissedDemoBannersAtom = atomWithStorage<string[]>("flowm.dismissedDemoBanners", [])

function LeafIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}

export function DemoLedgerBanner() {
  const activeQuery = useQuery(trpc.ledgers.active.queryOptions())
  const [dismissed, setDismissed] = useAtom(dismissedDemoBannersAtom)
  const switchLedger = useLedgerSwitch()
  const switchToPersonal = useMutation(trpc.ledgers.switchToPersonal.mutationOptions())

  const active = activeQuery.data
  if (!active || !active.isDemo || dismissed.includes(active.id)) return null

  // On macOS the traffic-light window controls occupy the top-left; add extra top
  // padding so the banner content clears them. Other platforms need no offset.
  const isMac = window.flowm?.platform?.isMac ?? false

  return (
    <div className={`flex shrink-0 items-center gap-2.5 border-b border-[var(--hair)] bg-[var(--accent-soft)] px-[18px] pb-4 text-[13px] ${isMac ? "pt-8" : "pt-[18px]"}`}>
      <LeafIcon />
      <span className="font-semibold text-[var(--ink)]">这是样例账本</span>
      <span className="text-[var(--ink-5)]">·</span>
      <span className="text-[var(--ink-3)]">数据是虚构的，让你先看看 Flowm 怎么用</span>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          size="sm"
          variant="secondary"
          style={{ borderRadius: 7 }}
          isDisabled={switchToPersonal.isPending}
          onPress={() => switchLedger(() => switchToPersonal.mutateAsync())}
        >
          换成我的数据 →
        </Button>
        <Button isIconOnly size="sm" variant="ghost" aria-label="关闭" onPress={() => setDismissed([...dismissed, active.id])}>
          ✕
        </Button>
      </div>
    </div>
  )
}
