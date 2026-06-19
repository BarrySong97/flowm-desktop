# Flowm Data Model Redesign

Date: 2026-06-12

## Purpose

Flowm Desktop needs a clean-slate data and business model that matches the
product principle already documented in `docs/product-design-brief.md` and
`AGENTS.md`: Flowm is not a strict ledger. It does not reconcile every account,
transaction, balance, subscription, loan, and budget into one balanced book.

The new foundation should model independent personal finance facts:

- Past cashflow: what happened.
- Present assets: what the user currently believes they own or owe.
- Future subscriptions: what will probably be charged.
- Future loans: what will probably be repaid.
- Budgets: what the user plans or intends.
- Taxonomy: how the user wants to view and group data.
- Links: optional explanations that say two records may be related.

The renderer UI is out of scope for this design. This design is for the bottom
layer: schema, domain logic, calculations, API boundaries, and non-UI
verification.

## Non-Goals

- No compatibility with the current schema is required.
- No migration of existing local data is required.
- No reuse of ledger-style `transactions`, `postings`, ledger accounts, or
  transaction tags as the new business source of truth.
- No double-entry balancing.
- No automatic reconciliation between cashflow, assets, subscriptions, loans,
  and budgets.
- No UI-based validation of financial numbers.
- No investment portfolio engine, market data sync, lot tracking, cost-basis
  accounting, dividend accounting, or automatic depreciation.

## Core Architecture

The new model is a set of independent domains:

```text
Cashflow       past cashflow records
Assets         current asset and liability snapshots
Subscriptions future recurring subscription charges
Loans          future loan repayment pressure
Budgets        user-authored budget boundaries
Taxonomy       categories and tags
Links          soft cross-domain relationships
Settings       display currency and exchange rates
```

The governing rule is:

```text
Independent by default.
Related by soft links.
Never reconciled implicitly.
```

Concrete rules:

- Cashflow does not derive asset balances.
- Asset snapshots do not need to match cashflow.
- Subscriptions do not automatically create real cashflow.
- Loans do not automatically create liability assets.
- Budgets are not derived from cashflow.
- Budget progress may reference cashflow, but budget definitions stand alone.
- Categories and tags are viewing dimensions, not ledger accounts.
- `object_links` can explain relationships, but cannot affect core numbers.

## Schema Overview

The clean-slate schema should be centered on these tables:

```text
categories
tags
statement_imports
statement_lines
cashflow_events
cashflow_event_tags
asset_items
asset_snapshots
subscriptions
subscription_occurrences
loans
loan_payment_occurrences
budget_sets
budget_periods
budget_items
budget_item_scopes
object_links
currency_settings
exchange_rates
```

All core tables should use stable text IDs, preferably UUID or ULID. This avoids
coupling product identity to SQLite auto-increment behavior and makes future
sync or import de-duplication easier.

Money fields follow one rule:

```text
Store amounts as positive decimal strings.
Store currency separately.
Use direction, kind, or asset type to decide calculation sign.
```

For example, a CNY 1,850,000 mortgage liability snapshot stores
`value_amount = "1850000.00"` and `asset_type = "liability"`. Net worth
subtracts it because of the type, not because the amount is negative.

## Taxonomy

### `categories`

Categories are the primary analysis dimension. They can be referenced by
cashflow events, subscriptions, budget items, and budget scopes.

```text
id
name
parent_id
category_kind
color
icon
display_order
archived_at
created_at
updated_at
```

Allowed `category_kind` values:

```text
expense
income
transfer
asset_movement
debt
adjustment
neutral
```

Categories should be archived instead of hard-deleted because historical records
may still reference them.

### `tags`

Tags are lightweight secondary labels.

```text
id
name
color
archived_at
created_at
updated_at
```

Tags are primarily attached to cashflow events. Budget scopes may also match
tags. Tags should be archived instead of hard-deleted.

## Past Cashflow

Past cashflow has two layers: imported evidence and product-level cashflow
events.

### `statement_imports`

Represents one imported source file or import operation.

```text
id
source_name
file_name
file_hash
imported_at
status
raw_summary
created_at
```

Example `source_name` values:

```text
alipay
wechat
bank
manual_file
other
```

Allowed `status` values:

```text
imported
reviewed
archived
```

### `statement_lines`

Represents a normalized line from an imported statement. This is evidence, not
the final user-facing cashflow record.

```text
id
import_id
external_id
line_hash
occurred_at
event_date
counterparty
description
amount
currency
direction
payment_method
account_hint
raw_payload
status
created_at
```

Allowed `direction` values:

```text
in
out
neutral
```

Allowed `status` values:

```text
pending
converted
ignored
```

### `cashflow_events`

Represents one user-facing past cashflow fact. The UI may call this a
transaction, flow, or record, but the domain object is not a ledger transaction.

```text
id
statement_line_id
event_date
occurred_at
title
counterparty
description
user_note
amount
currency
direction
flow_kind
category_id
source_kind
source_name
payment_method
account_hint
include_in_analytics
status
classification_source
created_at
updated_at
```

Allowed `direction` values:

```text
in
out
neutral
```

Allowed `flow_kind` values:

```text
income
expense
transfer
asset_movement
debt_payment
refund
adjustment
```

Allowed `source_kind` values:

```text
manual
import
system
```

Allowed `status` values:

```text
active
ignored
deleted
```

Allowed `classification_source` values:

```text
manual
rule
system
imported
```

All cashflow events must be queryable. Transfer, asset movement, debt payment,
refund, adjustment, and ignored records are not hidden data. They may be
excluded from default everyday-spend metrics, but they must remain visible in
lists, filters, detail views, exports, and dedicated analytics.

### `cashflow_event_tags`

```text
cashflow_event_id
tag_id
```

This many-to-many table stores user-facing tags. Classifier explanation tags
should not be reused as user tags.

## Present Assets

The asset model records estimated value history, not investment details.

### `asset_items`

Represents a long-lived asset or liability object.

```text
id
name
asset_type
institution
default_currency
valuation_method
archived_at
display_order
note
created_at
updated_at
```

Allowed `asset_type` values:

```text
cash
bank
wallet
brokerage
fund
stock
crypto
real_estate
vehicle
fixed_asset
liability
other
```

Allowed `valuation_method` values:

```text
manual_balance
manual_market_value
statement_value
estimated_value
```

Flowm intentionally does not model holdings, lots, dividends, investment
transactions, automatic market prices, or depreciation schedules. For stock,
fund, crypto, real estate, and vehicle assets, the user records the total value
they want Flowm to use.

### `asset_snapshots`

Represents an observed or estimated value at a time.

```text
id
asset_item_id
snapshot_at
value_amount
value_currency
quantity_amount
quantity_unit
cost_basis_amount
cost_basis_currency
source_kind
note
created_at
```

Allowed `source_kind` values:

```text
manual
import
system
```

`quantity_amount`, `quantity_unit`, and cost-basis fields are optional. They
support simple context such as shares, fund units, coins, or square meters, but
they do not turn Flowm into an investment accounting system.

Asset growth can be calculated from snapshots, but it should be named as value
or estimate change, not investment return.

## Subscriptions

Subscriptions are their own future-obligation domain. They are not a special
case of ledger-generated transactions.

### `subscriptions`

```text
id
name
merchant
amount
currency
billing_cycle
interval_count
next_charge_date
auto_renew
category_id
status
note
created_at
updated_at
```

Allowed `billing_cycle` values:

```text
weekly
monthly
yearly
custom
```

Allowed `status` values:

```text
active
paused
canceled
```

### `subscription_occurrences`

```text
id
subscription_id
due_date
amount
currency
status
created_at
```

Allowed `status` values:

```text
forecast
skipped
confirmed
```

An occurrence is a prediction or confirmation in the subscription domain. It
does not create a real cashflow event unless the user explicitly asks for that
operation.

## Loans

Loans are their own future-obligation domain. They are useful for future payment
pressure and rough amortization context, but they do not define net worth.

### `loans`

```text
id
name
lender
currency
principal_amount
current_principal_estimate
annual_rate_bps
repayment_method
payment_amount
payment_day
start_date
term_months
status
note
created_at
updated_at
```

Allowed `status` values:

```text
active
paused
closed
```

### `loan_payment_occurrences`

```text
id
loan_id
due_date
payment_amount
principal_amount
interest_amount
fee_amount
remaining_principal_estimate
status
created_at
```

Allowed `status` values:

```text
forecast
paid
skipped
```

Loan records and loan occurrences do not update asset snapshots. A mortgage
liability in net worth must come from an `asset_item` and its latest
`asset_snapshot`, not from `loans.current_principal_estimate`.

## Budgets

Budgets are independent user-authored plans. They are not historical cashflow
summaries. A budget can exist with no matching cashflow.

### `budget_sets`

```text
id
name
status
created_at
updated_at
```

Allowed `status` values:

```text
active
archived
```

### `budget_periods`

```text
id
budget_set_id
period_kind
period_start
period_end
currency
status
```

Allowed `period_kind` values:

```text
monthly
weekly
yearly
custom
```

Allowed `status` values:

```text
active
closed
archived
```

### `budget_items`

```text
id
budget_period_id
name
item_kind
planned_amount
currency
category_id
rollover_policy
status
note
```

Allowed `item_kind` values:

```text
spending_limit
saving_goal
custom
```

Allowed `rollover_policy` values:

```text
none
rollover_unspent
rollover_overspent
```

Allowed `status` values:

```text
active
paused
archived
```

### `budget_item_scopes`

```text
id
budget_item_id
scope_kind
scope_value
```

Allowed `scope_kind` values:

```text
category
category_tree
tag
source
flow_kind
custom
```

Budget reference progress may be calculated from matching cashflow events, but
that calculated number must not mutate the budget definition.

## Object Links

### `object_links`

`object_links` stores optional cross-domain relationships. It is deliberately
soft.

```text
id
from_type
from_id
to_type
to_id
link_type
confidence
created_by
note
created_at
```

Allowed `link_type` values:

```text
evidence_of
likely_matches
confirmed_matches
related_to
```

Allowed `created_by` values:

```text
user
system
```

Examples:

- A cashflow event likely matches an iCloud subscription occurrence.
- A cashflow event likely matches a loan payment occurrence.
- A loan may be related to a mortgage liability asset item.
- A statement line was converted into a cashflow event.

Links explain context. They do not participate in net worth, cashflow,
subscription, loan, or budget calculations.

## Currency Settings

### `currency_settings`

```text
id
display_currency
fx_provider
fx_request_policy
updated_at
meta
```

### `exchange_rates`

```text
id
from_currency
to_currency
rate_date
rate
provider
fetched_at
source_date
meta
```

Asset display conversion should use the relevant snapshot date. Cashflow
display conversion should use the cashflow event date. Missing rates should be
reported explicitly instead of silently substituting today's rate.

## Calculation Rules

Calculation functions must read the relevant domain and must not write other
domains as a side effect.

### Cashflow

Every cashflow kind is queryable. Metrics decide which kinds to include.

Everyday spend:

```text
sum(cashflow_events.amount)
where flow_kind = expense
and direction = out
and include_in_analytics = true
and status = active
and event_date in selected period
```

Income:

```text
sum(cashflow_events.amount)
where flow_kind = income
and direction = in
and include_in_analytics = true
and status = active
and event_date in selected period
```

Net cashflow:

```text
income - everyday_spend
```

Dedicated metrics should exist for:

- transfers
- asset movements
- debt payments
- refunds
- adjustments
- ignored records
- all activity by `flow_kind`

Default everyday-spend metrics should not include transfer, asset movement,
debt payment, refund, adjustment, or ignored records unless a view explicitly
chooses that scope.

### Net Worth

Net worth only uses latest asset snapshots.

```text
latest_snapshot_per_asset =
  latest asset_snapshot for each asset_item by snapshot_at

asset_value =
  sum(value_amount)
  where asset_type != liability

liability_value =
  sum(value_amount)
  where asset_type = liability

net_worth =
  asset_value - liability_value
```

Loans do not define liability value. Cashflow does not update assets.

### Asset Change

Asset change uses historical snapshots of the same `asset_item`.

```text
change_amount =
  latest_snapshot.value_amount - comparison_snapshot.value_amount

change_percent =
  change_amount / comparison_snapshot.value_amount
```

Valid labels:

- asset change
- value change
- estimate change
- change since previous snapshot
- 30-day change
- 90-day change
- 1-year change

Invalid labels unless a future investment-accounting model is added:

- return rate
- investment return
- profit/loss rate
- performance

### Future Fixed Pressure

Future fixed pressure uses subscription and loan occurrences.

```text
subscription_pressure =
  sum(subscription_occurrences.amount)
  where due_date in selected period
  and status in (forecast, confirmed)

loan_pressure =
  sum(loan_payment_occurrences.payment_amount)
  where due_date in selected period
  and status in (forecast, paid)

future_fixed_pressure =
  subscription_pressure + loan_pressure
```

This is forecast pressure, not real historical spending.

### Budgets

Budget total comes from budget definitions.

```text
budget_total =
  sum(budget_items.planned_amount)
  where budget_period_id = selected period
  and status = active
```

Reference usage may be calculated from cashflow:

```text
budget_reference_usage =
  sum(cashflow_events.amount)
  where cashflow_events match budget_item_scopes
  and include_in_analytics = true
  and status = active
  and event_date inside budget_period
```

This is a reference progress number. It is not a reconciliation result and does
not change `planned_amount`.

Recommended wording:

- reference usage
- recorded spend
- currently seen usage

Avoid wording that implies completeness:

- exact actual
- reconciled spend
- true spend

## Forbidden Behaviors

These are hard design violations:

- Creating a subscription occurrence automatically creates a cashflow event.
- Creating a loan automatically creates a liability asset.
- Adding a cashflow event automatically changes an asset snapshot.
- Updating budget reference usage changes budget planned amount.
- Creating or confirming an object link changes any core aggregate.
- Net worth reads loan principal instead of latest liability asset snapshots.
- Asset snapshot growth is named investment return.
- Default everyday-spend metrics include transfer, debt payment, refund, asset
  movement, adjustment, or ignored records without an explicit scope.
- Non-expense cashflow kinds become unqueryable or hidden from the cashflow list.

## Business API Boundary

The renderer should call product-level domain capabilities, not tables.

### Initialization and Settings

```text
initializeFlowm()
getCurrencySettings()
updateCurrencySettings()
listExchangeRates()
refreshExchangeRates()
```

### Cashflow

```text
importStatement(input)
listStatementImports(input)
listStatementLines(input)
convertStatementLinesToCashflowEvents(input)

listCashflowEvents(input)
getCashflowEvent(id)
createCashflowEvent(input)
updateCashflowEvent(input)
ignoreCashflowEvent(id)
deleteCashflowEvent(id)

setCashflowEventCategory(input)
setCashflowEventTags(input)
setCashflowEventAnalyticsIncluded(input)

getCashflowSummary(input)
getCashflowBreakdown(input)
getCashflowTrend(input)
```

`listCashflowEvents` must support date range, flow kind, direction, category,
tag, source, status, analytics inclusion, and keyword filters.

Analytics inputs must make metric scope explicit:

```text
everyday_spend
income
net_cashflow
debt_payments
asset_movements
refunds
all_activity
```

### Assets

```text
listAssetItems(input)
createAssetItem(input)
updateAssetItem(input)
archiveAssetItem(id)

listAssetSnapshots(input)
addAssetSnapshot(input)
updateAssetSnapshot(input)
deleteAssetSnapshot(id)

getNetWorthSnapshot(input)
getAssetTrend(input)
getAssetChange(input)
```

Asset trend fields should use names such as `changeAmount`, `changePercent`,
and `comparisonLabel`, not `returnRate`.

### Subscriptions

```text
listSubscriptions(input)
createSubscription(input)
updateSubscription(input)
archiveSubscription(id)

generateSubscriptionOccurrences(input)
listSubscriptionOccurrences(input)
updateSubscriptionOccurrence(input)
```

Any operation that creates a cashflow event from an occurrence must be explicit
and user-triggered.

### Loans

```text
listLoans(input)
createLoan(input)
updateLoan(input)
archiveLoan(id)

generateLoanPaymentOccurrences(input)
listLoanPaymentOccurrences(input)
updateLoanPaymentOccurrence(input)
getLoanPressureSummary(input)
```

Loan APIs must not update asset snapshots.

### Budgets

```text
listBudgetSets()
createBudgetSet(input)
updateBudgetSet(input)
archiveBudgetSet(id)

listBudgetPeriods(input)
createBudgetPeriod(input)
updateBudgetPeriod(input)

listBudgetItems(input)
createBudgetItem(input)
updateBudgetItem(input)
archiveBudgetItem(id)

getBudgetReferenceProgress(input)
```

The name `getBudgetReferenceProgress` is intentional: the progress number is a
reference derived from available cashflow, not a reconciled actual.

### Taxonomy

```text
listCategories(input)
createCategory(input)
updateCategory(input)
archiveCategory(id)
mergeCategories(input)

listTags(input)
createTag(input)
updateTag(input)
archiveTag(id)
mergeTags(input)
```

### Links

```text
listObjectLinks(input)
createObjectLink(input)
confirmObjectLink(id)
removeObjectLink(id)
```

### Dashboard Snapshot

```text
getOverviewSnapshot()
```

The overview snapshot may assemble:

- cashflow summary
- net worth
- asset changes
- future fixed pressure
- budget reference progress
- recent cashflow events
- upcoming occurrences

Each number should keep source-domain metadata so the renderer does not treat
the snapshot as one reconciled book.

## Verification Strategy

Financial correctness must be verified without UI.

The implementation should ship with these validation layers.

### Schema Shape Tests

Verify required tables exist and old ledger concepts are not part of the new
schema.

Required tables:

```text
cashflow_events
asset_items
asset_snapshots
subscriptions
subscription_occurrences
loans
loan_payment_occurrences
budget_sets
budget_periods
budget_items
budget_item_scopes
categories
tags
object_links
```

Forbidden new-schema source-of-truth tables:

```text
transactions
postings
ledger_accounts
transaction_tags
ledger-style subscriptions
ledger-style loan schedules linked to transactions
```

Also verify:

- Amount fields reject negative values where applicable.
- Liability amounts are positive.
- Archive fields exist for long-lived referenced objects.
- Object links have no calculation triggers.

### Golden Fixture

Create a deterministic fixture, for example `createFlowmGoldenFixture()`, with
fixed dates, currencies, and expected outputs.

Suggested fixture:

Cashflow:

```text
salary income: 30000
food expense: 1200
shopping expense: 800
transfer: 5000
refund: 200
mortgage cashflow/debt payment: 9800
ignored item: 99
```

Assets:

```text
bank card: 50000
fund account previous snapshot: 100000
fund account latest snapshot: 120000
real estate: 3000000
mortgage liability: 1800000
```

Subscriptions:

```text
iCloud: 21 CNY monthly
ChatGPT: 20 USD monthly
```

Loans:

```text
mortgage monthly payment: 9800
principal/interest forecast split
```

Budgets:

```text
food budget: 2000
shopping budget: 1000
one budget item with no matching cashflow
```

Expected results should assert:

- Everyday spend is food plus shopping only.
- Transfers, refunds, debt payments, and ignored records are queryable.
- Net worth is bank card plus fund plus real estate minus mortgage liability.
- Fund asset change is 20000 and 20%, named as value change.
- Future fixed pressure is subscription occurrences plus loan occurrences.
- Budget reference progress only counts matching cashflow events.
- A budget item with no matching cashflow still exists with zero reference
  usage.

### Calculation Function Tests

Test the domain calculations directly:

```text
getCashflowSummary()
getCashflowBreakdown()
getNetWorthSnapshot()
getAssetChange()
getFutureFixedPressure()
getBudgetReferenceProgress()
```

Cover:

- default everyday-spend scope
- explicit all-activity scope
- ignored records excluded by default
- refunds separately queryable
- debt payments separately queryable
- missing exchange rates
- empty budgets
- empty cashflow
- empty assets

### Invariant Tests

These tests prevent accidental regression into a ledger model:

```text
Creating a subscription occurrence does not create a cashflow event.
Creating a loan does not create a liability asset snapshot.
Adding a cashflow event does not change asset snapshots.
Creating an object link does not change any aggregate.
Budget planned amount does not change when cashflow changes.
Net worth only uses latest asset snapshots.
Everyday spend excludes transfer/debt_payment/refund/ignored by default.
Non-expense cashflow kinds remain listable and filterable.
```

### API Facade Tests

After core services and analytics pass, test the product API facade. The API
tests should assert renderer-ready shapes while still avoiding UI.

The required implementation sequence is:

```text
new schema
core domain services
calculation layer
deterministic fixture
golden calculation tests
invariant tests
API facade tests
UI integration
```

UI integration starts only after the non-UI tests prove the numbers.

## Implementation Boundary

The first implementation phase should deliver:

- Clean schema initialization.
- Domain services for all independent domains.
- Calculation services with explicit scopes.
- Golden fixture generation.
- Schema, calculation, invariant, and API tests.
- A new product facade, such as `FlowmApiV2`, that the renderer can later
  consume.

The first implementation phase should not deliver:

- UI rewrites.
- Data migration from the old schema.
- Compatibility adapters for old ledger tables.
- Real investment portfolio tracking.
- Automatic depreciation.
- Automatic reconciliation.

## Acceptance Criteria

The bottom layer is ready for UI integration when:

- The clean schema initializes from an empty database.
- New API code does not call ledger-style `transactions` or `postings`.
- Golden fixture expected results match exactly.
- Invariant tests all pass.
- API facade tests return renderer-ready shapes.
- No test depends on renderer UI.
- Cross-domain links do not affect core aggregates.
- Missing exchange rates are surfaced instead of hidden.
- Asset changes are named as value changes, not returns.

## Open Decisions

These can be decided during implementation without changing the architecture:

- Exact ID format: UUID v4 or ULID.
- Exact decimal library and SQL decimal handling.
- Whether statement line to cashflow conversion is automatic after import or a
  user-triggered batch command.
- Whether budget periods are generated ahead of time or created lazily.
- Whether `object_links` should enforce known `from_type` and `to_type` values
  in application code or database constraints.
