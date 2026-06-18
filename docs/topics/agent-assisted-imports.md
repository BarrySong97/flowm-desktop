# Agent-Assisted Imports

## Purpose

Flowm does not need a built-in parser for every WeChat Pay, Alipay, bank, card,
broker, PDF, Word, spreadsheet, screenshot, or pasted-text format. A local agent
can inspect whatever material the user provides, decide what financial facts it
contains, write or reuse a small extraction script when useful, and persist the
normalized result as Flowm data.

The durable product contract is the ledger model and business rules, not the
source parser. Extraction scripts may change often; the SQLite schema, domain
boundaries, and safe write helpers should remain stable.

## Operating Model

1. The user provides source material, such as WeChat Pay bills, Alipay bills,
   bank CSVs, credit card PDFs, loan contracts, Word summaries, screenshots,
   copied chat text, asset statements, or hand-written notes.
2. The agent reads this document, the relevant module docs, and the database/API
   schema.
3. The agent inspects the source material locally to discover structure,
   financial facts, dates, amounts, counterparties, account hints, source
   identifiers, and confidence.
4. The agent creates or reuses a small extraction or match script when that is
   more reliable than one-off manual mapping.
5. The script writes normalized imported rows directly into `cashflow_events`
   with source metadata and a source-unique record id.
6. The script may explicitly create or update product objects such as categories,
   cashflow events, asset snapshots, budgets, subscriptions, loans, tags, and
   object links.
7. The script records enough raw payload and matching notes for future review,
   but does not log secrets or unnecessary personally identifiable data.

## Agent Boundary

The preferred interface is an agent ledger kit, not a magic built-in parser and
not arbitrary hand-written SQL against the app database. The kit should provide:

- a short document telling agents which product rules, schema files, and module
  docs to read first;
- a helper for opening SQLite with Electron-compatible `better-sqlite3`;
- a helper for applying migrations before writes;
- typed functions that call `@flowm/api` methods for categories, cashflow,
  assets, budgets, subscriptions, loans, and links;
- a dry-run mode that reports what would be created, updated, skipped, or left
  ambiguous;
- a narrow Drizzle-backed escape hatch for operations not yet covered by the API
  facade.

The agent should decide `sourceName`, `sourceRecordId`, target domain objects,
and extraction rules only after inspecting the actual material. An optional
runner command can execute an agent-authored script or apply normalized JSON, but
it should not pretend to infer every unknown source format by itself.

Agents may inspect SQLite for diagnosis, but durable import writes should go
through the helper APIs so validation, idempotency, and domain boundaries stay in
one place.

## Data Boundaries

- `cashflow_events` stores imported and manual past cashflow. Imported records
  should carry `sourceKind: "import"`, a source name, and a source-unique record
  id for deduplication.
- `asset_items` and `asset_snapshots` store present asset or liability state.
  They are not inferred by summing imported cashflow.
- `subscriptions` and `loans` store future obligations and forecasts.
  Detecting a recurring payment can create or update a forecast plan, but the
  plan is not an actual expense by itself.
- `object_links` can connect imported cashflow to explanations, such as a
  subscription, a loan payment plan, or an asset account.

## Agent Write Rules

Agents should use the local helper APIs, which should prefer the `@flowm/api`
facade and Drizzle schema over direct SQL. The agent-authored parser should feed
normalized rows into these helpers instead of mutating app tables itself.

Allowed:

- Insert normalized imported cashflow with a stable source name and source record
  id.
- Create missing categories when there is a clear merchant or semantic pattern.
- Assign categories, tags, source name, account hints, and classification source
  on cashflow events.
- Keep category direction explicit. Income cashflow must use income categories,
  expense cashflow must use expense categories, and the Flowm API rejects
  mismatched patch operations.
- Create asset items or snapshots when the source file contains explicit balance
  or valuation evidence, or when the user asks for a manual snapshot.
- Create budgets from user intent or observed stable spending categories.
- Create subscription or loan plans from recurring patterns, then link the
  supporting statement lines as evidence.
- Extract structured facts from unstructured material, but write only the facts
  that can be mapped to Flowm's product model with an explicit confidence level
  or user instruction.

Not allowed:

- Do not infer present asset balances by summing imported cashflow.
- Do not turn loan plans into net-worth liabilities; liabilities come from
  liability asset snapshots.
- Do not create subscription or loan forecast occurrences as actual cashflow
  unless an explicit workflow says to do so.
- Do not bypass the helper APIs, migrations, or Drizzle/API boundary for durable
  app-data writes.
- Do not delete or rewrite prior import data without an explicit user request and
  a backup strategy.
- Do not log full raw financial files, credential material, phone numbers, or
  identity numbers.
- Do not pretend uncertain text extraction is authoritative. Preserve ambiguity
  in notes or review output instead of making high-impact changes.

## Normalized Cashflow Import Shape

An agent-produced entry should keep these fields when available:

```ts
type AgentCashflowImportEntry = {
  sourceName: string
  fileName?: string
  fileHash: string
  sourceRecordId: string
  occurredAt?: string
  eventDate: string
  title?: string
  counterparty?: string
  description?: string
  amount: string
  currency?: string
  direction: "in" | "out" | "neutral"
  flowKind:
    | "income"
    | "expense"
    | "transfer"
    | "asset_movement"
    | "debt_payment"
    | "refund"
    | "adjustment"
  categoryName?: string
  paymentMethod?: string
  accountHint?: string
  tags?: string[]
}
```

The `sourceRecordId` should be deterministic from the platform order id when
present. If the source has no row id, derive it from source name, date/time,
amount, currency, counterparty, payment method, and file hash. Re-importing the
same file should skip or idempotently update duplicate cashflow.

Not all source material maps to cashflow. A document may instead produce:

- categories, when the user provides a taxonomy or clear merchant rules;
- asset snapshots, when it contains explicit balances or valuations;
- budgets, when it contains planned spending limits or user intent;
- subscriptions, when it contains recurring service commitments;
- loans, when it contains principal, lender, rate, term, or repayment facts;
- object links, when it explains how a cashflow row relates to a subscription,
  loan, asset, or budget.

## Classification Rules

Persist user-specific matching rules as readable scripts or JSON near the import
workflow, not inside durable migrations. A useful rule should explain:

- which source fields it inspects;
- what product object it creates or updates;
- confidence level or reason;
- whether the action is safe to apply automatically or should produce a review
  suggestion.

Examples:

- Merchant contains `滴滴` or `高德打车`: classify as transportation expense.
- Merchant contains `Apple` and amount repeats monthly: suggest a subscription.
- Counterparty contains a mortgage lender and amount repeats monthly: suggest or
  create a loan payment plan link, not a new liability balance.
- File contains an explicit account balance row: create or update an asset
  snapshot with `sourceKind: "import"`.

## Review Workflow

Agent ledger writes should produce a short summary after each run:

- source materials read and hashes where files exist;
- cashflow events created, classified, updated, and skipped;
- categories, tags, budgets, assets, subscriptions, and loans created or updated;
- ambiguous rows left for review;
- rules added or changed for future imports.

When uncertain, the agent should create minimally classified cashflow and leave
review suggestions instead of creating higher-level objects. This keeps future
imports repeatable without pretending the ledger is fully reconciled.

## Success Checks

An implementation is working when these checks pass:

- A new agent can read the Flowm skill, inspect arbitrary user material, and
  produce a Flowm patch without being told the source format in advance.
- The first operation is a dry-run that reports planned writes, skipped rows,
  conflicts, warnings, and ambiguous facts.
- Applying the dry-run plan to a temporary ledger creates only the described
  Flowm business objects.
- Re-applying the same patch is idempotent.
- Conflicting imported cashflow with the same source id is reported as a conflict
  instead of silently overwriting user changes.
- Attempts to infer asset balances from transactions, turn loan plans into
  liabilities, or materialize forecasts as actual cashflow are rejected.
- The helper never asks agents to write raw SQL or mutate tables directly.
