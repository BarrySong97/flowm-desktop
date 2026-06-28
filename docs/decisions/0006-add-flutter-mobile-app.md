# 0006. Add Flutter Mobile App

- Status: accepted
- Date: 2026-06-27

## Context

Flowm needs a mobile app initialized inside the existing monorepo while the
desktop product remains an Electron app backed by local SQLite.

## Decision

Create a Flutter Android/iOS app under `apps/mobile`. Keep it separate from
pnpm/Turbo package execution for now, and run Flutter commands directly inside
that directory. Treat mobile as a read-only display surface for data synced from
Desktop, not as a place to create, edit, import, export, delete, or reset
financial data. Keep the primary mobile information architecture intentionally
small: dashboard, spending, budgets, fixed subscriptions/loans, and asset
snapshots.

For development, bundle the Desktop demo ledger as
`apps/mobile/assets/flowm-demo.sqlite3`. On startup, copy it into the
simulator/device app sandbox and query it through Drift with a read-only SQLite
connection. The Drift schema in mobile is a read mirror for display mapping, not
the source of truth for migrations.

## Rationale

Flutter gives the mobile app native Android/iOS project scaffolding without
changing the Electron desktop runtime or the TypeScript package graph. Keeping
the app outside desktop IPC and SQLite boundaries avoids accidentally coupling
mobile startup work to `better-sqlite3` or Electron's native ABI. Drift gives
the Flutter app typed SQLite queries without introducing raw SQL mapping code in
screens.

## Consequences

Developers use `flutter pub get`, `flutter run`, `flutter analyze`, and
`flutter test` from `apps/mobile`. `build_runner` generates Drift code for the
mobile schema mirror.

Future mobile data access needs an explicit API or Desktop sync boundary, and
it must preserve the separation between past cashflow, present asset snapshots,
and future obligations. Net-worth liabilities must keep coming from liability
asset snapshots, while loan plans remain future obligations. Mobile UI should
stay query/display-only; write workflows, category/tag management, and full
transaction browsing belong on Desktop.
