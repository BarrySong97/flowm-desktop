# Shared Package

## Responsibility

`packages/shared` owns reusable types and small utilities that are safe to use across packages.

## Key Files

- `packages/shared/src/index.ts` - package exports.
- `packages/shared/src/types/` - shared data and result types.
- `packages/shared/src/utils/` - platform-light helpers such as account and platform utilities.

## Data Flow

Shared types and helpers flow outward into API, database-adjacent code, and renderer code. This package should not depend back on desktop, API, DB, or UI packages.

## Interfaces

Consumers import from `@flowm/shared`.

## Watchouts

- Keep this package free of Electron, DOM, SQLite, and renderer state concerns.
- If a helper needs product data access or UI state, it belongs in a higher layer.
