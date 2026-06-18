WITH mismatched AS (
  SELECT
    old_categories.id AS source_category_id,
    old_categories.name AS name,
    old_categories.color AS color,
    old_categories.icon AS icon,
    old_categories.display_order AS display_order,
    CASE
      WHEN cashflow_events.flow_kind = 'income' THEN 'income'
      WHEN cashflow_events.flow_kind = 'transfer' THEN 'transfer'
      WHEN cashflow_events.flow_kind = 'asset_movement' THEN 'asset_movement'
      WHEN cashflow_events.flow_kind = 'debt_payment' THEN 'debt'
      WHEN cashflow_events.flow_kind = 'adjustment' THEN 'adjustment'
      ELSE 'expense'
    END AS expected_category_kind
  FROM cashflow_events
  INNER JOIN categories AS old_categories
    ON old_categories.id = cashflow_events.category_id
  WHERE old_categories.category_kind != CASE
    WHEN cashflow_events.flow_kind = 'income' THEN 'income'
    WHEN cashflow_events.flow_kind = 'transfer' THEN 'transfer'
    WHEN cashflow_events.flow_kind = 'asset_movement' THEN 'asset_movement'
    WHEN cashflow_events.flow_kind = 'debt_payment' THEN 'debt'
    WHEN cashflow_events.flow_kind = 'adjustment' THEN 'adjustment'
    ELSE 'expense'
  END
),
to_create AS (
  SELECT
    name,
    expected_category_kind,
    min(source_category_id) AS source_category_id
  FROM mismatched
  WHERE NOT EXISTS (
    SELECT 1
    FROM categories AS existing_categories
    WHERE existing_categories.name = mismatched.name
      AND existing_categories.category_kind = mismatched.expected_category_kind
      AND existing_categories.archived_at IS NULL
  )
  GROUP BY name, expected_category_kind
)
INSERT INTO categories (
  id,
  name,
  parent_id,
  category_kind,
  color,
  icon,
  display_order,
  archived_at,
  created_at,
  updated_at
)
SELECT
  'cat_migrated_' || lower(hex(randomblob(16))),
  source_categories.name,
  NULL,
  to_create.expected_category_kind,
  source_categories.color,
  source_categories.icon,
  source_categories.display_order,
  NULL,
  datetime('now'),
  datetime('now')
FROM to_create
INNER JOIN categories AS source_categories
  ON source_categories.id = to_create.source_category_id;
--> statement-breakpoint
UPDATE cashflow_events
SET category_id = (
  SELECT target_categories.id
  FROM categories AS source_categories
  INNER JOIN categories AS target_categories
    ON target_categories.name = source_categories.name
    AND target_categories.category_kind = CASE
      WHEN cashflow_events.flow_kind = 'income' THEN 'income'
      WHEN cashflow_events.flow_kind = 'transfer' THEN 'transfer'
      WHEN cashflow_events.flow_kind = 'asset_movement' THEN 'asset_movement'
      WHEN cashflow_events.flow_kind = 'debt_payment' THEN 'debt'
      WHEN cashflow_events.flow_kind = 'adjustment' THEN 'adjustment'
      ELSE 'expense'
    END
    AND target_categories.archived_at IS NULL
  WHERE source_categories.id = cashflow_events.category_id
  ORDER BY target_categories.display_order, target_categories.created_at, target_categories.id
  LIMIT 1
),
updated_at = datetime('now')
WHERE category_id IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM categories AS source_categories
    WHERE source_categories.id = cashflow_events.category_id
      AND source_categories.category_kind != CASE
        WHEN cashflow_events.flow_kind = 'income' THEN 'income'
        WHEN cashflow_events.flow_kind = 'transfer' THEN 'transfer'
        WHEN cashflow_events.flow_kind = 'asset_movement' THEN 'asset_movement'
        WHEN cashflow_events.flow_kind = 'debt_payment' THEN 'debt'
        WHEN cashflow_events.flow_kind = 'adjustment' THEN 'adjustment'
        ELSE 'expense'
      END
  );
