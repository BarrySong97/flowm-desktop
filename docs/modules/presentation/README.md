# API Presentation Mappers

## Responsibility

`packages/api/src/presentation` maps Drizzle database rows into the browser-safe
DTOs returned by the Flowm API facade.

## Key Files

- `packages/api/src/presentation/mappers/sqlite-row-mappers.ts` - shared row
  mappers for categories, cashflow, assets, subscription plans, loans, budgets,
  links, and dashboard records. Subscription schedule projections do not have a
  SQLite row mapper because they are derived at read time.

## Data Flow

Drizzle row -> presentation mapper -> API contract -> sidecar tRPC -> Tauri renderer bridge.

## Watchouts

- Mappers expose stored domain state; they must not calculate cross-layer
  reconciliation.
- Subscription plan mapping preserves the stored recurrence anchor. Requested
  forecast windows are projected by the browser-safe shared rule, not by mapping
  legacy `subscription_occurrences` rows.
- Keep DTO changes aligned with `packages/api/src/index.ts` and renderer callers.
- Loan occurrence status is persisted forecast metadata. Presentation mappers
  must not turn elapsed due dates into cashflow or asset mutations; the renderer
  derives projected progress from dates.
