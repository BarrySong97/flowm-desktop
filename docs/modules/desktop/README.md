# Desktop App

## Responsibility

`apps/desktop` owns the Electron shell, preload bridge, React renderer, routing, local app resources, and packaging configuration.

## Key Files

- `apps/desktop/src/main/index.ts` - Electron app bootstrap, user data path, SQLite connection, migrations, and main process lifecycle.
- `apps/desktop/src/main/ledgers.ts` - ledger path switching between the user's app data database and packaged demo database.
- `apps/desktop/src/main/trpc/router.ts` - tRPC IPC router exposed to the renderer.
- `apps/desktop/src/main/trpc/trpc.ts` - tRPC helpers for the Electron main process.
- `apps/desktop/src/preload/index.ts` - typed preload bridge exposed as `window.flowm`.
- `apps/desktop/src/renderer/src` - React renderer routes, feature pages, providers, and app styles.
- `apps/desktop/resources/icons` - packaged desktop app icon sources and macOS `.icns` asset.
- `apps/desktop/scripts/seed-demo.ts` - developer script for seeding local demo data.
- `apps/desktop/scripts/build-demo-ledger.ts` - script for building the packaged demo ledger resource.
- `apps/desktop/electron-builder.yml` - desktop packaging configuration.

## Renderer Feature Map

- `assets/` - present asset snapshot list, detail, and edit workflows.
- `budget/` - budget list/detail workflows and budget query invalidation helpers.
- `dashboard/` - cross-layer overview that composes cashflow, assets, and obligations.
- `imports/` - imported statement and cashflow event views.
- `loans/` - future loan obligation views and schedule calculations.
- `settings/` - ledger, category, and app configuration surfaces.
- `subscriptions/` - recurring future obligation views, calendar/list surfaces, and detail panels.
- `components/charts/` - renderer chart components.
- `components/layout/` - desktop shell, title bar, dock, and banners.
- `components/ui/` - renderer-local UI atoms that are more product-shaped than `@flowm/ui`.
- `lib/` - browser-safe renderer helpers, tRPC client wiring, command parsing, and UI state atoms.
- `routes/` - TanStack Router route modules; `routeTree.gen.ts` is generated and intentionally excluded from file-header enforcement.

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
- The demo ledger banner is intentionally non-dismissible while a demo ledger is active; the explicit exit is switching to a non-demo ledger.
- Handwritten desktop source files carry AI headers. Generated files such as `routeTree.gen.ts` and ambient Vite declarations are skipped in `check-docs.config.json`.
