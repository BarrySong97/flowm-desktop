# API Presentation Mappers

## Responsibility

`packages/api/src/presentation` maps Drizzle database rows into the browser-safe
DTOs returned by the Flowm API facade.

## Key Files

- `packages/api/src/presentation/mappers/sqlite-row-mappers.ts` - shared row
  mappers for categories, cashflow, assets, subscriptions, loans, budgets, links,
  and dashboard records.

## Data Flow

Drizzle row -> presentation mapper -> API contract -> tRPC/preload -> renderer.

## Watchouts

- Mappers expose stored domain state; they must not calculate cross-layer
  reconciliation.
- Keep DTO changes aligned with `packages/api/src/index.ts` and renderer callers.
- Loan occurrence status is persisted forecast metadata. Presentation mappers
  must not turn elapsed due dates into cashflow or asset mutations; the renderer
  derives projected progress from dates.
