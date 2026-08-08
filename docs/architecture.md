# Flowm Desktop Architecture

Flowm Desktop uses Tauri v2 while retaining the existing React renderer,
TypeScript business packages, Drizzle schema, and SQLite ledger format.

## Runtime Path

```text
React UI
  -> @flowm/shared/contracts DTOs
  -> React Query / tRPC client
  -> window.flowm Tauri adapter
  -> narrow Rust commands
  -> private NDJSON Node 22 sidecar
  -> tRPC router
  -> @flowm/api
  -> @flowm/db / better-sqlite3
  -> SQLite
```

The sidecar owns the only active SQLite connection and all ledger lifecycle
operations. Rust owns the process and request serialization. The renderer
receives neither generic sidecar execution nor raw SQL/filesystem access. There
is one SQLite implementation and no LocalStorage/SQLite compatibility layer.

Native file selection and reveal use official Tauri plugins. External CLI
refresh hints enter through a local socket owned by the sidecar and leave
through a narrow drain command. TanStack Router remains the source of truth for
desktop history navigation.

## Workspace Ownership

- `apps/desktop` owns the Tauri shell, bundled Node sidecar, React renderer,
  routes, resources, and desktop packaging.
- `apps/mobile` owns the Flutter Android/iOS shell and does not open the user's
  desktop SQLite directory.
- `apps/web` owns the Next.js marketing site and public release notes.
- `packages/api` owns product use cases, domain rules, repositories, and
  renderer-facing mappers.
- `packages/db` owns the Drizzle schema, migrations, and typed database handle.
- `packages/shared` owns browser-safe contracts and platform-light utilities.
- `packages/ui` owns reusable UI primitives and global styles.

## SQLite Location

The production Tauri identifier is `com.flowm.desktop`, preserving the
existing platform app-data identity and ledger directory. On macOS this is:

```text
~/Library/Application Support/com.flowm.desktop
```

The personal database is `flowm.sqlite3`; the packaged demo is copied to
`flowm-demo.sqlite3`. Development uses `com.flowm.desktop.dev` and therefore a
separate app-data directory.

## Layered Package Shape

```text
apps/desktop/src/renderer/          browser frontend
apps/desktop/src-tauri/             native command/process boundary
apps/desktop/src/tauri-sidecar/     Node ledger host
apps/desktop/src/main/trpc/         presentation / tRPC adapter
packages/shared/src/contracts/      shared contracts
packages/api/src/use-cases/         application workflows
packages/api/src/domain/            pure business rules
packages/api/src/infrastructure/    database and side-effect adapters
packages/api/src/presentation/      renderer-safe DTO mappers
packages/db/                        Drizzle schema and migrations
```

Renderer code should prefer `@flowm/shared/contracts` for DTO-like types and
must not import Tauri, Node, DB, or sidecar implementation modules.

## Packaging

`@yao-pkg/pkg` turns the Vite-bundled sidecar into a target-specific Node 22
executable containing the `better-sqlite3` native binding. Tauri embeds that
binary with migrations and the demo ledger. GitHub Actions builds macOS and
Windows installers on their matching runners, signs/notarizes macOS when
credentials exist, and uploads artifacts to the tag's GitHub Release.

## Validation

```bash
pnpm install
pnpm check-types
pnpm test
pnpm build
pnpm -F desktop package
cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Use `FlowM Dev` for manual data checks so production ledgers are not modified.
