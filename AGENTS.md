# AGENTS.md — Flowm Desktop

Flowm Desktop is an Electron desktop app for asymmetric personal finance tracking.

## Product Model

Flowm is not a traditional double-entry ledger that requires every account,
balance, and reconciliation to line up perfectly. It separates personal finance
into three intentionally independent layers:

1. Past cashflow: how much was spent and how much was earned.
2. Present assets: how much money and value exists now.
3. Future obligations: how much will likely be paid later through subscriptions,
   loans, and other plans.

The important rule is asymmetry: imported statements, asset snapshots, and
future plans can inform each other in the UI, but they do not have to reconcile
into one perfectly balanced book.

## Domain Boundaries

- Past cashflow lives in `financial_events` and imported statement records.
- Present assets live in `asset_snapshots`; balances are manually maintained and
  are not inferred from transactions.
- Future obligations live in `plans` and `plan_occurrences`; subscription and
  loan plans are forecasting records and do not automatically become actual
  expenses or asset-liability changes.
- Liabilities in net worth come from liability asset snapshots, not from loan
  plans.

## Structure

- `apps/desktop` - Electron main/preload process and React renderer.
- `packages/api` - Product facade used by the renderer.
- `packages/business` - Domain services, import parsing, plans, and money logic.
- `packages/db` - SQLite schema, migrations, storage adapter, SQL executor.
- `packages/shared` - Shared types and utilities.
- `packages/ui` - Shared UI primitives and styles.

## Runtime

The renderer talks to the Electron main process through tRPC IPC. The main
process owns the SQLite connection, runs migrations, and serves product APIs
backed by `@flowm/api` and `@flowm/db`.

The Electron main process sets `userData` to:

```text
~/Library/Application Support/com.flowm.desktop
```

The database file is:

```text
flowm.sqlite3
```

This keeps compatibility with the previous desktop app data location.

## Commands

```bash
pnpm install
pnpm dev
pnpm check-types
pnpm test
pnpm build
pnpm package
```

If `better-sqlite3` fails to load in Electron dev with a Node ABI mismatch, run:

```bash
pnpm -F desktop exec electron-builder install-app-deps
```

## Working Rules

- Keep product logic aligned with the asymmetric model.
- Do not infer asset balances from imported statements.
- Do not turn subscription or loan plans into actual expenses unless a feature
  explicitly asks for that workflow.
- Preserve the separation between Electron main/preload and renderer code.
- Renderer code must access SQLite only through the preload bridge.
- Before finishing substantial changes, run `pnpm check-types`, `pnpm test`,
  and `pnpm build` when feasible.

## Key Files

- Main shell: `apps/desktop/src/renderer/src/components/terminal/TerminalApp.tsx`
- Electron main process: `apps/desktop/src/main/index.ts`
- Preload bridge: `apps/desktop/src/preload/index.ts`
- Product facade: `packages/api/src/index.ts`
- SQL executor: `packages/db/src/adapters/sql/executor.ts`
- Core schemas: `packages/db/src/schema/financial_events.ts`,
  `packages/db/src/schema/asset_snapshots.ts`, `packages/db/src/schema/plans.ts`
