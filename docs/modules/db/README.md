# Database Package

## Responsibility

`packages/db` owns the SQLite schema, Drizzle migrations, and the typed database handle used by the Electron main process and API package.

## Key Files

- `packages/db/src/index.ts` - database exports and typed handle.
- `packages/db/src/schema/index.ts` - canonical Drizzle schema.
- `packages/db/migrations/` - generated SQLite migrations and Drizzle metadata.
- `packages/db/drizzle.config.ts` - Drizzle migration configuration.

## Schema Areas

- Ledger metadata and settings tables describe the database itself.
- `cashflow_events` describes past cashflow, including rows materialized from
  agent-assisted imports. Import source metadata should live on imported
  cashflow records so the app can deduplicate by source.
- `asset_snapshots` describes present assets and liabilities.
- Budgets, categories, subscriptions, and loans support planning and review workflows.
- Subscription and loan occurrence tables are forecast artifacts, not actual cashflow.

## Data Flow

Electron main opens the SQLite file, runs migrations, and passes the typed database handle into `@flowm/api`. Product code queries exported schema objects through Drizzle.

## Interfaces

- Exported schema tables and types from `@flowm/db`.
- Migration files consumed during desktop startup and tests.

## Watchouts

- Schema changes must preserve the asymmetric layer boundaries: cashflow, asset snapshots, and future obligations are not one reconciled ledger.
- Migration files are generated artifacts but still user-data critical. Review them before shipping.
- Do not bypass the typed database handle from product code.
- Agent-assisted import commands in `@flowm/cli` should use migrations, Drizzle
  schema objects, and the API facade instead of ad hoc direct SQL writes.
- Imported cashflow is deduplicated by source metadata on `cashflow_events`; do
  not recreate a separate evidence layer for routine agent-imported transactions.
- Handwritten database TypeScript files carry AI headers. Generated SQL/JSON migration artifacts are not part of file-header enforcement.
