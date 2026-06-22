/**
 * @purpose Interaction-only stub for the cashflow tx detail panel.
 * @role    The mock Imports page never opens this (row selection is inert), so it renders nothing.
 * @gotcha  Keep the exported `Tx` shape in sync with the real panel so ImportsPage type-checks.
 */

export interface Tx {
  id: number
  rawId: string
  date: string
  occurredAt?: string | null
  counterparty: string
  flowKind: string
  amount: number
  categoryId?: string | number | null
  categoryName: string
  tag?: string
  source: string
  title?: string | null
  description?: string | null
  userNote?: string | null
  statementLineId?: string | number | null
  createdAt?: string | null
}

interface Props {
  tx: Tx
  allTxs: Tx[]
  onBack: () => void
  onEdit: (tx: Tx) => void
  onDelete: (rawId: string) => void | Promise<void>
}

export function TxDetailPanel(_props: Props) {
  return null
}
