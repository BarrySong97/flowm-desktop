# Multi-Currency & FX Display - Implementation Plan

- Date: 2026-06-19
- Related spec: none (designed in conversation)

## Scope & Decisions

Locked decisions from design discussion:

1. **Convert stock + obligations only.** Convert asset/liability balances (net worth) and
   subscription/loan aggregations to the base currency. Do **not** convert past cashflow,
   imports, analysis, or budgets (flow conversion is out of scope).
2. **No FX gain/loss.** No separate accounting of value change caused purely by rate moves.
3. **Current-rate-only model.** Everything that converts uses the _latest_ rate for each
   `(currency → base)` pair. We do not need per-date historical rates for the converting paths.
4. **Daily refresh.** Refresh current rates once per day, triggered on app launch when the
   last fetch is older than 24h. Frankfurter stays the provider.
5. **Display rule.**
   - Single item (one asset / one subscription / one loan) → shown in its **original
     currency** symbol (what the user entered). Optionally show a muted `≈ <base>` equivalent.
   - Aggregated total (net worth, totals, future pressure) → shown in the **base currency**
     symbol, after conversion.
6. **Currency input** is an autocomplete combobox (built on `@flowm/ui` `command`/cmdk),
   reused across subscription / loan / asset forms and the settings base-currency control.
   It offers a **curated common-currency set (~15)**, not the full ISO 4217 list.
7. **Base currency is editable** in Settings (currently read-only). Storage is non-destructive
   (originals always kept), so changing base just re-converts on read + refetches rates.

Out of scope (kept as naive native-currency sums; document as known limitation): cashflow
summary/breakdown/trend (`cashflow-api.repository.ts`), `AnalysisPage`, `ImportsPage`,
budgets (`budgets-api.repository.ts`, `BudgetPage`, the budget tiles in `OverviewPage`).

## Approach

Storage is already there: `currency` columns on all money tables, plus `currency_settings`
and `exchange_rates`. The work is (a) populate currency at input, (b) maintain one current
rate per pair, (c) convert at the in-scope aggregation/display points, (d) show the right
symbol. Because the model is "current rate only", the renderer only needs a small
`{ CUR: rateToBase }` map; every existing `reduce((s,x)=>s+x.amt)` becomes
`s + toDisplay(x.amt, x.cur)`. Backend SQL sums that mix currencies (`getFutureFixedPressure`)
must group by currency, then convert per group.

## Files And Modules

Shared / registry

- `packages/shared/src/utils/currency.ts` (new) - curated common-currency list (~15)
  `{ code, name, symbol }`, `currencySymbol(code)`, `formatMoney(amount, code, opts)`.
  Set: CNY, USD, EUR, HKD, JPY, GBP, AUD, CAD, CHF, SGD, KRW, TWD, THB, MYR, MOP.
  Disambiguate `¥` (CN¥ / JP¥). Unknown stored codes still render via raw code fallback.
- `packages/shared/src/index.ts` - export the registry.

UI

- `apps/desktop/src/renderer/src/components/ui/CurrencySelect.tsx` (new) - autocomplete combobox
  over the registry. **Implemented here (renderer), not `@flowm/ui`**: the finance forms use
  HeroUI + the renderer's `components/ui` design tokens, whereas `@flowm/ui`'s `command` atom is
  terminal-styled. Built on HeroUI `ComboBox` (type-to-filter), matching `FormField`/`ColorPickerField`.

API (`packages/api/src`)

- `index.ts` - add `getCurrentRates(): Promise<Result<CurrentRates>>` to the `FlowmApi`
  interface + `CurrentRates` type (`{ base: string; rates: Record<string,string> }`).
  (`updateCurrencySettings` / `refreshExchangeRates` already exist.)
- `infrastructure/db/sqlite-api-base.ts:346` - `convertAmount`: change cache lookup from
  exact `rateDate` to _latest_ rate for the pair (most recent `rateDate`/`fetchedAt`); add
  `getLatestRate` helper.
- `infrastructure/db/repositories/reference-api.repository.ts:105` - implement
  `refreshExchangeRates()`: collect distinct currencies in use across assets/subscriptions/
  loans, fetch today's rate vs base for each missing/stale pair, upsert into `exchange_rates`.
  Add `getCurrentRates()`.
- `infrastructure/db/repositories/loans-api.repository.ts:251` - `getFutureFixedPressure`:
  group occurrences by currency, sum per currency, convert each to display currency, then add.
  Return `currency: displayCurrency` (not hardcoded `DEFAULT_CURRENCY`).
- `infrastructure/db/repositories/assets-api.repository.ts:205` &
  `use-cases/dashboard/dashboard-api.ts:81` - keep conversion, switch rate source to latest.

Main process

- `apps/desktop/src/main/ledgers.ts` / `index.ts` - on ledger open / app launch, call
  `refreshExchangeRates` when stale (>24h since last `fetched_at`).
- `apps/desktop/src/main/trpc/router.ts:48` (`reference` group) - add `currentRates` query,
  `updateCurrencySettings` mutation, `refreshExchangeRates` mutation.

Renderer (`apps/desktop/src/renderer/src`)

- `lib/useCurrentRates.ts` (new) - hook over `reference.currentRates` + display currency,
  exposing `toDisplay(amount, currency)` and `displaySymbol`.
- Forms (add/upgrade currency picker):
  - `subscriptions/SubscriptionsPage.tsx:302` (replace hardcoded `currency:"CNY"`) +
    `subscriptions/SubscriptionDetailPage.tsx` (edit).
  - `loans/LoansPage.tsx:268` (add `currency` to mutate) + `loans/LoanDetailPage.tsx` (edit).
  - `assets/AddAssetModal.tsx:169` (upgrade text `valueCurrency` to picker) +
    `assets/AssetDetailPanel.tsx`.
- Aggregation fixes (apply `toDisplay`):
  - `assets/AssetsPage.tsx:275-313` (totals / liabilities / liquid / group treemap / drilldown).
  - `dashboard/OverviewPage.tsx:200-206` (net-worth trend), `:305` (liquid), `:334` (upcoming).
  - `subscriptions/SubscriptionsPage.tsx:284-290` (month / monthly / yearly totals).
  - `loans/LoansPage.tsx:260-261` (total liability / monthly).
- Display symbols: single items use original-currency symbol; totals use dynamic base symbol;
  optional `≈ <base>` secondary line on foreign single items. Replace hardcoded `¥`
  (`SubscriptionsPage.tsx:355/477/610`, `OverviewPage`, `LoansPage`).
- `settings/SettingsPage.tsx:89` - editable base currency via `CurrencySelect` +
  `updateCurrencySettings`; add "refresh rates" action + last-updated indicator.

No DB schema/migration change required.

## Tasks

1. [x] Currency registry in `@flowm/shared` (common-currency list + `currencySymbol` + `formatMoney`).
2. [x] `CurrencySelect` autocomplete (renderer `components/ui`, HeroUI `ComboBox` — see Files note).
3. [x] API: `getCurrentRates`; implement `refreshExchangeRates`; `convertAmount` → latest rate.
4. [x] API: `getFutureFixedPressure` group-by-currency then convert.
5. [x] tRPC: wire `reference.currentRates`, `updateCurrencySettings`, `refreshExchangeRates`.
6. [x] Main: background FX refresh on ledger open (self-skips pairs already refreshed today).
7. [x] Renderer: `useCurrentRates` + `toDisplay` helper.
8. [x] Currency picker in subscription / loan / asset create + edit forms.
9. [x] Apply `toDisplay` at the in-scope aggregation points (assets, subscriptions, loans, overview).
10. [x] Display symbols: original on single items, dynamic base on totals.
11. [x] Settings: editable base currency + manual refresh + last-updated.
12. [x] Verification: types, lint, architecture, docs, 33 tests, build all green.

Deferred / not done (per scope decision): the `≈ <base>` secondary line on foreign single
items (item shows original currency only); flow-side conversion (cashflow, imports, budgets).

## Risks

- **Non-fiat (BTC, etc.).** Frankfurter is fiat-only; such currencies get no rate and land in
  `missingFx`. Surface them as "no rate" rather than silently zeroing; manual rate entry is a
  future add-on.
- **Base currency change** needs rates for `new base → every held currency`; refresh must
  refetch when base changes. Non-destructive (originals stored), so safe but can briefly show
  `missingFx` until the refresh completes.
- **Net-worth trend semantics.** Latest-rate conversion makes the historical trend FX-neutral
  (reflects balance moves only). Acceptable under the no-FX-gain/loss decision; note in UI doc.
- **Out-of-scope sums stay wrong for foreign cashflow.** If a user enters foreign-currency
  cashflow/budgets, those totals mix currencies. Documented limitation, not fixed here.
- **Offline / fetch failure.** `toDisplay` must degrade gracefully (show original or a "rate
  unavailable" marker), never silently produce 0.
- **`¥` ambiguity** (CNY vs JPY) handled by the registry's disambiguated symbols.

## Verification

- `pnpm check-types`, `pnpm test`, `pnpm build`.
- Manual flows:
  - Create a USD subscription → list shows `$9.99`; subscription monthly/yearly totals show the
    base symbol with the converted amount.
  - Add a USD asset → net worth includes it converted; AssetsPage totals/groups converted.
  - Future pressure tile combines a CNY + USD obligation into one base-currency number.
  - Change base currency in Settings → all totals re-convert; "refresh rates" updates the map.
  - Go offline → conversions degrade gracefully, no silent zeros.
- `pnpm check-docs` (or `node scripts/check-docs.mjs`).
