# 0001. Keep Finance Layers Asymmetric

- Status: accepted
- Date: 2026-06-14

## Context

Flowm tracks personal finance across imported past cashflow, manually maintained present assets, and future obligations. These sources can be useful together, but forcing them to reconcile like a double-entry ledger would make common personal workflows brittle.

## Decision

Flowm keeps past cashflow, present assets, and future obligations as independent layers. UI and analytics may compare or link them, but product logic must not require them to balance.

## Rationale

Imported statements describe what happened, asset snapshots describe what exists now, and subscriptions or loans describe expected future payments. Each layer has different reliability and update cadence. Keeping them independent lets users benefit from partial data without manufacturing false precision.

## Consequences

- Asset balances are entered or updated as snapshots, not inferred from imports.
- Loan plans do not create net worth liabilities; liability snapshots do.
- Subscription and loan occurrences remain forecasts until a feature explicitly records actual cashflow.
- Agent work must check this decision before changing dashboard, import, asset, subscription, or loan behavior.
