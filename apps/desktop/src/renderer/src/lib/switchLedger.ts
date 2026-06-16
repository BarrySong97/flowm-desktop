/**
 * @purpose Provide renderer switch ledger helper functions.
 * @role    Shared utility module for React feature code.
 * @deps    Browser-safe TypeScript utilities and local domain types.
 * @gotcha  Keep Node, Electron main, and SQLite access behind preload/tRPC.
 */

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"

const SWITCH_RELOAD_DELAY_MS = 520

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function showLedgerSwitchOverlay(): () => void {
  const existing = document.getElementById("flowm-ledger-switch-overlay")
  existing?.remove()

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const overlay = document.createElement("div")
  overlay.id = "flowm-ledger-switch-overlay"
  overlay.setAttribute("role", "status")
  overlay.setAttribute("aria-live", "polite")
  overlay.innerHTML = `
    <div class="flowm-ledger-switch-panel">
      <div class="flowm-ledger-switch-title">正在切换账本</div>
      <div class="flowm-ledger-switch-copy">正在载入你的数据</div>
      <div class="flowm-ledger-switch-track"><div class="flowm-ledger-switch-bar"></div></div>
    </div>
  `

  const style = document.createElement("style")
  style.textContent = `
    #flowm-ledger-switch-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      background: color-mix(in srgb, var(--paper, #f6f7f5) 74%, transparent);
      backdrop-filter: blur(14px) saturate(1.03);
      opacity: 0;
      transition: opacity ${reduceMotion ? "80ms" : "180ms"} ease;
      pointer-events: all;
    }
    #flowm-ledger-switch-overlay.is-visible {
      opacity: 1;
    }
    .flowm-ledger-switch-panel {
      width: min(300px, calc(100vw - 48px));
      border: 1px solid var(--hair, rgba(25, 42, 34, .12));
      border-radius: 8px;
      background: color-mix(in srgb, white 92%, var(--accent-soft, #dfe9e2));
      box-shadow: 0 18px 48px rgba(22, 37, 30, .16);
      padding: 18px 18px 16px;
      text-align: center;
      transform: translateY(${reduceMotion ? "0" : "8px"}) scale(${reduceMotion ? "1" : ".985"});
      transition: transform ${reduceMotion ? "80ms" : "220ms"} cubic-bezier(.2, .8, .2, 1);
    }
    #flowm-ledger-switch-overlay.is-visible .flowm-ledger-switch-panel {
      transform: translateY(0) scale(1);
    }
    .flowm-ledger-switch-title {
      color: var(--ink, #17241d);
      font-size: 14px;
      font-weight: 700;
      line-height: 1.35;
    }
    .flowm-ledger-switch-copy {
      margin-top: 5px;
      color: var(--ink-4, #66736b);
      font-size: 12px;
      line-height: 1.4;
    }
    .flowm-ledger-switch-track {
      position: relative;
      height: 3px;
      margin-top: 15px;
      overflow: hidden;
      border-radius: 999px;
      background: var(--hair, rgba(25, 42, 34, .12));
    }
    .flowm-ledger-switch-bar {
      position: absolute;
      inset-block: 0;
      width: 46%;
      border-radius: inherit;
      background: var(--accent, #2c7a55);
      animation: ${reduceMotion ? "none" : "flowm-ledger-switch-slide 900ms ease-in-out infinite"};
    }
    @keyframes flowm-ledger-switch-slide {
      from { transform: translateX(-105%); }
      to { transform: translateX(225%); }
    }
  `

  document.head.append(style)
  document.body.append(overlay)
  window.requestAnimationFrame(() => overlay.classList.add("is-visible"))

  return () => {
    overlay.classList.remove("is-visible")
    window.setTimeout(() => {
      overlay.remove()
      style.remove()
    }, 180)
  }
}

/**
 * Returns a function that runs a ledger-switching mutation, then clears renderer state,
 * routes home, and reloads the window so every mounted query refetches against the
 * now-active SQLite connection.
 */
export function useLedgerSwitch(): (run: () => Promise<unknown>) => Promise<void> {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useCallback(
    async (run: () => Promise<unknown>) => {
      const hideOverlay = showLedgerSwitchOverlay()
      try {
        await run()
        queryClient.clear()
        await router.navigate({ to: "/" })
        await wait(SWITCH_RELOAD_DELAY_MS)
        window.location.reload()
      } catch (error) {
        hideOverlay()
        throw error
      }
    },
    [queryClient, router],
  )
}
