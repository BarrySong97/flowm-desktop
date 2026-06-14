# API Package

## Responsibility

`packages/api` is the product facade used by the Electron main process. It translates renderer-facing operations into Drizzle-backed queries and domain-shaped results.

## Key Files

- `packages/api/src/index.ts` - public API entry point.
- `packages/api/src/sqlite/base.ts` - shared API/database helper layer.
- `packages/api/src/sqlite/cashflow.ts` - past cashflow queries and mutations.
- `packages/api/src/sqlite/assets.ts` - present asset snapshot operations.
- `packages/api/src/sqlite/subscriptions.ts` - future subscription plan operations.
- `packages/api/src/sqlite/loans.ts` - future loan plan operations.
- `packages/api/src/sqlite/dashboard.ts` - dashboard aggregates assembled from independent layers.
- `packages/api/src/sqlite/imports.ts` and `links.ts` - imported statement and linking workflows.
- `packages/api/src/default-seed.ts` and `demo-seed.ts` - seed data helpers.

## Data Flow

The Electron main router calls this package with a typed `Database` handle from `@flowm/db`. API modules query the Drizzle schema and return renderer-ready product data.

## Interfaces

The package exports the facade consumed by `apps/desktop/src/main/trpc/router.ts`. Keep renderer-facing types stable or update the tRPC router and renderer callers together.

## Watchouts

- This package currently carries most domain behavior; there is no `packages/business` package in the current workspace.
- Do not infer asset balances from imports.
- Do not materialize subscription or loan forecasts as actual cashflow unless an explicit workflow is being built.
- Prefer Drizzle expressions. Raw SQL strings and `db.$client` are outside the product boundary.
