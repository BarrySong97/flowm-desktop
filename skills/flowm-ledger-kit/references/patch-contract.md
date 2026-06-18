# Agent Ledger Patch Contract

Use Flowm business operations, not table patches. The preferred local entry point
for agents is `pnpm --silent flowm-cli apply-patch`; internally it calls
`applyAgentLedgerPatch` on the `@flowm/api` facade.

## CLI

```bash
pnpm --silent flowm-cli ledger-info
pnpm --silent flowm-cli list-categories
pnpm --silent flowm-cli list-assets
pnpm --silent flowm-cli list-cashflow --source wechat-pay --limit 20
pnpm --silent flowm-cli apply-patch patch.json --dry-run
pnpm --silent flowm-cli apply-patch patch.json --commit
```

Use `--db /path/to/ledger.sqlite3` for temporary ledgers or explicit targets.
Use `-` as the patch path to read JSON from stdin.

## Current Operations

```ts
await api.applyAgentLedgerPatch({
  dryRun: true,
  operations: [
    { op: "category.ensure", name: "交通", categoryKind: "expense" },
    {
      op: "cashflow.create",
      sourceKind: "import",
      sourceName: "wechat-pay",
      sourceExternalId: "wx-001",
      sourceFileHash: "sha256:...",
      eventDate: "2026-06-01",
      amount: "28.50",
      direction: "out",
      flowKind: "expense",
      counterparty: "滴滴出行",
      categoryName: "交通",
      classificationSource: "imported",
    },
    {
      op: "cashflow.classify",
      sourceName: "wechat-pay",
      sourceExternalId: "wx-001",
      categoryName: "交通",
      categoryKind: "expense",
      classificationSource: "rule",
    },
  ],
})
```

## Rules

- Default to dry-run. Commit only with `dryRun: false`.
- When using CLI, `apply-patch` defaults to dry-run and commits only with
  `--commit`.
- Imported cashflow requires both `sourceName` and `sourceExternalId`.
- Reusing the same `sourceName + sourceExternalId` should skip duplicates.
- Same source identity with changed date, amount, direction, flow kind, or
  counterparty is a conflict, not an overwrite.
- Use `cashflow.classify` to update an existing transaction's category. Target
  the row by `id` or by `sourceName + sourceExternalId`; do not recreate the
  transaction just to change its category.
- `category.ensure` is idempotent for active categories of the same kind.
- Commit should be transactional: any rejected or conflicting operation aborts
  the batch.
- Do not add raw SQL, arbitrary table names, or a mutable database handle to the
  public helper contract.

## Result Shape

Expect a summary with:

- `dryRun`
- `created`
- `updated`
- `skipped`
- `conflicts`
- `warnings`
- per-operation `action`, `message`, and optional `targetId`

Use the result as the user-facing review summary before committing live data.
