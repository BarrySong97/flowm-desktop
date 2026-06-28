# Mobile App

## Responsibility

`apps/mobile` owns the Flutter Android/iOS app shell for Flowm. The app is a
read-only surface for synced Desktop data; it must not expose financial create,
edit, import, export, delete, or reset actions.

## Key Files

- `apps/mobile/lib/main.dart` - app entry point.
- `apps/mobile/lib/src/flowm_mobile_app.dart` - Material app shell and
  bottom-tab navigation.
- `apps/mobile/lib/src/screens.dart` - read-only dashboard, spending, budget,
  fixed-cost, and money snapshot screens.
- `apps/mobile/lib/src/read_only_pages.dart` - read-only secondary pages and
  detail helpers for reports, subscriptions, loans, budgets, assets, and
  individual plan rows.
- `apps/mobile/lib/src/demo_data.dart` - mobile read model plus fallback display
  data used when SQLite loading is disabled in tests.
- `apps/mobile/lib/src/data/flowm_database.dart` - Drift table mirror for the
  Desktop SQLite schema fields used by mobile display.
- `apps/mobile/lib/src/data/mobile_ledger_repository.dart` - read-only mapper
  from Drift rows into mobile dashboard, daily calendar, asset, subscription,
  loan, and budget display models.
- `apps/mobile/lib/src/data/ledger_seed.dart` - development fixture seeding:
  copies the bundled Desktop demo SQLite into the app sandbox before opening it
  read-only.
- `apps/mobile/lib/src/theme.dart` and `ui_components.dart` - mobile design
  tokens, shared UI primitives, and `fl_chart` wrappers for line and bar
  charts.
- `apps/mobile/pubspec.yaml` - Flutter package metadata and dependencies.
- `apps/mobile/test/widget_test.dart` - starter widget smoke test.
- `apps/mobile/android/` and `apps/mobile/ios/` - Flutter-generated native
  platform projects.

## Commands

Run these from `apps/mobile`:

```bash
flutter pub get
flutter run
flutter analyze
flutter test
dart run build_runner build --delete-conflicting-outputs
```

## Data Flow

In development, the mobile app bundles `assets/flowm-demo.sqlite3`, copied from
`apps/desktop/resources/flowm-demo.sqlite3`. At startup, Flutter copies that
fixture into the simulator/device Application Support directory and opens it
through Drift with a read-only SQLite connection.

The mobile app does not open `~/Library/Application Support/com.flowm.desktop`
directly and does not use Electron IPC, `better-sqlite3`, or Drizzle. Drift is
a mobile-side schema mirror used only to query and map display data.

Mobile mapping must preserve Flowm's asymmetric model:

- Past cashflow events are aggregated for mobile summaries, especially the
  daily spend calendar. Mobile should not expose a full ledger-style
  transaction list as a primary surface.
- Present assets and net-worth liabilities come from asset snapshots.
- Future obligations come from subscription and loan plans/forecasts.

## Watchouts

- Do not open or mutate `~/Library/Application Support/com.flowm.desktop`
  directly from Flutter code. Simulator data must come from an explicit copied
  fixture or future sync artifact.
- Do not use raw SQL for product mapping when a Drift table/query can express
  the read. Raw SQLite access is only acceptable for opening the connection
  read-only before handing it to Drift.
- Do not add `better-sqlite3`, Electron, or Node-specific dependencies to the
  Flutter app.
- Use the shared chart wrappers in `ui_components.dart` for mobile charting.
  They use `fl_chart` for line/bar charts so screens do not depend on raw chart
  configuration details.
- Do not add local write flows. Buttons or rows that imply create, edit, import,
  export, delete, reset, or manual reconciliation belong on Desktop, not mobile.
- Keep the mobile information architecture light. The main tabs answer: how
  much money exists now, how much was spent, whether budgets are over, fixed
  subscriptions/loans, and daily spend. Category/tag management and full
  transaction browsing belong on Desktop.
- Keep Android/iOS generated files in the Flutter project boundary unless a
  platform feature requires a focused native change.
