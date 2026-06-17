# Flowm CLI Package Design

## Context

Flowm needs a local command line interface that AI agents can use to inspect a
ledger and submit guarded business patches. The CLI is not a generic SQLite
editor. It must preserve Flowm's asymmetric product model: imported statements
become past cashflow records, asset balances remain present snapshots, and
future subscriptions or loans remain forecasts unless a separate explicit
workflow materializes them.

The current prototype lives under `apps/desktop/scripts/flowm-cli.ts`. That
proved the core shape, but the repository is a monorepo and the CLI should have
its own package boundary. The first production-quality version will therefore
move the command into `packages/cli`, use Commander.js for command parsing, and
continue to call the guarded `@flowm/api` facade rather than direct table-level
SQLite mutations.

## Goals

- Provide a stable workspace command for agents:
  `pnpm flowm-cli ...`.
- Move the CLI into a dedicated `packages/cli` workspace package.
- Use Commander.js for commands, options, help output, and argument validation.
- Keep all writes behind `applyAgentLedgerPatch` and other business-level API
  methods.
- Resolve the active ledger path without requiring agents to know Flowm's
  database layout.
- Preserve the Electron ABI requirement for `better-sqlite3`.
- Keep the first implementation install-ready in shape, while deferring global
  npm installation and packaging to a later phase.

## Non-Goals

- Do not implement arbitrary SQL execution.
- Do not expose unrestricted table CRUD.
- Do not build platform-specific installers in the first phase.
- Do not parse WeChat, Alipay, PDF, Word, or CSV inputs inside the product code.
  Agents normalize those inputs into Flowm patch operations.
- Do not infer asset balances, loan liabilities, or budgets from imported
  transactions.

## Architecture

Create `packages/cli` as a normal workspace package. It owns the command line
entry point, argument parsing, JSON output contract, database path resolution,
and process exit codes.

The CLI depends on:

- `commander` for the command framework.
- `@flowm/api` for all business operations.
- `@flowm/db` for schema and migrations.
- `@flowm/shared` for shared result types.
- `better-sqlite3` and `drizzle-orm` for opening the selected SQLite ledger.

The desktop app remains responsible for the user-facing Electron shell and
ledger bootstrap. The CLI may reuse the desktop package's Electron binary during
workspace execution so native SQLite bindings stay compiled for the Electron
Node ABI.

The durable boundary is:

```text
agent -> pnpm flowm-cli -> packages/cli -> @flowm/api -> @flowm/db -> SQLite
```

Agents do not write SQLite directly. CLI operations either inspect data through
API facade methods or submit patch operations to the guarded agent ledger patch
facade.

## Package Shape

The package should be named `@flowm/cli` and include:

- `packages/cli/package.json`
- `packages/cli/tsconfig.json`
- `packages/cli/src/index.ts`
- `packages/cli/src/launcher.cjs` or equivalent JS launcher if needed for
  cross-platform Electron runtime setup
- `docs/modules/cli/README.md`

The root `package.json` script should become:

```json
{
  "flowm-cli": "pnpm -F @flowm/cli flowm-cli --"
}
```

The desktop package should stop owning the CLI script once the package version
exists. Desktop can still own seed and demo ledger scripts.

## Command Model

Use Commander.js for the first command surface:

```bash
pnpm flowm-cli ledger-info
pnpm flowm-cli list-categories
pnpm flowm-cli list-assets
pnpm flowm-cli list-cashflow --source wechat-pay --limit 50
pnpm flowm-cli apply-patch patch.json --dry-run
pnpm flowm-cli apply-patch patch.json --commit
```

`apply-patch` accepts either a file path or `-` for stdin. It defaults to
`--dry-run`; callers must pass `--commit` to write. `--dry-run` and `--commit`
are mutually exclusive.

All successful command output should be JSON so an agent can parse it
deterministically. Commander.js owns human-readable help text through `--help`.

Potential later commands, such as `ensure-asset`, `list-budgets`, or
`validate-patch`, should be added only after the API exposes guarded business
operations for those domains.

## Database Path Resolution

The CLI resolves the database path in this priority order:

1. `--db /path/to/flowm.sqlite3`
2. `FLOWM_DB_PATH=/path/to/flowm.sqlite3`
3. `FLOWM_USER_DATA_DIR=/path/to/appdata`
4. Platform default app data directory:
   - macOS: `~/Library/Application Support/com.flowm.desktop`
   - Windows: `%APPDATA%/com.flowm.desktop`, with
     `~/AppData/Roaming/com.flowm.desktop` as fallback
   - Linux: `$XDG_CONFIG_HOME/com.flowm.desktop`, with
     `~/.config/com.flowm.desktop` as fallback
5. `flowm-ledgers.json` active ledger inside the resolved app data directory
6. `flowm.sqlite3` inside the resolved app data directory when no registry is
   present

When the active ledger file in `flowm-ledgers.json` is relative, resolve it
against the app data directory. When it is absolute, use it as-is.

`ledger-info` may report that the resolved database does not exist. Commands
that need to read or write ledger data should fail clearly when the selected
database file is missing.

## Runtime And Cross-Platform Strategy

The first phase is a workspace command, not a globally installed CLI. It should
run through Electron's Node runtime so `better-sqlite3` stays on the Electron
ABI. To avoid POSIX-only environment variable syntax on Windows, prefer a small
JavaScript launcher that sets:

```js
process.env.ELECTRON_RUN_AS_NODE = "1"
```

and then starts the Electron binary with the TypeScript CLI entry point.

The launcher can locate:

- the desktop package's Electron binary during workspace development
- the root `tsx` CLI during TypeScript execution

Future real installation can replace this with a built JavaScript artifact and
a documented install flow, but that phase must still handle native SQLite ABI
compatibility explicitly.

## Patch Safety Rules

The CLI must not accept raw SQL, table names, or arbitrary record mutation
requests. Write operations go through `applyAgentLedgerPatch`.

The first patch operations are:

- `category.ensure`
- `cashflow.create`

Imported cashflow creation requires:

- `sourceName`
- `sourceExternalId`

The API deduplicates imported records by `sourceName + sourceExternalId`.
Repeated imports with identical business fields should skip. Repeated source
identities with changed amount, date, direction, flow kind, or counterparty
should report conflicts. Commit mode must stay transactional: any rejected or
conflicting operation rolls back the patch.

## Error Handling

Use stable process exit behavior:

- `0`: command completed and produced parseable JSON.
- `1`: runtime, database, JSON, migration, or commit-time business failure.
- `2`: CLI usage error such as invalid options or missing arguments.

Dry-run conflict detection should normally return exit code `0` with conflict
details in JSON, because the agent is expected to revise the patch. Commit mode
conflicts should exit `1`, because the requested write did not happen.

Errors should go to stderr. Successful command payloads should go to stdout.

## Documentation Updates

Update the docs so the boundary is clear:

- Add `docs/modules/cli/README.md`.
- Update `docs/modules/desktop/README.md` to remove ownership of the CLI script.
- Update `docs/modules/api/README.md` and `docs/modules/db/README.md` only where
  they reference the agent patch entry point.
- Update `docs/run.md` with `pnpm flowm-cli`.
- Update `skills/flowm-ledger-kit` references only if paths change; the public
  command should remain `pnpm flowm-cli`.
- Update `check-docs.config.json` so the new module is covered.

## Verification

Implementation is successful when these checks pass:

```bash
pnpm -F @flowm/cli check-types
pnpm check-architecture
pnpm check-docs
```

Run CLI smoke verification against a copied demo ledger:

```bash
cp apps/desktop/resources/flowm-demo.sqlite3 /private/tmp/flowm-cli-smoke.sqlite3
pnpm flowm-cli ledger-info --db /private/tmp/flowm-cli-smoke.sqlite3
pnpm flowm-cli list-categories --db /private/tmp/flowm-cli-smoke.sqlite3
pnpm flowm-cli apply-patch patch.json --db /private/tmp/flowm-cli-smoke.sqlite3 --dry-run
pnpm flowm-cli apply-patch patch.json --db /private/tmp/flowm-cli-smoke.sqlite3 --commit
pnpm flowm-cli list-cashflow --db /private/tmp/flowm-cli-smoke.sqlite3 --source smoke-test
```

Business behavior to verify:

- Dry-run does not write rows.
- Commit writes a cashflow row that can be listed by source.
- Reusing the same source identity with identical fields skips.
- Reusing the same source identity with changed business fields conflicts.
- Commit conflicts roll back the whole patch.

Skill and documentation verification:

```bash
python3 /Users/songtianjian/.codex/skills/.system/skill-creator/scripts/quick_validate.py skills/flowm-ledger-kit
```

Run targeted formatting on touched docs and TypeScript files as needed before
finishing the implementation phase.

## Future Installation Phase

After the workspace CLI is stable, a separate design should cover real
installation. That phase should decide whether the installed CLI is:

- shipped with the desktop app,
- published as an npm package,
- or distributed as a packaged binary.

The decision must include native SQLite ABI strategy, how the CLI discovers a
user's installed Flowm data directory, and how version compatibility is handled
between the app, database migrations, and CLI.
