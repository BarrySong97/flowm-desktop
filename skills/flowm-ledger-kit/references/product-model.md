# Product Model

Flowm is an asymmetric personal finance tracker. It keeps three independent
layers that may inform each other but do not have to reconcile into a balanced
book.

## Layers

- Past cashflow: actual historical activity in `cashflow_events`.
- Present assets: current values and liabilities in `asset_items` and
  `asset_snapshots`.
- Future obligations: forecast plans in `subscriptions`, `subscription_occurrences`,
  `loans`, and `loan_payment_occurrences`.

## Invariants

- Do not infer present asset balances from imported or manual cashflow rows.
- Do not turn loan plans into net-worth liabilities. Use liability asset
  snapshots for net worth.
- Do not turn subscription or loan forecasts into actual cashflow unless the user
  explicitly asks for that workflow.
- Object links explain relationships and must not change core aggregates.
- Budgets are planning boundaries; cashflow can reference them for progress, but
  budget progress does not change the planned amount.

## Source Material Mapping

- Transactions, payments, refunds, transfers, debt payments, income, and
  adjustments usually map to `cashflow_events`.
- Explicit balances, market values, debt balances, and valuation statements map
  to asset items and snapshots.
- Planned limits, target spending, and user-stated envelopes map to budgets.
- Recurring service commitments map to subscriptions.
- Principal, lender, rate, term, and repayment facts map to loans.
- Explanatory relationships map to object links.

When unsure, preserve uncertainty in warnings or notes instead of pretending the
ledger is fully reconciled.
