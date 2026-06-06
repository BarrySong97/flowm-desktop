export const MIGRATION_STATEMENTS = [
  `PRAGMA foreign_keys = ON`,
  `CREATE TABLE IF NOT EXISTS import_batches (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    source_name text NOT NULL,
    imported_at text NOT NULL,
    file_name text,
    file_hash text,
    status text DEFAULT 'imported' NOT NULL,
    meta text
  )`,
  `CREATE INDEX IF NOT EXISTS idx_import_batches_source ON import_batches (source_name)`,
  `CREATE INDEX IF NOT EXISTS idx_import_batches_status ON import_batches (status)`,
  `CREATE TABLE IF NOT EXISTS imported_entries (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    batch_id integer NOT NULL REFERENCES import_batches(id) ON DELETE CASCADE,
    external_id text,
    merchant_order_id text,
    occurred_at text,
    date text NOT NULL,
    payee text,
    counterparty_account text,
    narration text,
    amount_number text NOT NULL,
    currency text NOT NULL,
    account_name text NOT NULL,
    source_sub_account_label text,
    payment_method text,
    direction text,
    classification text,
    confidence integer,
    hash text NOT NULL,
    status text DEFAULT 'pending' NOT NULL,
    generated_event_id integer,
    raw text,
    meta text
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS imported_entries_batch_hash_unique ON imported_entries (batch_id, hash)`,
  `CREATE INDEX IF NOT EXISTS idx_imported_entries_batch ON imported_entries (batch_id)`,
  `CREATE INDEX IF NOT EXISTS idx_imported_entries_date ON imported_entries (date)`,
  `CREATE INDEX IF NOT EXISTS idx_imported_entries_status ON imported_entries (status)`,
  `CREATE TABLE IF NOT EXISTS asset_snapshots (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    account_name text NOT NULL,
    asset_type text NOT NULL,
    snapshot_at text NOT NULL,
    quantity_number text,
    quantity_currency text,
    value_number text NOT NULL,
    value_currency text NOT NULL,
    source text DEFAULT 'manual' NOT NULL,
    note text,
    meta text
  )`,
  `CREATE INDEX IF NOT EXISTS idx_asset_snapshots_account ON asset_snapshots (account_name)`,
  `CREATE INDEX IF NOT EXISTS idx_asset_snapshots_type ON asset_snapshots (asset_type)`,
  `CREATE INDEX IF NOT EXISTS idx_asset_snapshots_snapshot_at ON asset_snapshots (snapshot_at)`,
  `CREATE INDEX IF NOT EXISTS idx_asset_snapshots_source ON asset_snapshots (source)`,
  `CREATE TABLE IF NOT EXISTS currency_settings (
    id text PRIMARY KEY NOT NULL,
    display_currency text DEFAULT 'CNY' NOT NULL,
    fx_provider text DEFAULT 'frankfurter' NOT NULL,
    fx_request_policy text DEFAULT 'on_demand_foreign_currency_only' NOT NULL,
    updated_at text NOT NULL,
    meta text
  )`,
  `CREATE TABLE IF NOT EXISTS exchange_rates (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    from_currency text NOT NULL,
    to_currency text NOT NULL,
    rate_date text NOT NULL,
    rate text NOT NULL,
    provider text NOT NULL,
    fetched_at text NOT NULL,
    source_date text,
    meta text
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS exchange_rates_pair_date_provider_unique ON exchange_rates (from_currency, to_currency, rate_date, provider)`,
  `CREATE INDEX IF NOT EXISTS idx_exchange_rates_pair_date ON exchange_rates (from_currency, to_currency, rate_date)`,
  `CREATE INDEX IF NOT EXISTS idx_exchange_rates_provider ON exchange_rates (provider)`,
  `CREATE TABLE IF NOT EXISTS dashboard_views (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    position integer NOT NULL,
    is_default integer DEFAULT 0 NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    meta text
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS dashboard_views_slug_unique ON dashboard_views (slug)`,
  `CREATE INDEX IF NOT EXISTS idx_dashboard_views_position ON dashboard_views (position)`,
  `CREATE TABLE IF NOT EXISTS dashboard_cards (
    id text PRIMARY KEY NOT NULL,
    view_id text DEFAULT 'overview' NOT NULL REFERENCES dashboard_views(id) ON DELETE CASCADE,
    type text NOT NULL,
    title text,
    code text,
    config_json text DEFAULT '{}' NOT NULL,
    position integer DEFAULT 0 NOT NULL,
    hidden integer DEFAULT 0 NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dashboard_cards_view ON dashboard_cards (view_id)`,
  `CREATE INDEX IF NOT EXISTS idx_dashboard_cards_position ON dashboard_cards (position)`,
  `CREATE TABLE IF NOT EXISTS dashboard_layouts (
    card_id text NOT NULL,
    breakpoint text NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    w integer NOT NULL,
    h integer NOT NULL,
    PRIMARY KEY(card_id, breakpoint),
    FOREIGN KEY (card_id) REFERENCES dashboard_cards(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_breakpoint ON dashboard_layouts (breakpoint)`,
  `CREATE TABLE IF NOT EXISTS categories (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    name text NOT NULL,
    parent_id integer REFERENCES categories(id) ON DELETE SET NULL,
    kind text NOT NULL,
    color text,
    icon text,
    sort_order integer DEFAULT 0 NOT NULL,
    archived integer DEFAULT 0 NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_id)`,
  `CREATE INDEX IF NOT EXISTS idx_categories_kind ON categories (kind)`,
  `CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories (sort_order)`,
  `CREATE TABLE IF NOT EXISTS classification_rules (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    condition_json text NOT NULL,
    flow_kind text,
    category_id integer,
    explanation_tags text,
    source text DEFAULT 'system_rule' NOT NULL,
    enabled integer DEFAULT 1 NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_classification_rules_priority ON classification_rules (priority)`,
  `CREATE INDEX IF NOT EXISTS idx_classification_rules_source ON classification_rules (source)`,
  `CREATE INDEX IF NOT EXISTS idx_classification_rules_enabled ON classification_rules (enabled)`,
  `CREATE TABLE IF NOT EXISTS financial_events (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    source text,
    source_entry_id integer,
    occurred_at text,
    date text NOT NULL,
    counterparty text,
    description text,
    account_hint text,
    flow_kind text DEFAULT 'ambiguous' NOT NULL,
    category_id integer,
    amount text NOT NULL,
    currency text DEFAULT 'CNY' NOT NULL,
    direction text,
    confidence integer,
    classification_source text DEFAULT 'fallback' NOT NULL,
    classification_reason text,
    explanation_tags text,
    raw_meta text,
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_date ON financial_events (date)`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_flow_kind ON financial_events (flow_kind)`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_category ON financial_events (category_id)`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_source ON financial_events (source)`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_source_entry ON financial_events (source_entry_id)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS financial_events_source_entry_unique ON financial_events (source_entry_id) WHERE source_entry_id IS NOT NULL`,
  `CREATE INDEX IF NOT EXISTS idx_financial_events_classification_source ON financial_events (classification_source)`,
  `CREATE TABLE IF NOT EXISTS plans (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    plan_type text NOT NULL,
    name text NOT NULL,
    counterparty text,
    amount text NOT NULL,
    currency text DEFAULT 'CNY' NOT NULL,
    schedule_rule text NOT NULL,
    start_date text NOT NULL,
    end_date text,
    next_due_date text,
    status text DEFAULT 'active' NOT NULL,
    category_id integer,
    flow_kind text,
    account_hint text,
    meta text,
    created_at text NOT NULL,
    updated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plans_type ON plans (plan_type)`,
  `CREATE INDEX IF NOT EXISTS idx_plans_status ON plans (status)`,
  `CREATE INDEX IF NOT EXISTS idx_plans_next_due ON plans (next_due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_plans_category ON plans (category_id)`,
  `CREATE TABLE IF NOT EXISTS plan_occurrences (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    plan_id integer NOT NULL,
    due_date text NOT NULL,
    amount text NOT NULL,
    currency text DEFAULT 'CNY' NOT NULL,
    flow_kind text,
    category_id integer,
    status text DEFAULT 'forecast' NOT NULL,
    generated_at text NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_plan_occurrences_plan ON plan_occurrences (plan_id)`,
  `CREATE INDEX IF NOT EXISTS idx_plan_occurrences_due_date ON plan_occurrences (due_date)`,
  `CREATE INDEX IF NOT EXISTS idx_plan_occurrences_status ON plan_occurrences (status)`,
  `CREATE TABLE IF NOT EXISTS budgets (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    name text NOT NULL,
    period_kind text DEFAULT 'monthly' NOT NULL,
    period_start text,
    period_end text,
    amount text NOT NULL,
    currency text DEFAULT 'CNY' NOT NULL,
    include_flow_kinds text,
    rollover_policy text DEFAULT 'none' NOT NULL,
    alert_thresholds text,
    status text DEFAULT 'active' NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    meta text
  )`,
  `CREATE INDEX IF NOT EXISTS idx_budgets_period_kind ON budgets (period_kind)`,
  `CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets (status)`,
  `CREATE TABLE IF NOT EXISTS budget_scopes (
    id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    budget_id integer NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
    scope_kind text NOT NULL,
    scope_value text
  )`,
  `CREATE INDEX IF NOT EXISTS idx_budget_scopes_budget ON budget_scopes (budget_id)`,
  `CREATE INDEX IF NOT EXISTS idx_budget_scopes_kind ON budget_scopes (scope_kind)`,
  `DROP VIEW IF EXISTS financial_events_display`,
  `CREATE VIEW financial_events_display AS
    SELECT
      fe.id,
      fe.source,
      fe.source_entry_id,
      fe.occurred_at,
      fe.date,
      fe.counterparty,
      fe.description,
      fe.account_hint,
      fe.flow_kind,
      fe.category_id,
      c.name AS category_name,
      fe.direction,
      fe.confidence,
      fe.classification_source,
      fe.created_at,
      fe.updated_at,
      fe.amount AS amount_original,
      fe.currency AS currency_original,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN ROUND(CAST(fe.amount AS REAL), 6)
        WHEN upper(fe.currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN ROUND(CAST(fe.amount AS REAL) * CAST(xr.rate AS REAL), 6)
        ELSE NULL
      END AS amount_display,
      (SELECT display_currency FROM currency_settings WHERE id = 'default') AS currency_display,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN '1'
        ELSE xr.rate
      END AS fx_rate,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN fe.date
        ELSE xr.rate_date
      END AS fx_rate_date,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN fe.date
        ELSE xr.source_date
      END AS fx_source_date,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'local'
        ELSE xr.provider
      END AS fx_provider,
      CASE
        WHEN upper(fe.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'same_currency'
        WHEN upper(fe.currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN 'converted'
        WHEN upper(fe.currency) GLOB '[A-Z][A-Z][A-Z]' THEN 'missing_rate'
        ELSE 'unsupported'
      END AS fx_status
    FROM financial_events fe
    LEFT JOIN categories c ON c.id = fe.category_id
    LEFT JOIN exchange_rates xr ON
      xr.from_currency = upper(fe.currency)
      AND xr.to_currency = (SELECT display_currency FROM currency_settings WHERE id = 'default')
      AND xr.rate_date = fe.date
      AND xr.provider = (SELECT fx_provider FROM currency_settings WHERE id = 'default')`,
  `DROP VIEW IF EXISTS asset_snapshots_display`,
  `CREATE VIEW asset_snapshots_display AS
    SELECT
      s.id,
      s.account_name,
      s.asset_type,
      s.snapshot_at,
      s.quantity_number,
      s.quantity_currency,
      s.source,
      s.note,
      s.meta,
      s.value_number AS value_original,
      s.value_currency AS currency_original,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN ROUND(CAST(s.value_number AS REAL), 6)
        WHEN upper(s.value_currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN ROUND(CAST(s.value_number AS REAL) * CAST(xr.rate AS REAL), 6)
        ELSE NULL
      END AS value_display,
      (SELECT display_currency FROM currency_settings WHERE id = 'default') AS currency_display,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN '1'
        ELSE xr.rate
      END AS fx_rate,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN date(s.snapshot_at)
        ELSE xr.rate_date
      END AS fx_rate_date,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN date(s.snapshot_at)
        ELSE xr.source_date
      END AS fx_source_date,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'local'
        ELSE xr.provider
      END AS fx_provider,
      CASE
        WHEN upper(s.value_currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'same_currency'
        WHEN upper(s.value_currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN 'converted'
        WHEN upper(s.value_currency) GLOB '[A-Z][A-Z][A-Z]' THEN 'missing_rate'
        ELSE 'unsupported'
      END AS fx_status
    FROM asset_snapshots s
    LEFT JOIN exchange_rates xr ON
      xr.from_currency = upper(s.value_currency)
      AND xr.to_currency = (SELECT display_currency FROM currency_settings WHERE id = 'default')
      AND xr.rate_date = date(s.snapshot_at)
      AND xr.provider = (SELECT fx_provider FROM currency_settings WHERE id = 'default')`,
  `DROP VIEW IF EXISTS latest_assets_display`,
  `CREATE VIEW latest_assets_display AS
    SELECT s.*
    FROM asset_snapshots_display s
    WHERE s.id = (
      SELECT s2.id
      FROM asset_snapshots_display s2
      WHERE s2.account_name = s.account_name
      ORDER BY s2.snapshot_at DESC, s2.id DESC
      LIMIT 1
    )`,
  `DROP VIEW IF EXISTS plans_display`,
  `CREATE VIEW plans_display AS
    SELECT
      p.id,
      p.plan_type,
      p.name,
      p.counterparty,
      p.schedule_rule,
      p.start_date,
      p.end_date,
      p.next_due_date,
      p.status,
      p.category_id,
      p.flow_kind,
      p.account_hint,
      p.meta,
      p.created_at,
      p.updated_at,
      p.amount AS amount_original,
      p.currency AS currency_original,
      CASE
        WHEN p.schedule_rule LIKE '%FREQ=WEEKLY%' THEN ROUND(CAST(p.amount AS REAL) * 52.0 / 12.0, 6)
        WHEN p.schedule_rule LIKE '%FREQ=YEARLY%' THEN ROUND(CAST(p.amount AS REAL) / 12.0, 6)
        ELSE ROUND(CAST(p.amount AS REAL), 6)
      END AS monthly_amount_original,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN ROUND(CAST(p.amount AS REAL), 6)
        WHEN upper(p.currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN ROUND(CAST(p.amount AS REAL) * CAST(xr.rate AS REAL), 6)
        ELSE NULL
      END AS amount_display,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN
          CASE
            WHEN p.schedule_rule LIKE '%FREQ=WEEKLY%' THEN ROUND(CAST(p.amount AS REAL) * 52.0 / 12.0, 6)
            WHEN p.schedule_rule LIKE '%FREQ=YEARLY%' THEN ROUND(CAST(p.amount AS REAL) / 12.0, 6)
            ELSE ROUND(CAST(p.amount AS REAL), 6)
          END
        WHEN upper(p.currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN
          CASE
            WHEN p.schedule_rule LIKE '%FREQ=WEEKLY%' THEN ROUND(CAST(p.amount AS REAL) * 52.0 / 12.0 * CAST(xr.rate AS REAL), 6)
            WHEN p.schedule_rule LIKE '%FREQ=YEARLY%' THEN ROUND(CAST(p.amount AS REAL) / 12.0 * CAST(xr.rate AS REAL), 6)
            ELSE ROUND(CAST(p.amount AS REAL) * CAST(xr.rate AS REAL), 6)
          END
        ELSE NULL
      END AS monthly_amount_display,
      (SELECT display_currency FROM currency_settings WHERE id = 'default') AS currency_display,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN '1'
        ELSE xr.rate
      END AS fx_rate,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN date('now')
        ELSE xr.rate_date
      END AS fx_rate_date,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN date('now')
        ELSE xr.source_date
      END AS fx_source_date,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'local'
        ELSE xr.provider
      END AS fx_provider,
      CASE
        WHEN upper(p.currency) = (SELECT display_currency FROM currency_settings WHERE id = 'default') THEN 'same_currency'
        WHEN upper(p.currency) GLOB '[A-Z][A-Z][A-Z]' AND xr.rate IS NOT NULL THEN 'converted'
        WHEN upper(p.currency) GLOB '[A-Z][A-Z][A-Z]' THEN 'missing_rate'
        ELSE 'unsupported'
      END AS fx_status
    FROM plans p
    LEFT JOIN exchange_rates xr ON
      xr.from_currency = upper(p.currency)
      AND xr.to_currency = (SELECT display_currency FROM currency_settings WHERE id = 'default')
      AND xr.rate_date = date('now')
      AND xr.provider = (SELECT fx_provider FROM currency_settings WHERE id = 'default')`,
] as const
