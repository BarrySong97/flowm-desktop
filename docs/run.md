# Runbook

## Environment

- Node.js 22 for workspace tools, tests, CLI development, and sidecar packaging.
- `pnpm@10.12.1`.
- Rust stable and platform Tauri prerequisites for desktop builds.
- Flutter stable for `apps/mobile`.
- Production data identity: `com.flowm.desktop`.

## Install

```bash
pnpm install
```

A clean install builds `better-sqlite3` for Node 22. If this checkout previously
used Electron and reports an ABI mismatch, run once:

```bash
pnpm -F desktop rebuild better-sqlite3
```

## Start Desktop Development

```bash
pnpm dev
```

This builds the self-contained sidecar and launches `FlowM Dev` through Tauri
with identifier `com.flowm.desktop.dev`. It serves the existing React renderer
through Vite and keeps development ledgers separate from production.

Equivalent direct command:

```bash
pnpm -F desktop dev:tauri
```

Useful build checks:

```bash
pnpm -F desktop build:tauri-renderer
pnpm -F desktop build:tauri-sidecar:js
pnpm -F desktop build:tauri-sidecar
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

## Build And Package

Build every workspace package without creating installers:

```bash
pnpm build
```

Build the native Tauri app bundle:

```bash
pnpm package
```

Create the configured distribution artifacts:

```bash
pnpm dist
```

The macOS app bundle is under
`apps/desktop/src-tauri/target/release/bundle/macos/FlowM.app`. Local builds use
an ad-hoc signature; CI overrides it with the configured Developer ID and
notarization credentials.

Build an isolated debug bundle for manual verification:

```bash
pnpm -F desktop exec tauri build --debug --bundles app --config src-tauri/tauri.dev.conf.json
```

Do not distribute the debug bundle.

## Install Locally On macOS

```bash
pnpm install:local
pnpm install:local -- --restart
```

The script packages Tauri, copies `FlowM.app` to `/Applications`, and optionally
restarts it. Existing app data is untouched.

## Release

Add the new first entry in
`apps/web/components/releases/ReleaseTimeline.tsx` and move the single
`badge: "latest"` marker to it, then run from `main`:

```bash
pnpm release 0.2.2
```

The script bumps root/desktop/web/CLI versions plus Tauri JSON/Cargo versions,
runs checks, commits, pushes `main`, tags `v<version>`, and waits for GitHub
Actions. CI creates the GitHub Release, builds target-native Node sidecars,
creates Tauri DMG/NSIS installers, signs/notarizes where configured, and uploads
them. The first updater-enabled Tauri release must be installed by downloading
the latest artifact. Later releases are discovered from the signed `latest.json`
on GitHub Releases and can be installed from the startup prompt or Settings.
Release CI requires `TAURI_SIGNING_PRIVATE_KEY` and
`TAURI_SIGNING_PRIVATE_KEY_PASSWORD`; retain a secure offline backup of the
matching FlowM updater key.

Supported release flags include `--dry-run`, `--no-publish`, `--no-npm`,
`--no-cask`, `--no-wait`, and `--no-checks`.

## Typecheck, Lint, Format, And Test

```bash
pnpm check-types
pnpm lint
pnpm lint:fix
pnpm format:check
pnpm format
pnpm test
pnpm check-architecture
pnpm check-docs
```

`pnpm test` runs Vitest with the same Node ABI used by the sidecar build.

## Demo Data

```bash
pnpm seed:demo
pnpm -F desktop build:demo
```

The seed command is dry-run unless explicitly told to write by its own flags.
The build command regenerates the committed packaged demo ledger.

## Flowm CLI

```bash
pnpm flowm-cli ledger-info
pnpm flowm-cli list-budget-periods --status active
pnpm flowm-cli budget-progress --budget-period-id <id>
pnpm flowm-cli apply-patch patch.json --dry-run
```

The workspace CLI runs directly on Node 22 and uses the same
`better-sqlite3` ABI as the sidecar. Use `pnpm --silent flowm-cli ...` when
another program parses its JSON stdout.

## Mobile App

```bash
cd apps/mobile
flutter pub get
flutter run
flutter analyze
flutter test
```

The mobile development fixture lives in the mobile sandbox and does not open
the user's desktop ledger.

## Blog Images

After configuring Cloudflare R2 credentials from `.env.example`:

```bash
pnpm img <blog-slug> --dry-run
pnpm img <blog-slug>
```

See [Blog Image Pipeline](topics/blog-images.md).
