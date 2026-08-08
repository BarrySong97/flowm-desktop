# Tauri Node Sidecar And Native ABI

## Runtime Contract

Flowm packages its existing TypeScript/tRPC/Drizzle data host as a
self-contained Node 22 executable with `@yao-pkg/pkg`. End users do not need to
install Node. Tauri embeds the target-specific executable through
`bundle.externalBin` and starts it from Rust.

`better-sqlite3` is the only externalized JavaScript dependency because it
loads a native `.node` binding. The pkg configuration includes that binding as
an asset. Build each installer on the matching operating system and
architecture; do not reuse one platform's native addon on another target.

## Commands

Build the JavaScript bundle only:

```bash
pnpm -F desktop build:tauri-sidecar:js
```

Build the target-specific self-contained sidecar:

```bash
pnpm -F desktop build:tauri-sidecar
```

If a checkout previously rebuilt `better-sqlite3` for Electron, repair the
local dependency once with:

```bash
pnpm -F desktop rebuild better-sqlite3
```

Normal `pnpm install` in a clean checkout installs the Node ABI used by tests,
the CLI, and the sidecar build.

## Packaging Invariants

- The build runs under Node 22 and rejects another major version.
- The pkg JavaScript entry runs through `process.execPath`; do not spawn the
  `pnpm.cmd` shim directly because Node rejects that batch-file invocation on
  Windows runners.
- The sidecar filename ends with the Rust host triple expected by Tauri.
- `src-tauri/binaries/` is generated and ignored by Git.
- The final app contains the executable as `flowm-sidecar` plus bundled
  migrations and `flowm-demo.sqlite3`.
- On macOS, sign the nested sidecar before signing the outer `.app`; local
  builds use an ad-hoc identity and CI overrides it with the Developer ID.
- Sidecar stdout remains NDJSON protocol-only.
