# CLI Package

## Responsibility

`packages/cli` owns the workspace command line interface that agents and
developers use to inspect Flowm ledgers and submit guarded business patches.

## Key Files

- `packages/cli/src/index.ts` - Commander.js command surface for ledger
  inspection and patch application.
- `packages/cli/src/launcher.cjs` - cross-platform launcher that runs the CLI
  through Electron's Node runtime so `better-sqlite3` stays on the Electron ABI.
- `packages/cli/scripts/build.mjs` - npm packaging build: bundles workspace
  Flowm code, copies DB migrations, and writes a sanitized publish directory.
- `packages/cli/package.json` - package scripts, workspace dependencies, and
  CLI package metadata.
- `packages/cli/npm/` - generated publish directory for
  `@barrysongdev4real/flowm-cli`; do not
  edit by hand.

## Data Flow

Agent or developer -> `pnpm flowm-cli` -> `@barrysongdev4real/flowm-cli` ->
`@flowm/api` -> `@flowm/db` -> SQLite.

The CLI opens the selected SQLite file, runs migrations, creates the Flowm API
facade, and delegates all business behavior to the API layer.

## npm Distribution

`@barrysongdev4real/flowm-cli` is published from the generated
`packages/cli/npm` directory, not directly from the workspace package root. The
build bundles the local `@flowm/api`, `@flowm/db`, and `@flowm/shared` source
into `dist/index.mjs`, copies `packages/db/migrations` into `dist/migrations`,
and keeps `better-sqlite3`, `commander`, and `drizzle-orm` as normal npm
runtime dependencies.

The workspace command still uses `packages/cli/src/launcher.cjs` and Electron's
Node runtime to preserve the desktop app's native dependency ABI. The npm
package installs its own `better-sqlite3` for the user's Node runtime, so it can
be executed as `npx @barrysongdev4real/flowm-cli ...` or through the installed
`flowm-cli` binary.

## Interfaces

- `pnpm flowm-cli ledger-info [--db path]`
- `pnpm flowm-cli list-categories [--db path]`
- `pnpm flowm-cli list-assets [--db path] [--type type] [--active-only]`
- `pnpm flowm-cli get-asset <id> [--db path]`
- `pnpm flowm-cli create-asset --name name --type type [--commit] [--db path]`
- `pnpm flowm-cli update-asset <id> [fields...] [--commit] [--db path]`
- `pnpm flowm-cli archive-asset <id> [--commit] [--db path]`
- `pnpm flowm-cli list-asset-snapshots [--asset-id id] [--latest-only] [--db path]`
- `pnpm flowm-cli get-asset-snapshot <id> [--db path]`
- `pnpm flowm-cli add-asset-snapshot --asset-id id --value amount [--commit] [--db path]`
- `pnpm flowm-cli update-asset-snapshot <id> [fields...] [--commit] [--db path]`
- `pnpm flowm-cli delete-asset-snapshot <id> [--commit] [--db path]`
- `pnpm flowm-cli net-worth [--currency code] [--db path]`
- `pnpm flowm-cli asset-change <asset-id> [--comparison previous|30d|90d|1y] [--db path]`
- `pnpm flowm-cli list-budget-sets [--db path]`
- `pnpm flowm-cli create-budget-set --name name [--commit] [--db path]`
- `pnpm flowm-cli list-budget-periods [--budget-set-id id] [--status status] [--db path]`
- `pnpm flowm-cli create-budget-period --budget-set-id id --start date --end date [--kind monthly|weekly|yearly|custom] [--commit] [--db path]`
- `pnpm flowm-cli list-budget-items [--budget-period-id id] [--db path]`
- `pnpm flowm-cli create-budget-item --budget-period-id id --name name --amount amount [--category-id id] [--commit] [--db path]`
- `pnpm flowm-cli update-budget-item <id> [fields...] [--category-id id] [--clear-scopes] [--commit] [--db path]`
- `pnpm flowm-cli archive-budget-item <id> [--commit] [--db path]`
- `pnpm flowm-cli budget-progress --budget-period-id id [--db path]`
- `pnpm flowm-cli list-cashflow [--db path] [--source name] [--source-external-id id] [--limit n]`
- `pnpm flowm-cli list-linked-cashflow --owner-type subscription|loan --owner-id id [--db path]`
- `pnpm flowm-cli bind-cashflow --owner-type subscription|loan --owner-id id --event-id id [--event-id id...] [--note text] [--commit] [--db path]`
- `pnpm flowm-cli unbind-cashflow <link-id> [--commit] [--db path]`
- `pnpm flowm-cli apply-patch <patch.json|-> [--db path] [--dry-run|--commit]`

The `apply-patch` command defaults to `--dry-run`. It writes only when callers
pass `--commit`.

Asset write commands also default to dry-run and write only when callers pass
`--commit`. Asset item deletion is intentionally exposed as archive, while
asset snapshot deletion removes a single present-state snapshot record.

Budget write commands also default to dry-run and write only when callers pass
`--commit`. Budget scopes can be bound with repeatable `--category-id` flags or
lower-level repeatable `--scope kind:value` flags. `budget-progress` summarizes
past active expense cashflow inside the selected period; it does not materialize
planned spend or future obligations.

Cashflow-binding commands record which real cashflow events back a subscription
or loan as its deductions, stored as `object_links`. `bind-cashflow` accepts
repeatable `--event-id` and is idempotent (existing links are skipped);
`unbind-cashflow` removes one link by id. Both default to dry-run and write only
with `--commit`. Bindings are explanatory only and never change the forecast plan
or its statistics.

After a successful `--commit`, the CLI sends a best-effort local
`ledger.changed` event to the desktop app's IPC socket. If the app is closed, or
the socket is unavailable, the CLI still succeeds and preserves machine-readable
JSON stdout. Set `FLOWM_CLI_DEBUG_IPC=1` to see skipped notification diagnostics
on stderr.

Agents that need machine-parseable stdout should call `pnpm --silent flowm-cli
...` so pnpm does not add lifecycle output around the CLI's JSON payload.

Supported patch operations currently include `category.ensure`,
`cashflow.create`, and `cashflow.classify`. Use `cashflow.classify` to update an
existing transaction's category by cashflow `id` or by `sourceName` plus
`sourceExternalId`. Category operations are guarded by the API: a patch cannot
assign an income cashflow to an expense category, or an expense cashflow to an
income category.

## Ledger Resolution

The CLI resolves a ledger path in this order:

1. `--db`
2. `FLOWM_DB_PATH`
3. `FLOWM_USER_DATA_DIR`
4. The platform's default Flowm app data directory
5. The active ledger in `flowm-ledgers.json`
6. `flowm.sqlite3` under the resolved app data directory

## Watchouts

- Do not expose arbitrary SQL or table-level CRUD from this package.
- Keep write workflows behind `@flowm/api.applyAgentLedgerPatch` or another
  guarded business API.
- Asset commands must call the guarded `@flowm/api` asset facade. Do not add raw
  SQLite asset mutation commands.
- Keep imported statement parsing outside durable product code. Agents normalize
  source files into patch operations before calling this CLI.
- Preserve the Electron ABI for `better-sqlite3`; do not replace the launcher
  with a plain Node runtime command.
- Keep npm publish output generated. If package metadata changes, update
  `packages/cli/scripts/build.mjs` and verify with
  `pnpm -F @barrysongdev4real/flowm-cli pack:dry`.
- CLI output should remain JSON by default so agents can parse it reliably.
