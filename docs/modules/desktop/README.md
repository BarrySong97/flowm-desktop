# Desktop App

## Responsibility

`apps/desktop` owns the Electron shell, preload bridge, React renderer, routing, local app resources, and packaging configuration.

## Key Files

- `apps/desktop/src/main/index.ts` - Electron app bootstrap, user data path, SQLite connection, migrations, and main process lifecycle.
- `apps/desktop/src/main/ledgers.ts` - ledger path switching between the user's app data database and packaged demo database.
- `apps/desktop/src/main/local-ledger-change-server.ts` - local socket listener for CLI commit refresh hints.
- `apps/desktop/src/main/bootstrap/auto-update.ts` - electron-updater wiring against the public GitHub Releases feed: launch + manual checks, download-on-click, and quit-to-install; relays lifecycle as `flowm:updater:status` events and no-ops in dev/local dir installs that lack `app-update.yml`.
- `apps/desktop/src/renderer/src/providers/auto-update.tsx` - renderer controller that mirrors update status into `updateStatusAtom` and drives the bottom-right update toast.
- `.github/workflows/release.yml` - tag-triggered (`v*`) CI that builds, signs, notarizes, and uploads installers to a draft GitHub Release (macOS arm64 dmg/zip, Windows nsis); `scripts/release.mjs` publishes the draft after the workflow succeeds.
- `apps/desktop/src/main/trpc/router.ts` - tRPC IPC router exposed to the renderer.
- `apps/desktop/src/main/trpc/trpc.ts` - tRPC helpers for the Electron main process.
- `apps/desktop/src/preload/index.ts` - typed preload bridge exposed as `window.flowm`.
- `apps/desktop/src/renderer/src` - React renderer routes, feature pages, providers, and app styles.
- `apps/desktop/resources/icons` - packaged desktop app icon sources and macOS `.icns` asset.
- `apps/desktop/scripts/seed-demo.ts` - developer script for seeding local demo data.
- `apps/desktop/scripts/build-demo-ledger.ts` - script for building the packaged demo ledger resource.
- `apps/desktop/electron-builder.yml` - desktop packaging configuration.
- `scripts/release.mjs` - release automation entrypoint behind `pnpm release <version>`; validates the web release note, bumps package versions, commits, pushes `main`, tags, waits for CI, publishes the draft release, and publishes `@barrysongdev4real/flowm-cli` to npm.
- `scripts/prepare-electron-dev-app.mjs` - prepares the macOS branded `FlowM.app` used by the desktop dev command.

## Renderer Feature Map

- `assets/` - present asset snapshot list, detail, edit, and archived-account workflows.
- `analysis/` - long-range cashflow analysis for monthly income, expense, and net savings trends.
- `budget/` - budget list/detail workflows, expense-category scope editing, and budget query invalidation helpers.
- `dashboard/` - cross-layer overview that composes cashflow, assets, and obligations,
  including clickable daily expense bars that open same-period cashflow detail drawers.
- `imports/` - imported statement and cashflow event views.
- `loans/` - future loan obligation views and schedule calculations.
- `settings/` - ledger, category, and app configuration surfaces.
- `subscriptions/` - recurring future obligation views, calendar/list surfaces, and detail panels.
- `components/charts/` - renderer chart components.
- `components/layout/` - desktop shell, title bar, dock, and banners.
- `components/ui/` - renderer-local UI atoms that are more product-shaped than `@flowm/ui`, including `CurrencySelect` (autocomplete currency picker over the common-currency set), `DateInput` (HeroUI date picker for ISO date form values), `MoneyAmount` (currency-aware amount with hide-amounts masking), and `BackButton` (the one ghost back affordance — text variant `← 返回X` or icon-only — shared by every detail page/panel).
- `lib/` - browser-safe renderer helpers, tRPC client wiring, command parsing, and UI state atoms; `lib/useCurrentRates.ts` exposes the base currency and a `toDisplay` conversion helper used by cross-currency totals.
- `routes/` - TanStack Router route modules; `routeTree.gen.ts` is generated and intentionally excluded from file-header enforcement.

## Data Flow

React renderer -> tRPC client -> preload IPC -> Electron main router -> `@flowm/api` -> `@flowm/db` -> SQLite.

The renderer should never open SQLite directly and should not import Node-only main process code.

## Built-In Ledgers

On first launch, `apps/desktop/src/main/ledgers.ts` materializes two SQLite files under `~/Library/Application Support/com.flowm.desktop`:

- `flowm-demo.sqlite3` - copied from the packaged demo resource and used for the full sample ledger.
- `flowm.sqlite3` - migrated in place and seeded as the user's editable personal ledger with default categories plus small starter budgets, assets, subscriptions, and loans.

Fresh installs start on the demo ledger, while the personal ledger is already present so the user can switch out of demo mode without landing on an empty database.

Ledger switching changes the active SQLite connection in the Electron main process, not a renderer-side filter. After any successful switch, renderer code must clear query state, route to a stable screen, show a short transition state, and reload the window so already-mounted pages cannot keep showing data from the previous ledger.

## Interfaces

- `window.flowm.trpcRequest(operation)`
- `window.flowm.getDatabasePath()`
- `window.flowm.databaseExists()`
- `window.flowm.onLedgerChanged(callback)` - renderer event hook used to invalidate cached queries after an external CLI commit against the active ledger.
- `window.flowm.getAppVersion()` - resolves the running `app.getVersion()` for the settings "关于" version row.
- `window.flowm.updater.check()` / `.download()` / `.onStatus(callback)` - trigger an update check, start the download, and subscribe to `flowm:updater:status` lifecycle events.

Developer and agent scripts can call the `@flowm/cli` workspace package through
`pnpm flowm-cli ...` to inspect a ledger or apply a guarded agent ledger patch
through the API layer.

When the desktop app is running, it also opens a local ledger-change socket in
the app data directory. Successful CLI `--commit` commands send a best-effort
`ledger.changed` event to that socket; the main process forwards events only
when the changed database path matches the current active ledger. The renderer
then invalidates React Query state so open screens refetch without reloading.

Update `apps/desktop/src/preload/index.d.ts` whenever the preload contract changes.

## Watchouts

- Keep `app.setPath("userData", ...)` compatible with `~/Library/Application Support/com.flowm.desktop`.
- Development may override `userData` through `FLOWM_USER_DATA_DIR`; keep this
  dev-only so packaged installs remain on `com.flowm.desktop`.
- The desktop-visible app name is `FlowM`; keep the bundle id and userData path stable for existing installs.
- macOS development launches a generated `apps/desktop/.electron-dev/FlowM.app`; use `isDevRuntime()` for dev resource paths because that bundle can look packaged to Electron.
- Do not overwrite `flowm.sqlite3` when it already exists; that file is user data, even if the starter seed changes later.
- New non-demo ledgers created from settings use the same personal starter seed as `flowm.sqlite3`.
- Ledger switching happens in the main process. Invalidating one route's queries is not enough; use the shared renderer switch helper so cache clearing, transition UI, navigation, and reload stay consistent.
- The local ledger-change socket is only a refresh hint for external commits. Do not use it for writes or direct renderer database access.
- Renderer CRUD forms should use React Hook Form for state and validation, with current HeroUI controls plus `components/ui/FormField.tsx` for field-level labels and error state.
- Renderer feature UI should prefer HeroUI controls and Tailwind utilities.
  Inline styles are reserved for dynamic runtime values, chart-library prop
  objects, and values Tailwind cannot express cleanly.
- Dashboard cashflow range selection is a renderer preference persisted in
  `localStorage`; it does not change the active ledger or database state.
- Dashboard net worth trend points are month-end as-of asset snapshot totals:
  each account carries its latest known snapshot forward until a newer snapshot
  replaces it, while liabilities subtract from the total.
- The imports/cashflow page keeps its category breakdown interactive: clicking
  a donut segment or the adjacent category row must update the left-side
  category filter and URL-synced filter state.
- Budget creation must work on an empty personal ledger by lazily creating the default budget set and current monthly period before inserting the first item. When a new month has no budget period but a previous monthly plan exists, overview and budget views prompt the user to generate the current month's budget from the latest plan; they must not create rollover periods without confirmation.
- Budget create/edit forms bind optional expense-category scopes through HeroUI
  multi-select controls. Leaving the selection empty means an overall expense
  budget; detail-page transaction lists must use the bound category ids returned
  by budget progress so they match the backend used amount.
- Desktop tests and development depend on the Electron ABI for `better-sqlite3`.
- Releases start with a human/AI-authored note in
  `apps/web/components/releases/ReleaseTimeline.tsx`; the release script refuses
  to continue unless the first note and the single `latest` badge match the
  target version.
- UI copy and flows must preserve the separation between cashflow, assets, and obligations. The subscription/loan detail pages expose a 「扣款流水」 entry that opens `cashflow-links/LinkedCashflowDrawer` (bound flows + 解绑) and `cashflow-links/CashflowPickerModal` (filtered multi-select binding). These are read/link surfaces only: binding flows must never alter the forecast plan or its statistics. The picker reuses the shared filter controls extracted to `imports/filterControls.tsx`.
- Multi-currency: single items render in their original currency symbol via `currencySymbol(entity.currency)` — this applies to list rows, detail panels (subscription/loan/asset detail), and per-loan widgets (e.g. the schedule bar). Aggregated totals (net worth, asset totals/treemap, subscription/loan summaries, future pressure) render in the base currency after conversion via `useCurrentRates().toDisplay`. The base currency is editable in settings, and opening a ledger triggers a background daily FX refresh. Past cashflow, imports, and budgets stay in native amounts and are not converted.
- Hide amounts: a global, persisted preference (`amountsHiddenAtom`) masks every money amount to `⋯⋯` (currency symbols/signs stay) for demos, screenshots, or onlookers. Components must format money through the `useMoney` / `useSignedMoney` / `useCurrencyMoney` hooks (in `@/lib/useMoney`), never the pure `@/lib/format` functions, so toggling re-renders them. Toggle it from settings or the dock eye button.
- Asset account removal is an archive workflow. Archived accounts stay out of
  current asset totals, net worth, and asset composition, but remain viewable
  from the assets surface so users can inspect history or restore the account.
- Analysis charts summarize past cashflow only; keep them visually connected to
  cashflow review, not asset reconciliation or forecast planning.
- The demo ledger banner is intentionally non-dismissible while a demo ledger is active; the explicit exit is switching to a non-demo ledger.
- Handwritten desktop source files carry AI headers. Generated files such as `routeTree.gen.ts` and ambient Vite declarations are skipped in `check-docs.config.json`.
