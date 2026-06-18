# Runbook

## Environment

- Runtime: Node.js compatible with the workspace `pnpm` lockfile.
- Package manager: `pnpm@10.12.1`.
- Desktop runtime: Electron with native `better-sqlite3`.
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

## Demo Data

```bash
pnpm seed:demo
```

This delegates to the desktop package demo seed script.

## Flowm CLI

```bash
pnpm flowm-cli ledger-info
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
