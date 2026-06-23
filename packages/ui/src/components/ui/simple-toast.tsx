/**
 * @purpose Render the simple toast renderer UI primitive.
 * @role    Local desktop UI atom shared across feature pages.
 * @deps    React props, CSS tokens, and small formatting helpers.
 * @gotcha  Keep product data fetching out of reusable UI atoms.
 */

import { Toaster as SonnerToaster, toast } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "font-mono border border-[var(--term-border-hi)] bg-[var(--term-panel)] text-[var(--term-ink-1)]",
        },
      }}
    />
  )
}

type ActionToastOptions = {
  /** Stable id so the same toast can be updated/dismissed across state changes. */
  id?: string | number
  description?: string
  /** Label for the primary action button; omit for a plain persistent toast. */
  actionLabel?: string
  onAction?: () => void
  /** Defaults to Infinity so update prompts do not auto-dismiss. */
  duration?: number
}

export const notify = {
  success: toast.success,
  error: toast.error,
  message: toast.message,
  loading: toast.loading,
  dismiss: (id?: string | number) => toast.dismiss(id),
  /** Persistent toast with an optional action button — used for the update prompt. */
  action: (title: string, options: ActionToastOptions = {}) =>
    toast(title, {
      id: options.id,
      description: options.description,
      duration: options.duration ?? Infinity,
      action:
        options.actionLabel && options.onAction
          ? { label: options.actionLabel, onClick: options.onAction }
          : undefined,
    }),
}
