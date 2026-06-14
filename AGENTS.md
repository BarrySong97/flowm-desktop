# Flowm Desktop - Agent Guide

**What:** Flowm Desktop is an Electron app for asymmetric personal finance tracking.
**Architecture:** Electron main/preload + React renderer + tRPC IPC + Drizzle/SQLite. Run commands from [docs/run.md](docs/run.md).

## Product Model

Flowm is not a traditional double-entry ledger. It keeps three independent layers:

1. Past cashflow: how much was spent and earned.
2. Present assets: how much money and value exists now.
3. Future obligations: what will likely be paid later through subscriptions, loans, and plans.

Imported statements, asset snapshots, and future plans may inform each other in the UI, but they do not have to reconcile into one balanced book.

## Red Lines

- Keep the asymmetric model intact; do not infer asset balances from imported statement lines. See [docs/topics/asymmetric-finance-model.md](docs/topics/asymmetric-finance-model.md).
- Subscription and loan plans are forecasts. Do not turn them into actual expenses or asset-liability changes unless a feature explicitly asks for that workflow.
- Liabilities in net worth come from liability asset snapshots, not from loan plans.
- Preserve Electron boundaries: renderer code reaches app data only through preload/tRPC IPC. See [docs/topics/electron-ipc-trpc.md](docs/topics/electron-ipc-trpc.md).
- Access SQLite through Drizzle against `@flowm/db` schema. Do not write raw SQL strings or reach through `db.$client`; use `sql\`...\`` only for expressions Drizzle cannot express.
- Keep `better-sqlite3` on the Electron ABI. Do not run plain Vitest escape hatches unless you intentionally plan to rebuild app deps afterward. See [docs/topics/electron-node-abi.md](docs/topics/electron-node-abi.md).

## Workflow

1. Read the relevant module doc in [docs/modules/](docs/modules/) plus any linked topic docs and file headers.
2. For broad or risky work, write a plan in [docs/plans/](docs/plans/) before changing code.
3. Change code according to [docs/conventions.md](docs/conventions.md), keeping edits scoped.
4. Sync nearby docs: file headers for changed source files, the matching module doc, and an ADR in [docs/decisions/](docs/decisions/) for durable architecture decisions.
5. Run the smallest meaningful verification from [docs/testing.md](docs/testing.md), then broaden to `pnpm check-types`, `pnpm test`, and `pnpm build` when feasible.
6. Run `pnpm check-docs` or `node scripts/check-docs.mjs` before finishing and clear hard failures.

Ratchet rule: when an agent mistake reveals a repeatable risk, add a test, lint rule, sensor, or ADR so the same mistake is harder next time.

## Navigation

- Product model: [docs/topics/asymmetric-finance-model.md](docs/topics/asymmetric-finance-model.md)
- Runtime and IPC: [docs/architecture.md](docs/architecture.md), [docs/topics/electron-ipc-trpc.md](docs/topics/electron-ipc-trpc.md)
- Native dependency ABI: [docs/topics/electron-node-abi.md](docs/topics/electron-node-abi.md)
- Modules: [desktop](docs/modules/desktop/), [api](docs/modules/api/), [db](docs/modules/db/), [shared](docs/modules/shared/), [ui](docs/modules/ui/), [hooks](docs/modules/hooks/)
- Design system: [design.md](design.md)
- Runbook: [docs/run.md](docs/run.md)
- Conventions and terms: [docs/conventions.md](docs/conventions.md)
- Testing and validation: [docs/testing.md](docs/testing.md)
- Specs: [docs/specs/](docs/specs/)
- Plans: [docs/plans/](docs/plans/)
- Decisions: [docs/decisions/](docs/decisions/)
