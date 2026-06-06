import { ScrollArea } from "@flowm/ui"

interface Props {
  markdown: string
}

export function TextRenderer({ markdown }: Props) {
  return (
    <ScrollArea className="h-full min-h-0">
      <div className="whitespace-pre-wrap break-words px-3 py-3 font-sans text-[12px] leading-relaxed text-[var(--term-ink-1)]">
        {markdown.length > 0 ? markdown : <span className="text-[var(--term-ink-3)]">—</span>}
      </div>
    </ScrollArea>
  )
}
