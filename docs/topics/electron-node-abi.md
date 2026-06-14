# Electron Native Dependency ABI

## Why This Exists

`better-sqlite3` is a native dependency. The desktop app loads it inside Electron, so the installed binary must match Electron's Node ABI rather than the system Node ABI.

## Rules

- Use `pnpm test` for workspace tests. It rebuilds app deps and runs Vitest through Electron's Node runtime.
- Per-package test scripts should also use Electron's Node runtime when they touch SQLite.
- Do not run plain `vitest run` unless you intentionally want to switch the native binary to the system Node ABI.

## Repair Command

```bash
pnpm rebuild:electron
```

Equivalent package-scoped command:

```bash
pnpm -F desktop exec electron-builder install-app-deps
```

## Symptom

If Electron dev fails to load `better-sqlite3` with an ABI mismatch, rebuild app deps before debugging product code.
