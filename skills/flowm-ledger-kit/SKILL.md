---
name: flowm-ledger-kit
description: Work with Flowm Desktop ledger data safely. Use when Codex needs to analyze arbitrary financial source material such as CSV, PDF, Word, screenshots, pasted text, statements, contracts, or notes; create or update Flowm categories, cashflow, assets, budgets, subscriptions, loans, or object links; use or extend the agent ledger patch helper; or reason about Flowm's asymmetric finance model and SQLite schema without raw table mutation.
---

# Flowm Ledger Kit

## Core Rule

Do not write arbitrary SQL or mutate Flowm tables directly for user-facing ledger
changes. Express changes as Flowm business operations and route writes through
the guarded API/helper layer.

## Workflow

1. Read `references/product-model.md` before deciding what kind of Flowm object a
   fact belongs to.
2. Read `references/source-analysis-workflow.md` when the user provides source
   material such as a CSV, PDF, Word document, screenshot, pasted text,
   statement, contract, or notes.
3. Read `references/patch-contract.md` before proposing or applying ledger
   writes.
4. Read `references/repo-map.md` when you need exact schema, API, test, or docs
   file paths.
5. Use `pnpm --silent flowm-cli ...` for machine-parseable ledger context and
   patch application.
6. Start with dry-run or a temporary ledger. Commit to a live ledger only when the
   user explicitly asks for it or the workflow has clear approval.

## Write Boundary

- Imported transaction rows are `cashflow_events`, not a separate evidence
  layer.
- Imported cashflow must have `sourceName` and `sourceExternalId` for
  idempotency.
- Assets are present-state snapshots; do not infer balances by summing
  transactions.
- Subscriptions and loans are forecasts; do not materialize forecast occurrences
  as actual cashflow unless the user asks for that workflow.
- Loan plans are not net-worth liabilities; liability net worth comes from
  liability asset snapshots.
- Ambiguous facts should become warnings, review notes, or minimally classified
  cashflow, not high-impact mutations.

## Verification

For code changes, run the smallest meaningful check first, then broaden:

```bash
pnpm check-docs
pnpm check-architecture
pnpm -F @flowm/api test
pnpm check-types
pnpm test
pnpm build
```

Use Electron-backed tests for `better-sqlite3`; do not use plain Vitest unless
you intend to rebuild Electron app dependencies afterward.
