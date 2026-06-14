# Database Package

## Responsibility

`packages/db` owns the SQLite schema, Drizzle migrations, and the typed database handle used by the Electron main process and API package.

## Key Files

- `packages/db/src/index.ts` - database exports and typed handle.
- `packages/db/src/schema/index.ts` - canonical Drizzle schema.
- `packages/db/migrations/` - generated SQLite migrations and Drizzle metadata.
- `packages/db/drizzle.config.ts` - Drizzle migration configuration.

## Data Flow

Electron main opens the SQLite file, runs migrations, and passes the typed database handle into `@flowm/api`. Product code queries exported schema objects through Drizzle.

## Interfaces

- Exported schema tables and types from `@flowm/db`.
- Migration files consumed during desktop startup and tests.

## Watchouts

- Schema changes must preserve the asymmetric layer boundaries: cashflow, asset snapshots, and future obligations are not one reconciled ledger.
- Migration files are generated artifacts but still user-data critical. Review them before shipping.
- Do not bypass the typed database handle from product code.
