# `apps/mobile` - Flowm mobile app

Flutter Android/iOS app shell for Flowm. The mobile app is read-only: it
displays data synced from Desktop and does not create, edit, import, export,
delete, or reset financial data. Its primary tabs are dashboard, daily spend
calendar, and asset snapshots.

## Commands

Run Flutter commands from this directory:

```bash
cd apps/mobile
flutter pub get
flutter run
flutter analyze
flutter test
dart run build_runner build --delete-conflicting-outputs
```

## Layout

- `lib/main.dart` — app entry point.
- `lib/src/` — read-only mobile shell, theme tokens, read models, shared UI
  components, dashboard, calendar, and asset screens.
- `lib/src/ui_components.dart` — shared layout primitives and chart wrappers;
  line and bar charts use `fl_chart`.
- `lib/src/data/` — Drift schema mirror, read-only SQLite fixture seeding, and
  the repository mapping Desktop rows into mobile display data.
- `assets/flowm-demo.sqlite3` — bundled Desktop demo ledger copied into the
  simulator/device app sandbox for development.
- `test/` — Flutter widget tests.
- `android/` and `ios/` — Flutter-generated native platform shells.

## Boundaries

The mobile app is initialized as a separate Flutter app inside the monorepo. In
development it reads a copied `flowm-demo.sqlite3` fixture through Drift. It
does not access the user's desktop SQLite directory, Electron IPC, or
`better-sqlite3`.

Future mobile data access should use an explicit Desktop sync/API boundary and
keep Flowm's past cashflow, present assets, and future obligations as separate
product layers. Mobile screens should remain query/display-only. Full
transaction browsing, category/tag management, and data cleanup workflows belong
on Desktop rather than mobile.
