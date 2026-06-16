# Testing And Verification

## Principles

- Verify by running the affected path, not by reading code alone.
- Start with the smallest meaningful test or typecheck for the touched package.
- Broaden to full workspace checks before finishing substantial changes.
- Prefer deterministic assertions over screenshots for automated checks.

## Standard Commands

```bash
pnpm lint
pnpm format:check
pnpm check-architecture
pnpm check-types
pnpm test
pnpm build
pnpm check-docs
```

Run all of them before finishing substantial changes when feasible.

## Native Dependency Rule

`better-sqlite3` must stay compiled for Electron. Use:

```bash
pnpm test
```

Do not use plain `vitest run` unless you intend to repair the ABI afterward with:

```bash
pnpm rebuild:electron
```

When manually inspecting SQLite with `better-sqlite3`, run through Electron's Node ABI too:

```bash
ELECTRON_RUN_AS_NODE=1 apps/desktop/node_modules/.bin/electron -e 'const Database = require("better-sqlite3")'
```

## What To Test

- Product facade and database behavior: package tests under `packages/*/tests`.
- Renderer workflows: component or integration tests near the desktop renderer when available, plus manual app verification for user-facing flows.
- Database schema changes: migration generation, migration application, and API tests that exercise the new shape.
- Harness changes: `pnpm lint`, `pnpm format:check`, `pnpm check-architecture`, and `pnpm check-docs`.

## Manual Verification

For UI changes, run:

```bash
pnpm dev
```

Then walk the affected page in the Electron app. Confirm loading, empty, error, and populated states when the workflow can show them.

### First-Launch Ledger Seed Verification

When changing ledger bootstrap or seed behavior, verify the actual Electron startup path, not only the seed helper:

1. Close FlowM.
2. Delete the development ledger files under `~/Library/Application Support/com.flowm.desktop`: `flowm.sqlite3`, `flowm-demo.sqlite3`, `flowm-ledgers.json`, and any matching `-wal` or `-shm` files.
3. Run `pnpm -F desktop dev` so `LedgerStore.bootstrap()` recreates both built-in ledgers.
4. Inspect the generated databases with Electron ABI, not plain Node.

Expected fresh development state:

- `flowm-demo.sqlite3` exists and contains the full demo ledger copied from the packaged resource.
- `flowm.sqlite3` exists and contains default categories, starter budgets, two asset examples, two subscription examples, and two loan examples.
- `flowm.sqlite3` should not contain imported statements or cashflow events from starter seed.
- `flowm-ledgers.json` lists both ledgers; fresh installs may start on demo, but the personal ledger must already be usable when switching out of demo.

If `flowm.sqlite3` already exists, bootstrap must not overwrite it. That path represents user data, even if the current starter seed has changed.
