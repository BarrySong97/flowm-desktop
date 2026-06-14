# Desktop App

## Responsibility

`apps/desktop` owns the Electron shell, preload bridge, React renderer, routing, local app resources, and packaging configuration.

## Key Files

- `apps/desktop/src/main/index.ts` - Electron app bootstrap, user data path, SQLite connection, migrations, and main process lifecycle.
- `apps/desktop/src/main/trpc/router.ts` - tRPC IPC router exposed to the renderer.
- `apps/desktop/src/main/trpc/trpc.ts` - tRPC helpers for the Electron main process.
- `apps/desktop/src/preload/index.ts` - typed preload bridge exposed as `window.flowm`.
- `apps/desktop/src/renderer/src` - React renderer routes, feature pages, providers, and app styles.
- `apps/desktop/electron-builder.yml` - desktop packaging configuration.

## Data Flow

React renderer -> tRPC client -> preload IPC -> Electron main router -> `@flowm/api` -> `@flowm/db` -> SQLite.

The renderer should never open SQLite directly and should not import Node-only main process code.

## Interfaces

- `window.flowm.trpcRequest(operation)`
- `window.flowm.getDatabasePath()`
- `window.flowm.databaseExists()`

Update `apps/desktop/src/preload/index.d.ts` whenever the preload contract changes.

## Watchouts

- Keep `app.setPath("userData", ...)` compatible with `~/Library/Application Support/com.flowm.desktop`.
- Desktop tests and development depend on the Electron ABI for `better-sqlite3`.
- UI copy and flows must preserve the separation between cashflow, assets, and obligations.
