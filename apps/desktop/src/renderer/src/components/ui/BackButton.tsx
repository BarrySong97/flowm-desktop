/**
 * @purpose Unified back affordance for detail pages and in-place panels.
 * @role    Renderer-local UI atom: one ghost button + arrow, two variants (text / icon-only).
 * @deps    HeroUI Button.
 * @gotcha  Always router-agnostic — pass `onBack` (page callers wrap their own navigate()).
 *          With `label` it renders "← label"; without it, an icon-only button for tight panels.
 */

import { Button } from "@heroui/react"

interface BackButtonProps {
  onBack: () => void
  /** Text variant: renders the arrow + this label. Omit for an icon-only button. */
  label?: string
}

function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path
        d="M9 2L4 7L9 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function BackButton({ onBack, label }: BackButtonProps) {
  if (label == null) {
    return (
      <Button
        isIconOnly
        size="sm"
        variant="ghost"
        aria-label="返回"
        onPress={onBack}
        style={{
          width: 24,
          height: 24,
          minWidth: 24,
          borderRadius: 5,
          marginLeft: -4,
          color: "var(--ink-4)",
        }}
      >
        <ArrowIcon />
      </Button>
    )
  }
  return (
    <Button
      size="sm"
      variant="ghost"
      onPress={onBack}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        height: "auto",
        minWidth: 0,
        padding: "3px 8px",
        borderRadius: 6,
        marginLeft: -8,
        fontSize: 12,
        fontWeight: 500,
        color: "var(--ink-4)",
      }}
    >
      <ArrowIcon />
      {label}
    </Button>
  )
}
