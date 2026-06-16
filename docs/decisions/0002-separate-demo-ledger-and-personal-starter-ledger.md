# 0002. Separate Demo Ledger And Personal Starter Ledger

- Status: accepted
- Date: 2026-06-15

## Context

FlowM needs a strong first-run experience without confusing demo data with user-owned data. A fresh install should open with enough realistic sample data to explain the product, but clicking out of demo mode should not land users in an empty personal ledger.

The app also stores ledgers as local SQLite files managed by the Electron main process. Replacing or reseeding an existing personal SQLite file would risk destroying real user data.

## Decision

FlowM materializes two built-in ledgers on first launch:

- `flowm-demo.sqlite3` is copied from the packaged demo resource and contains the full explanatory demo dataset.
- `flowm.sqlite3` is the user's personal ledger and receives only lightweight editable starter data: default categories, starter budgets, two asset examples, two subscription examples, and two loan examples.

The personal starter ledger must not include imported statements or actual cashflow events. Starter subscriptions and loans remain future plans; starter assets are manual examples with snapshots.

If `flowm.sqlite3` already exists, bootstrap must leave it untouched. New non-demo ledgers created from settings use the same personal starter seed.

## Rationale

The demo ledger can be broad, dense, and clearly fictional. The personal ledger needs to feel immediately usable and safe to edit. Keeping them as separate SQLite files avoids mixing sample evidence with user data and preserves the asymmetric finance model from [0001](0001-keep-finance-layers-asymmetric.md).

The separate files also make the "switch from demo to my data" workflow explicit: the main process switches the active SQLite connection instead of filtering one shared database.

## Consequences

- Demo seed and personal starter seed are separate responsibilities.
- Personal starter seed must stay conservative, idempotent, and editable.
- Starter data must not become cashflow, imported statement evidence, or inferred asset/liability changes.
- First-launch tests should delete the development ledger files and verify that both SQLite files are recreated with the expected contents.
- Renderer ledger switching must handle the active SQLite connection changing under the tRPC facade; until query keys include the active ledger id everywhere, switching should clear renderer state and reload the window.
