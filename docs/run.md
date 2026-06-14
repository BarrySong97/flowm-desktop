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

## Build

```bash
pnpm build
```

Package the desktop app:

```bash
pnpm package
```

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
