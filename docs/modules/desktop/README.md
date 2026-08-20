# Desktop App

## Responsibility

`apps/desktop` owns the Tauri v2 shell, bundled Node data sidecar, React
renderer, routing, local app resources, and desktop packaging configuration.

## Key Files

- `apps/desktop/src-tauri/src/lib.rs` - Tauri composition root, narrow commands, and managed sidecar lifecycle.
- `apps/desktop/src-tauri/tauri.conf.json` - production identity, window, resource, external binary, and bundle configuration.
- `apps/desktop/src-tauri/tauri.dev.conf.json` - isolated `FlowM Dev` identity overlay.
- `apps/desktop/src/tauri-sidecar/index.ts` - NDJSON process entry point.
- `apps/desktop/src/tauri-sidecar/ledger-store.ts` - ledger registry, migrations, one active SQLite connection, and `@flowm/api` facade.
- `apps/desktop/src/main/local-ledger-change-server.ts` - local socket listener for CLI commit refresh hints.
- `apps/desktop/src/main/trpc/router.ts` - tRPC router exposed through the private sidecar.
- `apps/desktop/src/main/trpc/transport.ts` - compact sidecar request dispatcher.
- `apps/desktop/src/main/trpc/ledger-service.ts` - runtime-neutral ledger lifecycle contract.
- `apps/desktop/src/renderer/src` - React renderer routes, feature pages, providers, and app styles.
- `apps/desktop/src/renderer/src/env.d.ts` - typed `window.flowm` renderer contract.
- `apps/desktop/src/renderer/src/lib/desktop-runtime.ts` - Tauri adapter for native commands, import/reveal, CLI refresh, version, signed updates, and manual download fallback.
- `apps/desktop/resources/icons` - shared desktop app icon sources and macOS `.icns` asset.
- `apps/desktop/src-tauri/icons/icon.ico` - generated Windows executable/installer resource icon required by `tauri-build`.
- `apps/desktop/scripts/seed-demo.ts` - developer script for seeding local demo data.
- `apps/desktop/scripts/build-demo-ledger.ts` - script for building the packaged demo ledger resource.
- `apps/desktop/vite.config.ts` - Vite build for the renderer.
- `apps/desktop/vite.sidecar.config.ts` - Vite build for sidecar JavaScript.
- `apps/desktop/scripts/build-tauri-sidecar.mjs` - maps Rust host triples to self-contained Node 22 sidecars.
- `apps/desktop/pkg.sidecar.config.cjs` - includes the dynamic `better-sqlite3` native binding in the sidecar.
- `.github/workflows/release.yml` - tag-triggered Tauri DMG/NSIS build and upload pipeline.
- `scripts/release.mjs` - release automation entrypoint behind `pnpm release <version>`; validates the web release note, bumps package versions, commits, pushes `main`, tags, waits for CI, validates the published release, and publishes `@barrysongdev4real/flowm-cli` to npm.

## Renderer Feature Map

- `assets/` - present asset snapshot list, detail, edit, and archived-account workflows.
- `analysis/` - long-range cashflow analysis for monthly income, expense, and net savings trends, with a history-aware back affordance for entry links from overview and imports.
- `budget/` - budget list/detail workflows, expense-category scope editing, and budget query invalidation helpers.
- `dashboard/` - cross-layer overview that composes cashflow, assets, and obligations in a
  left summary workbench beside a persistent recent-cashflow table, including clickable daily
  expense bars that open same-period cashflow detail drawers.
- `imports/` - imported statement and cashflow event views.
- `loans/` - future loan obligation views and schedule calculations.
- `settings/` - ledger, category, and app configuration surfaces.
- `subscriptions/` - recurring future obligation views that project calendar/list dates from plans at
  read time and show explicitly linked cashflow as separate actual-deduction history.
- `components/charts/` - renderer chart components.
- `components/layout/` - desktop shell, title bar, persistent top navigation, and banners.
- `components/ui/` - renderer-local UI atoms that are more product-shaped than `@flowm/ui`, including `CurrencySelect` (autocomplete currency picker over the common-currency set), `DateInput` (HeroUI date picker for ISO date form values), `MoneyAmount` (currency-aware amount with hide-amounts masking), and `BackButton` (the one ghost back affordance — text variant `← 返回X` or icon-only — shared by every detail page/panel).
- `lib/` - browser-safe renderer helpers, tRPC client wiring, command parsing, and UI state atoms; `lib/useCurrentRates.ts` exposes the base currency and a `toDisplay` conversion helper used by cross-currency totals.
- `lib/mouseHistoryNavigation.ts` maps side buttons, browser history keys, and macOS Command+[ / Command+] to TanStack Router history on Tauri.
- `routes/` - TanStack Router route modules; `routeTree.gen.ts` is generated and intentionally excluded from file-header enforcement.

## Data Flow

React renderer -> `window.flowm` adapter -> Tauri Command -> private NDJSON
sidecar -> shared tRPC router -> `@flowm/api` -> `@flowm/db` -> SQLite.

The sidecar owns the connection and ledger lifecycle. Rust serializes requests
through one managed process; the renderer does not receive shell, filesystem,
or raw SQL access. There is one SQLite implementation and no LocalStorage data
compatibility layer.

The renderer should never open SQLite directly and should not import Node-only sidecar code.

## Built-In Ledgers

On first launch, `TauriLedgerStore` materializes two SQLite files under the production `com.flowm.desktop` app-data directory:

- `flowm-demo.sqlite3` - copied from the packaged demo resource and used for the full sample ledger.
- `flowm.sqlite3` - migrated in place and seeded as the user's editable personal ledger with default categories plus small starter budgets, assets, subscriptions, and loans.

Fresh installs start on the demo ledger, while the personal ledger is already present so the user can switch out of demo mode without landing on an empty database.

Ledger switching changes the active SQLite connection in the sidecar, not a renderer-side filter. After any successful switch, renderer code must clear query state, route to a stable screen, show a short transition state, and reload the window so already-mounted pages cannot keep showing data from the previous ledger.

## Interfaces

- `window.flowm.trpcRequest(operation)`
- `window.flowm.getDatabasePath()`
- `window.flowm.databaseExists()`
- `window.flowm.onLedgerChanged(callback)` - renderer event hook used to invalidate cached queries after an external CLI commit against the active ledger.
- `window.flowm.getAppVersion()` - resolves the running Tauri application version.
- `window.flowm.checkForUpdate()` - checks signed production release metadata.
- `window.flowm.installUpdate(callback)` - downloads, verifies, installs, and relaunches after explicit confirmation.
- `window.flowm.openDownloadPage()` - opens the latest GitHub Release as a fallback.

Tauri's official dialog/opener/updater/process plugins provide ledger import,
file reveal, signed updates, relaunch, and the manual download fallback. The
sidecar receives external CLI refresh hints and the renderer polls the narrow
Rust drain command while subscribed.

Developer and agent scripts can call the `@flowm/cli` workspace package through
`pnpm flowm-cli ...` to inspect a ledger or apply a guarded agent ledger patch
through the API layer.

When the desktop app is running, it also opens a local ledger-change socket in
the app data directory. Successful CLI `--commit` commands send a best-effort
`ledger.changed` event to that socket; the sidecar queues events only
when the changed database path matches the current active ledger. The renderer
then invalidates React Query state so open screens refetch without reloading.

Update `apps/desktop/src/renderer/src/env.d.ts` whenever the `window.flowm` contract changes.

## Watchouts

- Keep the desktop-visible app name `FlowM` and production identifier `com.flowm.desktop` stable so existing data stays in place.
- Tauri development uses `com.flowm.desktop.dev` / `FlowM Dev`; do not test writes through the production identity.
- Keep Tauri SQLite access behind Rust commands and the private sidecar. Do not
  expose sidecar execution, raw SQL, Node, or filesystem access to the renderer.
- Build sidecars with Node 22 on the matching OS/architecture. The generated
  executable includes the `better-sqlite3` binding and requires no system Node.
- Tauri dialog/opener capabilities stay limited to file selection and revealing
  a known ledger path. Selected files are migrated and registered inside the
  sidecar; the renderer never opens them.
- Sidecar stdout is the NDJSON protocol. All diagnostics, including local socket
  startup messages, must go to stderr or be suppressed.
- Do not overwrite `flowm.sqlite3` when it already exists; that file is user data, even if the starter seed changes later.
- New non-demo ledgers created from settings use the same personal starter seed as `flowm.sqlite3`.
- Ledger switching happens in the sidecar. Invalidating one route's queries is not enough; use the shared renderer switch helper so cache clearing, transition UI, navigation, and reload stay consistent.
- The local ledger-change socket is only a refresh hint for external commits. Do not use it for writes or direct renderer database access.
- Renderer CRUD forms should use React Hook Form for state and validation, with current HeroUI controls plus `components/ui/FormField.tsx` for field-level labels and error state.
- Renderer feature UI should prefer HeroUI controls and Tailwind utilities.
  Inline styles are reserved for dynamic runtime values, chart-library prop
  objects, and values Tailwind cannot express cleanly.
- Dashboard cashflow range selection is a renderer preference persisted in
  `localStorage`; it does not change the active ledger or database state.
- Dashboard loan debt is a read-time projection: the overview loads loan
  occurrence history and derives remaining principal from elapsed due dates so
  its debt figure matches the loans page. This does not mutate forecast rows,
  cashflow, or asset snapshots.
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
- Desktop tests, CLI development, and sidecar packaging depend on the Node 22 ABI for `better-sqlite3`.
- Releases start with a human/AI-authored note in
  `apps/web/components/releases/ReleaseTimeline.tsx`; the release script refuses
  to continue unless the first note and the single `latest` badge match the
  target version.
- Updater releases require the long-lived FlowM signing key. Keep only its
  public key in `tauri.conf.json`; CI secrets hold the encrypted private key and
  password. Every release must publish signed updater artifacts plus a
  `latest.json` containing macOS ARM64 and Windows x64 entries.
- UI copy and flows must preserve the separation between cashflow, assets, and obligations. The
  subscription detail separates read-time 「扣费计划」 from 「实际扣款流水」; subscription/loan
  details use `cashflow-links/LinkedCashflowDrawer` (bound flows + 解绑) and
  `cashflow-links/CashflowPickerModal` (filtered multi-select binding). These are read/link surfaces
  only: binding flows must never alter the forecast plan or its statistics. The picker reuses the
  shared filter controls extracted to `imports/filterControls.tsx`.
- Subscription schedules are browser-safe read-time projections from active plans. They are not
  written on ledger open or at a date boundary, and elapsed projected dates never count as actual
  deductions. Loan progress is a date-derived projection: non-skipped occurrences due on or
  before the local current date count as elapsed, regardless of stored forecast
  status or linked cashflow. `TauriLedgerStore` extends loan forecasts 60 days ahead on ledger open and
  at the next local date boundary.
  Generation is idempotent by plan and due date, and emits a renderer refresh
  hint after the maintenance pass. This workflow never creates cashflow,
  changes occurrence status or stored principal, or modifies asset snapshots.
- Multi-currency: single items render in their original currency symbol via `currencySymbol(entity.currency)` — this applies to list rows, detail panels (subscription/loan/asset detail), and per-loan widgets (e.g. the schedule bar). Aggregated totals (net worth, asset totals/treemap, subscription/loan summaries, future pressure) render in the base currency after conversion via `useCurrentRates().toDisplay`. The base currency is editable in settings, and opening a ledger triggers a background daily FX refresh. Past cashflow, imports, and budgets stay in native amounts and are not converted.
- Hide amounts: a global, persisted preference (`amountsHiddenAtom`) masks every money amount to `⋯⋯` (currency symbols/signs stay) for demos, screenshots, or onlookers. Components must format money through the `useMoney` / `useSignedMoney` / `useCurrencyMoney` hooks (in `@/lib/useMoney`), never the pure `@/lib/format` functions, so toggling re-renders them. Toggle it from settings or the top navigation.
- Primary route navigation belongs to the root renderer shell. Feature pages must not mount
  their own navigation, and dashboard summaries should remain independently scrollable from
  the recent-cashflow table at reduced window heights. `TitleBar` is the outermost renderer DOM
  boundary: its 24px top band and the non-interactive parts of the 52px navigation row use CSS
  `app-region: drag`; only concrete links and buttons use `app-region: no-drag`. Never wrap the
  route tree in a no-drag ancestor and then try to restore dragging below it. Do not add imperative
  window-drag event handlers; Tauri's declarative `data-tauri-drag-region` still requires the
  `core:window:allow-start-dragging` capability. The navigation row uses the same 28px horizontal
  inset as overview content.
- The overview uses `TransactionTable` compact mode so its narrow right pane shows date,
  item, category, and amount. Full cashflow and detail surfaces keep the tag and source columns.
- Asset account removal is an archive workflow. Archived accounts stay out of
  current asset totals, net worth, and asset composition, but remain viewable
  from the assets surface so users can inspect history or restore the account.
- Analysis charts summarize past cashflow only; keep them visually connected to
  cashflow review, not asset reconciliation or forecast planning.
- The demo ledger banner is intentionally non-dismissible while a demo ledger is active; the explicit exit is switching to a non-demo ledger.
- Handwritten desktop source files carry AI headers. Generated files such as `routeTree.gen.ts` and ambient Vite declarations are skipped in `check-docs.config.json`.
