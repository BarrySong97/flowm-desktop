# Shared Package

## Responsibility

`packages/shared` owns reusable types, browser-safe contracts, and small utilities that are safe to use across packages.

## Key Files

- `packages/shared/src/index.ts` - package exports.
- `packages/shared/src/contracts/` - browser-safe frontend/backend DTO and input contracts.
- `packages/shared/src/ipc/` - browser-safe local IPC event contracts and path helpers shared by desktop and CLI.
- `packages/shared/src/types/` - shared data and result types.
- `packages/shared/src/utils/` - platform-light helpers such as account and platform utilities.

## Current Contents

- `types/beancount.ts` - import-oriented account and statement types.
- `types/result.ts` - small Result-style success/failure type.
- `contracts/common/flowm-primitives.contract.ts` - common Flowm IDs, money, direction, cashflow kind, and status primitives.
- `contracts/assets/asset.contract.ts` - asset item/archive state, asset snapshot,
  net worth, and asset change contracts shared by renderer and API.
- `ipc/index.ts` - local ledger-change event and socket path helper used for CLI commit refresh notifications, plus the `UpdateStatusEvent` auto-update lifecycle contract relayed from the desktop main process to the renderer.
- `utils/account.ts` - account hierarchy and display helpers.
- `utils/currency.ts` - curated common-currency registry (code, localized name, display symbol) with `currencySymbol` and `formatMoney` helpers used by renderer pickers and money formatting.
- `utils/platform.ts` - cross-package platform helpers that do not import Electron.

## Data Flow

Shared contracts, types, and helpers flow outward into API, database-adjacent code, and renderer code. This package should not depend back on desktop, API, DB, or UI packages.

## Interfaces

Consumers import broad shared exports from `@flowm/shared`; browser-safe DTO
contracts can be imported from `@flowm/shared/contracts`, and local refresh IPC
contracts can be imported from `@flowm/shared/ipc`.

## Watchouts

- Keep this package free of Electron, DOM, SQLite, and renderer state concerns.
- Contracts must remain DTO/input shapes only; workflow code belongs in `packages/api/use-cases` or renderer feature modules.
- If a helper needs product data access or UI state, it belongs in a higher layer.
- Do not confuse this package with `packages/api/src/shared`, which contains
  API-internal helpers such as Result wrappers, ID generation, SQL expressions,
  and cashflow-to-category-kind mapping.
- Shared TypeScript files carry AI headers; keep them platform-boundary focused rather than implementation transcripts.
