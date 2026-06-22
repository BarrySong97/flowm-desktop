/**
 * @purpose Render the upcoming row renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import { ColorDot } from "./ColorDot"

interface UpcomingRowProps {
  date: string
  color: string
  name: string
  kind: string
  amount: string
}

export function UpcomingRow({ date, color, name, kind, amount }: UpcomingRowProps) {
  return (
    <div className="flex items-center gap-2 text-[12px] py-2 border-t border-[var(--hair)] min-w-0">
      <span className="font-['IBM_Plex_Mono'] text-[10.5px] text-[var(--ink-4)] w-[34px] flex-none">
        {date}
      </span>
      <ColorDot color={color} size={7} className="flex-none" />
      <span className="flex-1 truncate text-[var(--ink-2)]">{name}</span>
      <span className="text-[10px] text-[var(--ink-4)]">{kind}</span>
      <span className="font-['IBM_Plex_Mono'] text-[12px] font-medium text-[var(--ink)] flex-none ml-1">
        {amount}
      </span>
    </div>
  )
}
