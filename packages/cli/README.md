# Flowm CLI

Safe local command line interface for inspecting and updating Flowm ledgers.

```bash
npx @barrysongdev4real/flowm-cli ledger-info
npx @barrysongdev4real/flowm-cli list-cashflow --limit 20
npx @barrysongdev4real/flowm-cli apply-patch patch.json --dry-run
```

Writes are guarded and require `--commit`. By default, commands resolve the
active Flowm desktop ledger. Use `--db <path>` or `FLOWM_DB_PATH` to target a
specific SQLite ledger.
