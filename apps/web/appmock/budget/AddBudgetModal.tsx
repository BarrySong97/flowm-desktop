/**
 * @purpose Inert stub of the desktop AddBudgetModal for the marketing app mock.
 * @role    The Budget page mock shows only its default (read) view; the add/edit modal is
 *          interaction-only and therefore rendered as nothing here.
 * @gotcha  Keeps the `BudgetForm` type contract so the verbatim-copied page still compiles.
 */

export interface BudgetForm {
  name: string
  plannedAmount: string
  color: string
  /** Bound expense categories; empty means an overall budget over all expenses. */
  categoryIds: string[]
}

interface Props {
  open: boolean
  saving: boolean
  onSave: (form: BudgetForm) => void
  onClose: () => void
  categories: { id: string; name: string }[]
  initial?: BudgetForm
  title?: string
  subtitle?: string
}

export function AddBudgetModal(_props: Props): null {
  return null
}
