"use client"

/**
 * @purpose Render Velite's nested article TOC with scroll-spy highlighting.
 * @role    Sticky right-gutter navigation on wide article detail pages.
 * @deps    React and the generated BlogToc type.
 * @gotcha  ACTIVE_OFFSET_PX must remain aligned with article heading scroll margin.
 */

import type { BlogToc as BlogTocData } from "@/lib/blog"
import { useEffect, useState } from "react"

type TocEntry = BlogTocData[number]

const ACTIVE_OFFSET_PX = 120

function flattenIds(items: TocEntry[]): string[] {
  return items.flatMap((item) => [item.url.replace(/^#/, ""), ...flattenIds(item.items)])
}

function TocList({
  items,
  activeId,
  nested = false,
}: {
  items: TocEntry[]
  activeId: string | undefined
  nested?: boolean
}) {
  return (
    <ul className={nested ? "mt-2 space-y-2" : "space-y-2"}>
      {items.map((item) => {
        const id = item.url.replace(/^#/, "")
        const active = id === activeId

        return (
          <li key={item.url} className={nested ? "pl-3" : ""}>
            <a
              href={item.url}
              aria-current={active ? "location" : undefined}
              className={`block text-[13px] leading-snug transition-colors ${
                active ? "font-medium text-ink" : "text-ink/55 hover:text-ink"
              }`}
            >
              {item.title}
            </a>
            {item.items.length > 0 ? (
              <TocList items={item.items} activeId={activeId} nested />
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export function BlogTableOfContents({ toc }: { toc: BlogTocData }) {
  const [activeId, setActiveId] = useState<string>()

  useEffect(() => {
    const headings = flattenIds(toc)
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null)

    if (headings.length === 0) return

    const updateActive = () => {
      let current = headings[0]!.id
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= ACTIVE_OFFSET_PX) {
          current = heading.id
        } else {
          break
        }
      }
      setActiveId(current)
    }

    updateActive()
    window.addEventListener("scroll", updateActive, { passive: true })
    window.addEventListener("resize", updateActive, { passive: true })

    return () => {
      window.removeEventListener("scroll", updateActive)
      window.removeEventListener("resize", updateActive)
    }
  }, [toc])

  if (toc.length === 0) return null

  return (
    <nav aria-label="文章目录" className="border-l border-hair pl-4">
      <p className="font-lat text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/45">
        本页目录
      </p>
      <div className="mt-3">
        <TocList items={toc} activeId={activeId} />
      </div>
    </nav>
  )
}
