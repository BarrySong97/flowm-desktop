# Runbook

## Environment

- Runtime: Node.js compatible with the workspace `pnpm` lockfile.
- Package manager: `pnpm@10.12.1`.
- Desktop runtime: Electron with native `better-sqlite3`.
- Mobile runtime: Flutter stable. The initial `apps/mobile` shell was generated
  with Flutter 3.41.4 and Dart 3.11.1.
- Data location: `~/Library/Application Support/com.flowm.desktop/flowm.sqlite3`.

## Install

```bash
pnpm install
```

## Start Development App

```bash
pnpm dev
```

This runs the Electron desktop app through `turbo -F desktop dev`.

The development app uses `.flowm/dev-user-data` as its user data directory when
started from the workspace, so local verification can use a copied ledger
without touching the installed app's production data.

On macOS, the desktop package dev script first prepares
`apps/desktop/.electron-dev/FlowM.app` from Electron's npm-bundled
`Electron.app` and launches it through `ELECTRON_EXEC_PATH`. This keeps the
Dock, app menu, and process name aligned with the production app while still
using electron-vite's development server.

## Start Mobile App

Flutter commands run directly inside the mobile app directory rather than
through pnpm or Turbo:

```bash
cd apps/mobile
flutter pub get
flutter run
```

The initial mobile shell targets Android and iOS. It is not wired to the
Electron IPC or the user's live Desktop data directory. For development, it
copies the bundled Desktop demo SQLite fixture into the simulator/device app
sandbox and reads it through Drift with a read-only SQLite connection.

## Build

```bash
pnpm build
```

Package the desktop app:

```bash
pnpm package
```

Package and install the macOS app into `/Applications/FlowM.app`:

```bash
pnpm install:local
```

Use `pnpm install:local -- --restart` when you want the script to quit the
running FlowM app before installation and reopen it afterward.

Create distribution artifacts:

```bash
pnpm dist
```

## Release

Before running a release, add the new first entry in
`apps/web/components/releases/ReleaseTimeline.tsx` and move `badge: "latest"` to
that entry. Then run the release command from `main`:

```bash
pnpm release 0.2.2
```

The release script validates the release note, bumps the root/desktop/web/CLI
package versions, commits the release, pushes `main`, pushes tag `v<version>`,
waits for the tag-triggered GitHub Actions build, publishes the draft GitHub
Release as latest, and publishes `@barrysongdev4real/flowm-cli` to npm from
`packages/cli/npm`. Before committing, it runs `pnpm check-docs`,
`pnpm format:check`, `pnpm lint`, and `pnpm build`. Use `--dry-run`,
`--no-publish`, `--no-npm`, `--no-cask`, `--no-wait`, or `--no-checks` while
testing.

## Typecheck

```bash
pnpm check-types
```

The alias `pnpm typecheck` also runs `turbo check-types`.

## Lint And Format

```bash
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format
```

`pnpm lint` runs Oxlint across the workspace. `pnpm format:check` checks Oxfmt formatting without writing files; `pnpm format` writes Oxfmt changes in place.

## Test

```bash
pnpm test
```

`pnpm test` runs `pnpm run test:electron`, which rebuilds Electron app dependencies and runs Vitest through Electron's Node runtime.

Avoid plain `vitest run` unless you intentionally want to recompile native dependencies for the system Node ABI. If that happens, repair the desktop ABI with:

```bash
pnpm rebuild:electron
```

Mobile app checks:

```bash
cd apps/mobile
flutter analyze
flutter test
dart run build_runner build --delete-conflicting-outputs
```

## Demo Data

```bash
pnpm seed:demo
```

This delegates to the desktop package demo seed script.

## Flowm CLI

```bash
pnpm flowm-cli ledger-info
pnpm flowm-cli list-budget-periods --status active
pnpm flowm-cli budget-progress --budget-period-id <id>
pnpm flowm-cli apply-patch patch.json --dry-run
```

This runs the `@flowm/cli` workspace package through Electron's Node runtime so
ledger inspection and guarded agent patch application use the correct
`better-sqlite3` ABI.

Use `pnpm --silent flowm-cli ...` when another program needs to parse stdout as
JSON.

## Harness Checks

```bash
pnpm check-docs
```

Equivalent direct command:

```bash
node scripts/check-docs.mjs
```

Use strict mode when you want drift warnings to fail the command:

```bash
node scripts/check-docs.mjs --strict
```
