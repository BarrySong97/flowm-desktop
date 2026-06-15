# Shared Package

## Responsibility

`packages/shared` owns reusable types, browser-safe contracts, and small utilities that are safe to use across packages.

## Key Files

- `packages/shared/src/index.ts` - package exports.
- `packages/shared/src/contracts/` - browser-safe frontend/backend DTO and input contracts.
- `packages/shared/src/types/` - shared data and result types.
- `packages/shared/src/utils/` - platform-light helpers such as account and platform utilities.

## Current Contents

- `types/beancount.ts` - import-oriented account and statement types.
- `types/result.ts` - small Result-style success/failure type.
- `contracts/common/flowm-primitives.contract.ts` - common Flowm IDs, money, direction, cashflow kind, and status primitives.
- `contracts/assets/asset.contract.ts` - asset item, asset snapshot, net worth, and asset change contracts shared by renderer and API.
- `utils/account.ts` - account hierarchy and display helpers.
- `utils/platform.ts` - cross-package platform helpers that do not import Electron.

## Data Flow

Shared contracts, types, and helpers flow outward into API, database-adjacent code, and renderer code. This package should not depend back on desktop, API, DB, or UI packages.

## Interfaces

Consumers import broad shared exports from `@flowm/shared`; browser-safe DTO contracts can be imported from `@flowm/shared/contracts`.

## Watchouts

- Keep this package free of Electron, DOM, SQLite, and renderer state concerns.
- Contracts must remain DTO/input shapes only; workflow code belongs in `packages/api/use-cases` or renderer feature modules.
- If a helper needs product data access or UI state, it belongs in a higher layer.
- Shared TypeScript files carry AI headers; keep them platform-boundary focused rather than implementation transcripts.
