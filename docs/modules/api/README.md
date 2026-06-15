# API Package

## Responsibility

`packages/api` is the product facade used by the Electron main process. It translates renderer-facing operations into domain-shaped results through use cases, domain rules, infrastructure repositories, and presentation mappers.

## Key Files

- `packages/api/src/index.ts` - public API entry point.
- `packages/api/src/shared/api-helpers.ts` - shared Result, ID, date, currency, and SQL helper primitives.
- `packages/api/src/infrastructure/db/sqlite-api-base.ts` - shared SQLite-backed facade base class and cross-domain query helpers.
- `packages/api/src/use-cases/` - facade-compatible use-case wrappers for reference data, imports, cashflow, assets, subscriptions, loans, budgets, links, and dashboard workflows. These files must not import Drizzle, `@flowm/db`, or access `this.db` directly.
- `packages/api/src/infrastructure/db/repositories/*-api.repository.ts` - Drizzle-backed persistence implementations that support the facade-compatible use-case wrappers.
- `packages/api/src/sqlite/` - transitional compatibility re-exports for old internal import paths.
- `packages/api/src/domain/assets/asset-rules.ts` - pure asset normalization rules.
- `packages/api/src/use-cases/assets/assets-api.ts` - present asset facade methods backed by asset use cases and repositories.
- `packages/api/src/use-cases/assets/upsert-asset-snapshot.ts` - multi-step asset snapshot upsert workflow.
- `packages/api/src/infrastructure/db/repositories/assets.repository.ts` - Drizzle-backed asset item and snapshot persistence.
- `packages/api/src/presentation/mappers/sqlite-row-mappers.ts` - SQLite row to renderer contract mappers.
- `packages/api/src/default-seed.ts` and `demo-seed.ts` - seed data helpers.
- `packages/api/tests/api.test.ts` - integration tests for the facade against SQLite.

## Use-Case Map

- `assets/assets-api.ts` - asset snapshot CRUD, net worth inputs, and asset detail data.
- `budgets/budgets-api.ts` - budget definitions and budget-related cashflow summaries.
- `cashflow/cashflow-api.ts` - past cashflow event queries and mutations.
- `dashboard/dashboard-api.ts` - cross-layer dashboard composition without requiring reconciliation.
- `imports/imports-api.ts` - imported statement records and transaction review surfaces.
- `links/links-api.ts` - relationships between imported records and explanatory domain objects.
- `loans/loans-api.ts` - loan plans and projected payment occurrences.
- `reference/reference-api.ts` - reference/category-style data used by UI workflows.
- `subscriptions/subscriptions-api.ts` - subscription plans and projected occurrences.

## Data Flow

The Electron main router calls this package with a typed `Database` handle from `@flowm/db`. Public facade methods keep the existing tRPC-facing API stable while use-case wrappers delegate persistence to `infrastructure/db/repositories/`, pure rules live in `domain/`, and row-to-contract conversion lives in `presentation/mappers/`.

## Interfaces

The package exports the facade consumed by `apps/desktop/src/main/trpc/router.ts`. Browser-safe asset contracts are owned by `@flowm/shared/contracts` and re-exported from `@flowm/api` for compatibility while renderer imports migrate to the shared contract layer.

## Watchouts

- `packages/api/src/sqlite/` is compatibility glue only; new implementation code should use the layered folders directly.
- `pnpm check-architecture` enforces that `use-cases/` do not import Drizzle or `@flowm/db`, infrastructure does not import use cases, shared contracts stay browser-safe, and `sqlite/` remains compatibility glue.
- Do not infer asset balances from imports.
- Do not materialize subscription or loan forecasts as actual cashflow unless an explicit workflow is being built.
- Prefer Drizzle expressions. Raw SQL strings and `db.$client` are outside the product boundary.
- Handwritten API and test files carry AI headers; update them when the file's responsibility or boundary changes.
