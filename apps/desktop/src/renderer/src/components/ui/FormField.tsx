/**
 * @purpose Provide small HeroUI/RHF-compatible form field helpers.
 * @role    Renderer-local form UI primitive for validation labels and errors.
 * @deps    React children and HeroUI Label.
 * @gotcha  HeroUI v3.1 in this app does not export Form/TextField/FieldError; keep this wrapper thin.
 */

import type { ReactNode } from "react"
import { Label } from "@heroui/react"

interface FormFieldProps {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function FormField({ label, error, required, children }: FormFieldProps) {
  return (
    <div>
      <Label
        isInvalid={Boolean(error)}
        isRequired={required}
        style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6, display: "block" }}
      >
        {label}
      </Label>
      {children}
      {error && (
        <div style={{ marginTop: 5, fontSize: 11, lineHeight: 1.4, color: "var(--red)" }}>
          {error}
        </div>
      )}
    </div>
  )
}
