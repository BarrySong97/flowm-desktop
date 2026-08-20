# Testing And Verification

## Principles

- Verify the affected runtime path, not only the source text.
- Start with the smallest meaningful test or typecheck.
- Broaden to the workspace checks before finishing substantial changes.
- Keep production ledgers out of mutation tests; use disposable SQLite files or
  the `com.flowm.desktop.dev` application identity.

## Standard Commands

```bash
pnpm lint
pnpm format:check
pnpm check-architecture
pnpm check-types
pnpm test
pnpm build
pnpm check-docs
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Native Dependency Rule

Workspace tests, CLI development, and the packaged sidecar all use the Node 22
ABI for `better-sqlite3`. A clean `pnpm install` establishes that ABI. If a
checkout contains an old Electron rebuild, repair it with:

```bash
pnpm -F desktop rebuild better-sqlite3
```

Do not rebuild the shared native module for another runtime.

## What To Test

- Product facade/database behavior: package tests under `packages/*/tests`.
- Sidecar boundary: isolated SQLite creation, real tRPC mutation/readback,
  ledger lifecycle, and refresh-queue behavior.
- Renderer workflows: nearby unit/component tests plus manual app verification.
- Database schema changes: migration generation/application and API tests.
- Packaging: target-specific sidecar, migrations/demo resource presence,
  bundle identifier, and platform signature.
- Harness changes: lint, format, architecture, and documentation checks.

## Manual Tauri Verification

Run the isolated development app:

```bash
pnpm -F desktop dev:tauri
```

Confirm:

- The page URL is `tauri://localhost` and the data-backed dashboard loads.
- Hash-route, mouse side-button, browser back/forward, and Command+[ / Command+]
  navigation use TanStack Router history.
- Ledger import opens a native SQLite chooser and registers the selected file
  through the sidecar.
- Reveal opens the selected ledger in Finder/Explorer.
- CLI `--commit` refresh hints invalidate renderer queries for the active
  database only.
- Settings show the app version, a manual update check/install action, and a
  browser download fallback. Development builds must reject production update
  checks.

Use a disposable ledger for writes. File selection and reveal may be tested on
known development data; do not overwrite or delete production data.

## Release Bundle Verification

```bash
pnpm -F desktop package
codesign --verify --deep --strict apps/desktop/src-tauri/target/release/bundle/macos/FlowM.app
```

Also confirm the macOS bundle contains:

- `Contents/MacOS/flowm-sidecar`
- `Contents/Resources/migrations/`
- `Contents/Resources/resources/flowm-demo.sqlite3`
- `CFBundleIdentifier = com.flowm.desktop`

For updater-enabled release builds also confirm:

- macOS emits `FlowM.app.tar.gz` plus its `.sig` file;
- the macOS release job explicitly builds both `app` and `dmg`; the updater
  archive is generated from the app bundle and a DMG-only build cannot populate
  the `darwin-aarch64` entry in `latest.json`;
- Windows emits the NSIS installer plus its `.sig` file;
- the published `latest.json` version matches the tag and contains signed
  `darwin-aarch64` and `windows-x86_64` entries with direct release-download
  URLs;
- the release workflow uses the updater/signature and asset-pattern input names
  accepted by the repository's pinned `tauri-action@v0` contract.

Windows CI must build the x64 sidecar and NSIS installer on the Windows runner;
native sidecar artifacts are not cross-OS reusable.
