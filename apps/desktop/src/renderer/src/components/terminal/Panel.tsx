import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { Card } from "@heroui/react"
import { Maximize2, Minimize2, MoreVertical, Pencil, X } from "lucide-react"
import { cn } from "@flowm/ui"

interface PanelProps {
  title: string
  code?: string
  status?: string
  className?: string
  isMaximized?: boolean
  onClose?: () => void
  onMaximize?: () => void
  onRestore?: () => void
  onRenameSubmit?: (next: string) => void
  onConfigure?: () => void
  children: ReactNode
}

export function Panel({
  title,
  code,
  status,
  className,
  isMaximized,
  onClose,
  onMaximize,
  onRestore,
  onRenameSubmit,
  onConfigure,
  children,
}: PanelProps) {
  const controlClass =
    "flowm-grid-action inline-flex size-6 cursor-pointer items-center justify-center rounded-[6px] border border-transparent text-[var(--term-ink-4)] transition-[color,background-color,border-color] duration-[120ms] hover:border-[var(--term-border)] hover:bg-[var(--term-bg)] hover:text-[var(--term-ink-1)]"

  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(title)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!editing) setDraft(title)
  }, [title, editing])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const startEdit = () => {
    if (onRenameSubmit == null) return
    setDraft(title)
    setEditing(true)
  }

  const commit = () => {
    if (!editing) return
    setEditing(false)
    if (onRenameSubmit == null) return
    const next = draft.trim()
    if (next === title) return
    onRenameSubmit(next)
  }

  const cancel = () => {
    setEditing(false)
    setDraft(title)
  }

  const handleKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault()
      commit()
    } else if (event.key === "Escape") {
      event.preventDefault()
      cancel()
    }
  }

  return (
    <Card render={(props) => <section {...props} />} className={cn("flowm-grid-panel min-h-0 min-w-0 rounded-[8px] p-0 shadow-none overflow-hidden border border-[var(--term-border)]", className)}>
      <header className="flowm-grid-drag-handle group/header flex h-[30px] shrink-0 cursor-default select-none items-center gap-2 border-b border-[var(--term-border)] bg-[var(--term-panel-alt)] px-3 text-[13px] text-[var(--term-ink-2)]">
        {editing ? (
          <input
            ref={inputRef}
            className="flowm-grid-action min-w-0 flex-1 rounded-[6px] border border-[var(--term-border-hi)] bg-[var(--term-input)] px-1.5 py-0.5 font-sans text-[12px] font-semibold text-[var(--term-ink-1)] outline-none transition-[border-color] duration-[120ms] focus:border-[var(--term-accent)]"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKey}
            onBlur={commit}
            spellCheck={false}
          />
        ) : (
          <span
            className="min-w-0 flex-1 truncate font-sans font-semibold text-[var(--term-ink-1)]"
            onDoubleClick={onRenameSubmit != null ? startEdit : undefined}
            title={onRenameSubmit != null ? title : undefined}
          >
            {title}
          </span>
        )}
        {!editing && onRenameSubmit != null && (
          <button
            type="button"
            className={cn(controlClass, "opacity-0 transition-opacity duration-[120ms] group-hover/header:opacity-100")}
            aria-label="Rename panel"
            title="Rename panel"
            onClick={startEdit}
          >
            <Pencil className="size-3" />
          </button>
        )}
        {code && !editing && <span className="shrink-0 font-mono text-[10px] text-[var(--term-ink-3)]">· {code}</span>}
        {status && !editing && (
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-[var(--term-accent-2)]">
            <span className="size-1.5 rounded-full bg-[var(--term-accent-2)]" />
            {status}
          </span>
        )}
        {isMaximized ? (
          <button type="button" className={controlClass} aria-label="Restore panel" title="Restore panel" onClick={onRestore}>
            <Minimize2 className="size-3" />
          </button>
        ) : (
          <button type="button" className={controlClass} aria-label="Maximize panel" title="Maximize panel" onClick={onMaximize}>
            <Maximize2 className="size-3" />
          </button>
        )}
        <button type="button" className={controlClass} aria-label="Close panel" title="Close panel" onClick={onClose}>
          <X className="size-3" />
        </button>
        {onConfigure != null && (
          <button type="button" className={controlClass} aria-label="Configure card" title="Configure card" onClick={onConfigure}>
            <MoreVertical className="size-3" />
          </button>
        )}
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">{children}</div>
    </Card>
  )
}
