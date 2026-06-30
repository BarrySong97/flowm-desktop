# Flowm CLI

Safe local command line interface for inspecting and updating Flowm ledgers.

```bash
npx @barrysongdev4real/flowm-cli ledger-info
npx @barrysongdev4real/flowm-cli list-cashflow --limit 20
npx @barrysongdev4real/flowm-cli list-budget-periods --status active
npx @barrysongdev4real/flowm-cli budget-progress --budget-period-id <id>
npx @barrysongdev4real/flowm-cli list-linked-cashflow --owner-type loan --owner-id <id>
npx @barrysongdev4real/flowm-cli bind-cashflow --owner-type loan --owner-id <id> --event-id <id> --commit
npx @barrysongdev4real/flowm-cli apply-patch patch.json --dry-run
```

Writes are guarded and require `--commit`. By default, commands resolve the
active Flowm desktop ledger. Use `--db <path>` or `FLOWM_DB_PATH` to target a
specific SQLite ledger.

Budget commands cover sets, periods, items, and progress. Creating, updating,
or archiving budget records is dry-run by default and requires `--commit`.

Cashflow-binding commands link real cashflow events to a subscription or loan as
its deductions: `list-linked-cashflow` reads the bindings, `bind-cashflow`
(repeatable `--event-id`) and `unbind-cashflow <link-id>` manage them and are
dry-run by default. Bindings are explanatory only and never change forecast plans
or statistics.
