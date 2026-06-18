# Repo Map

Read these files as needed rather than relying on memory.

## Product Rules

- `AGENTS.md`
- `docs/topics/asymmetric-finance-model.md`
- `docs/topics/agent-assisted-imports.md`
- `docs/decisions/0001-keep-finance-layers-asymmetric.md`
- `docs/decisions/0004-agent-ledger-patches.md`

## Schema And API

- `packages/db/src/schema/index.ts`
- `packages/api/src/index.ts`
- `packages/api/src/infrastructure/db/repositories/agent-ledger-api.repository.ts`
- `packages/api/src/use-cases/agent-ledger/agent-ledger-api.ts`
- `packages/api/src/infrastructure/db/repositories/cashflow-api.repository.ts`
- `packages/api/src/infrastructure/db/sqlite-api-base.ts`
- `packages/cli/src/index.ts`

## Tests And Verification

- `docs/testing.md`
- `packages/api/tests/api.test.ts`
- `docs/modules/api/README.md`
- `docs/modules/db/README.md`

## Runtime Notes

- Renderer code must not open SQLite directly.
- Product writes should go through the Electron main/API boundary or repository
  layer.
- Use Electron-backed commands for `better-sqlite3` tests.
