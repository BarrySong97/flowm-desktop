/**
 * @purpose Sticky top navigation bar for the marketing site.
 * @role    Landing section: brand mark, anchors, and primary download CTA.
 * @gotcha  Client component: the bottom border only appears once the page is
 *          scrolled, so it stays borderless while pinned at the very top.
 */

"use client"

import { useEffect, useState } from "react"
import { Logo } from "./primitives"
import { DOWNLOAD_URL } from "@/lib/seo"

export function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={`sticky top-0 z-50 border-b backdrop-blur-[16px] backdrop-saturate-[1.6] transition-colors ${
        scrolled ? "border-hair" : "border-transparent"
      }`}
    >
      {/* Same centered max-width as the page content, so the logo lines up with
          the hero/section left edge. */}
      <div className="mx-auto flex h-[62px] max-w-[1320px] items-center gap-[34px] px-[22px]">
        <div className="flex items-center gap-[9px] text-[17px] font-bold -tracking-[0.01em]">
          <Logo size={26} />
          Flowm
        </div>
        <div className="ml-2 hidden gap-7 md:flex">
          {[
            ["理念", "/#model"],
            ["能力", "/#features-detail"],
            ["隐私", "/#privacy"],
            ["博客", "/blog"],
            ["更新日志", "/releases"],
          ].map(([t, h]) => (
            <a
              key={h}
              href={h}
              className="text-[13.5px] text-ink-2 transition-colors hover:text-ink"
            >
              {t}
            </a>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-[14px]">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center gap-[7px] rounded-[10px] border border-transparent bg-green px-[17px] py-[9px] text-[13.5px] font-semibold text-white shadow-[0_1px_2px_rgba(20,121,74,0.25)] transition-all hover:-translate-y-px hover:bg-green-deep hover:shadow-[0_6px_16px_-6px_rgba(20,121,74,0.5)]"
          >
            下载
          </a>
        </div>
      </div>
    </nav>
  )
}
