/**
 * @purpose A copy-to-clipboard pill: shows a short label and copies a longer prompt.
 * @role    Used in the hero — users paste the copied Markdown into any AI Agent.
 */

"use client"

import { useState } from "react"
import { AgentIcon } from "./BrandIcons"

export function CopyCommand({ text, displayText = text }: { text: string; displayText?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard API 受限时回退到临时 textarea + execCommand
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand("copy")
      } catch {
        // 仍失败则放弃
      }
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="inline-flex max-w-full items-stretch overflow-hidden rounded-[12px] border border-hair bg-surface text-left shadow-[0_1px_2px_rgba(20,40,30,0.05)]">
      <div className="flex min-w-0 items-center gap-2.5 px-4 py-3">
        <span className="grid h-5 w-5 flex-none place-items-center rounded-full bg-green-soft text-green">
          <AgentIcon size={12} />
        </span>
        <span className="overflow-x-auto whitespace-nowrap font-mono text-[13px] text-ink-2">
          {displayText}
        </span>
      </div>
      <button
        type="button"
        onClick={copy}
        aria-label="复制命令"
        className="flex flex-none cursor-pointer items-center gap-1.5 border-l border-hair px-3.5 text-[13px] font-medium text-ink-2 transition-colors hover:bg-surface-2"
      >
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-green"
              aria-hidden
            >
              <path d="M3 8.5l3.2 3.2L13 4.5" />
            </svg>
            <span className="text-green">已复制</span>
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
              <path d="M3.5 10.5A1.5 1.5 0 0 1 2.5 9V3A1.5 1.5 0 0 1 4 1.5h6a1.5 1.5 0 0 1 1.5 1.5" />
            </svg>
            复制
          </>
        )}
      </button>
    </div>
  )
}
