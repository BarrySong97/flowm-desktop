# Less Is More Product Scope Design

## Context

Flowm has a strong first principle: users do not need a complete accounting
system; they need enough truthful signals to know where they stand. The product
has since accumulated useful but heavy surfaces: imports, analysis, budgets,
subscriptions, loans, multiple ledgers, CLI workflows, demo data, web, and a
mobile shell. This design recenters the product around the smallest durable
promise while preserving Flowm's current quiet, instrument-like design style.

## Core Promise

Flowm should answer three questions:

1. How much money do I roughly have now?
2. How much have I spent recently, and am I overspending?
3. How much fixed pressure is already committed in the future?

Everything else is either supporting infrastructure, an import action, or a
future experiment. The app should not present itself as a complete finance
suite, a double-entry ledger, an investment tracker, or a full automation
platform.

## Product Shape

Keep five user-facing areas:

- `Overview` answers the whole product in one screen: current money, current
  month spending, budget remaining or overrun, and fixed monthly pressure.
- `Money` owns present asset snapshots: accounts, balances, net worth, and the
  act of updating a balance.
- `Spending` owns past cashflow: daily spend, recent transactions, average daily
  spend, monthly total, and import entry points.
- `Budget` owns the overspending question: one current overall budget plus
  optional category budgets.
- `Fixed` combines subscriptions and loans into one future-pressure page.
- `Settings` stays utilitarian: currency, privacy, data, update/about, and
  advanced maintenance.

The navigation should express user questions rather than implementation
modules. Users should not need to understand that subscriptions and loans are
different tables, or that imports are a separate subsystem.

## What To Remove Or Demote

Remove `Analysis` as a standalone page. Its useful parts move into `Spending`:
daily spend, averages, cumulative monthly spend, and remaining pace.

Demote `Imports` from a primary page to an action inside `Spending`. Import is
how data enters the app; it is not a destination most users should revisit.
Imported cashflow review can remain as a secondary view reached from Spending.

Merge `Subscriptions` and `Loans` into `Fixed`. The user's question is "what is
already committed every month?" not "which data model produced the payment?"

Remove any user-facing custom dashboard/card system from the core product. The
overview should be opinionated and fixed. Four numbers are enough.

Keep object links, source metadata, CLI patch workflows, demo ledgers, and local
refresh sockets as internal support where they help agents or data quality, but
do not surface them as product concepts.

Keep multi-currency only where it protects correctness. Avoid turning it into a
workflow. Single rows show their native currency; aggregate totals use the base
currency.

Keep hide-amounts because it directly supports demos and privacy without adding
financial complexity.

## Budget Scope

Budget should stay simple:

- One active current-period overall spending budget.
- Optional category budgets.
- Budget progress comes only from past active expense cashflow.
- Empty category selection means overall expense budget.
- No visible tag, source, custom, rollover, envelope, forecast, or automation
  workflows in the main product.

The CLI and database may retain more general scope support, but the product UI
should expose only the concepts a normal user can explain in one sentence.

## Spending Scope

Spending should answer:

- How much did I spend today?
- How much have I spent this month?
- What is my daily average?
- Am I on pace to exceed the budget?
- Which recent transactions explain the number?

The default chart should be recent daily spend, not a broad analytics suite.
Long-range cashflow trends can remain secondary or be removed from primary
navigation.

## Fixed Pressure Scope

Fixed should combine subscriptions and loans into a single monthly-pressure
surface:

- next payments
- monthly committed total
- annualized committed total when useful
- active plans

It should avoid implying these are actual cashflow events until explicitly
materialized by a user workflow. Forecasts remain forecasts.

## Design Style To Preserve

The product should keep its existing design philosophy:

- quiet, precise, instrument-like
- numbers first, interface second
- dense but calm layouts
- restrained color used for state, not decoration
- monospace and aligned money values
- no marketing-style hero treatment inside the app
- no decorative gradients, oversized cards, or visual noise

Less is more does not mean making the app feel empty. It means every visible
element has a job. If a chart, label, filter, or button does not help answer one
of the three core questions, it should be removed, hidden under an advanced
path, or postponed.

## Information Hierarchy

Overview should show only:

- Net worth or total money now.
- Month spending.
- Budget remaining or overrun.
- Fixed monthly pressure.

Money should show only:

- account list
- latest balances
- net worth trend
- update balance action

Spending should show only:

- daily spending bars
- monthly total
- daily average
- recent transactions
- import action

Budget should show only:

- overall monthly budget status
- category budget rows
- create/edit budget action

Fixed should show only:

- subscriptions and loans together
- next due items
- monthly pressure total
- add/edit fixed item actions

## Non-Goals

This scope does not define a redesign implementation plan. It also does not
remove backend schema, migrations, CLI support, or agent workflows immediately.
Those may remain while the product surface becomes smaller.

This scope does not add bank sync, investment performance tracking, double-entry
bookkeeping, financial advice, or automatic reconciliation.

## Success Criteria

Flowm is simpler when:

- a new user can explain the app as "it tells me what I have, what I spent, and
  what I am committed to pay"
- the primary navigation has no separate Analysis, Imports, Subscriptions, or
  Loans destinations
- the overview contains four stable numbers and no configurable card system
- budget UI exposes only overall and category budgets
- spending analytics fit on the Spending page without becoming a separate
  reporting product
- the app still feels like Flowm: calm, precise, data-backed, and sparse without
  feeling unfinished

## Open Implementation Questions

These should be answered in a later implementation plan:

- Whether `Money` should keep the existing `Assets` route internally or be
  renamed at the route level.
- Whether `Fixed` should support editing both subscriptions and loans in one
  combined form, or keep separate create flows behind one page.
- Whether the current `Imports` route should be removed or kept as a hidden
  secondary route for review.
- Which existing demo ledger screens need updated copy after navigation
  consolidation.
