# Testing And Verification

## Principles

- Verify by running the affected path, not by reading code alone.
- Start with the smallest meaningful test or typecheck for the touched package.
- Broaden to full workspace checks before finishing substantial changes.
- Prefer deterministic assertions over screenshots for automated checks.

## Standard Commands

```bash
pnpm check-types
pnpm test
pnpm build
pnpm check-docs
```

Run all of them before finishing substantial changes when feasible.

## Native Dependency Rule

`better-sqlite3` must stay compiled for Electron. Use:

```bash
pnpm test
```

Do not use plain `vitest run` unless you intend to repair the ABI afterward with:

```bash
pnpm rebuild:electron
```

## What To Test

- Product facade and database behavior: package tests under `packages/*/tests`.
- Renderer workflows: component or integration tests near the desktop renderer when available, plus manual app verification for user-facing flows.
- Database schema changes: migration generation, migration application, and API tests that exercise the new shape.
- Harness changes: `pnpm check-docs`.

## Manual Verification

For UI changes, run:

```bash
pnpm dev
```

Then walk the affected page in the Electron app. Confirm loading, empty, error, and populated states when the workflow can show them.
