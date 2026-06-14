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
- `packages/api/tests/api.test.ts` - integration tests for the facade against SQLite.

## SQLite Service Map

- `assets.ts` - asset snapshot CRUD, net worth inputs, and asset detail data.
- `budgets.ts` - budget definitions and budget-related cashflow summaries.
- `cashflow.ts` - past cashflow event queries and mutations.
- `dashboard.ts` - cross-layer dashboard composition without requiring reconciliation.
- `imports.ts` - imported statement records and transaction review surfaces.
- `links.ts` - relationships between imported records and explanatory domain objects.
- `loans.ts` - loan plans and projected payment occurrences.
- `reference.ts` - reference/category-style data used by UI workflows.
- `subscriptions.ts` - subscription plans and projected occurrences.

## Data Flow

The Electron main router calls this package with a typed `Database` handle from `@flowm/db`. API modules query the Drizzle schema and return renderer-ready product data.

## Interfaces

The package exports the facade consumed by `apps/desktop/src/main/trpc/router.ts`. Keep renderer-facing types stable or update the tRPC router and renderer callers together.

## Watchouts

- This package currently carries most domain behavior; there is no `packages/business` package in the current workspace.
- Do not infer asset balances from imports.
- Do not materialize subscription or loan forecasts as actual cashflow unless an explicit workflow is being built.
- Prefer Drizzle expressions. Raw SQL strings and `db.$client` are outside the product boundary.
- Handwritten API and test files carry AI headers; update them when the file's responsibility or boundary changes.
