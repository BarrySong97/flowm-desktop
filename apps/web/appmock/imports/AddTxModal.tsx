/**
 * @purpose Interaction-only stub for the add/edit cashflow modal.
 * @role    The mock Imports page keeps the add button inert, so this renders nothing.
 * @gotcha  Keep `TxForm` + `emptyTxForm` exports so ImportsPage type-checks against them.
 */

import type { CategorySummary } from "@flowm/api"

export interface TxForm {
  flowKind: "expense" | "income"
  amount: string
  counterparty: string
  categoryId: CategorySummary["id"] | null
  source: string
  date: string
  note: string
}

export function emptyTxForm(): TxForm {
  return {
    flowKind: "expense",
    amount: "",
    counterparty: "",
    categoryId: null,
    source: "现金",
    date: "2026-06-21",
    note: "",
  }
}

interface Props {
  open: boolean
  categories: CategorySummary[]
  initial?: TxForm
  title?: string
  subtitle?: string
  onClose: () => void
  onSave: (form: TxForm) => void
}

export function AddTxModal(_props: Props) {
  return null
}
