# Asymmetric Finance Model

## Why This Exists

Flowm intentionally avoids forcing all personal finance data into one reconciled double-entry ledger. Users can import past statements, maintain current asset snapshots, and plan future obligations without making every layer balance perfectly.

## The Three Layers

- Past cashflow lives in `cashflow_events` and imported statement records.
- Present assets live in `asset_snapshots`; balances are manually maintained and are not inferred from imported statement lines.
- Future obligations live in `subscriptions`, `subscription_occurrences`, `loans`, and `loan_payment_occurrences`.

## Consequences For Implementation

- Dashboard and overview screens may show these layers together, but aggregation must not imply reconciliation.
- Linking imported cashflow to subscriptions or loans can help explain data, but it should not automatically create asset changes or actual expenses.
- Net worth liabilities come from liability asset snapshots, not from loan plans.

## Review Questions

- Does this change infer present balances from past imports?
- Does this change convert a forecast into an actual event without an explicit user workflow?
- Does the UI wording imply the books must balance when Flowm does not require that?
