/**
 * @purpose Section heading block (eyebrow tag + title + lede) for landing sections.
 * @role    Presentational helper shared by ThreeLayers and Features.
 */

import type { ReactNode } from "react"

export function SectionHead({
  tag,
  title,
  children,
  tagClassName = "text-green",
  titleClassName = "text-[clamp(26px,3.4vw,38px)]",
  descClassName = "text-ink-2",
}: {
  tag: string
  title: ReactNode
  children?: ReactNode
  tagClassName?: string
  titleClassName?: string
  descClassName?: string
}) {
  return (
    <div className="max-w-[620px]">
      <div
        className={`font-lat text-[11px] font-semibold uppercase tracking-[0.16em] ${tagClassName}`}
      >
        {tag}
      </div>
      <h2 className={`mt-[14px] font-bold leading-[1.18] -tracking-[0.025em] ${titleClassName}`}>
        {title}
      </h2>
      {children ? (
        <p className={`mt-[18px] text-[15.5px] leading-[1.7] ${descClassName}`}>{children}</p>
      ) : null}
    </div>
  )
}
