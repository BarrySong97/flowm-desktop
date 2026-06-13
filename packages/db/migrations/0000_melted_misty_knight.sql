CREATE TABLE IF NOT EXISTS `asset_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`asset_type` text NOT NULL,
	`institution` text,
	`default_currency` text DEFAULT 'CNY' NOT NULL,
	`valuation_method` text DEFAULT 'manual_balance' NOT NULL,
	`archived_at` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_asset_items_type` ON `asset_items` (`asset_type`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_asset_items_archived` ON `asset_items` (`archived_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `asset_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`asset_item_id` text NOT NULL,
	`snapshot_at` text NOT NULL,
	`value_amount` text NOT NULL,
	`value_currency` text DEFAULT 'CNY' NOT NULL,
	`quantity_amount` text,
	`quantity_unit` text,
	`cost_basis_amount` text,
	`cost_basis_currency` text,
	`source_kind` text DEFAULT 'manual' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`asset_item_id`) REFERENCES `asset_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_asset_snapshots_item` ON `asset_snapshots` (`asset_item_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_asset_snapshots_snapshot_at` ON `asset_snapshots` (`snapshot_at`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budget_item_scopes` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_item_id` text NOT NULL,
	`scope_kind` text NOT NULL,
	`scope_value` text,
	FOREIGN KEY (`budget_item_id`) REFERENCES `budget_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_budget_item_scopes_item` ON `budget_item_scopes` (`budget_item_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_budget_item_scopes_kind` ON `budget_item_scopes` (`scope_kind`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budget_items` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_period_id` text NOT NULL,
	`name` text NOT NULL,
	`item_kind` text DEFAULT 'spending_limit' NOT NULL,
	`planned_amount` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`category_id` text,
	`rollover_policy` text DEFAULT 'none' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`note` text,
	`color` text,
	FOREIGN KEY (`budget_period_id`) REFERENCES `budget_periods`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_budget_items_period` ON `budget_items` (`budget_period_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budget_periods` (
	`id` text PRIMARY KEY NOT NULL,
	`budget_set_id` text NOT NULL,
	`period_kind` text NOT NULL,
	`period_start` text NOT NULL,
	`period_end` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	FOREIGN KEY (`budget_set_id`) REFERENCES `budget_sets`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_budget_periods_set` ON `budget_periods` (`budget_set_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_budget_periods_range` ON `budget_periods` (`period_start`,`period_end`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `budget_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cashflow_event_tags` (
	`cashflow_event_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`cashflow_event_id`, `tag_id`),
	FOREIGN KEY (`cashflow_event_id`) REFERENCES `cashflow_events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `cashflow_events` (
	`id` text PRIMARY KEY NOT NULL,
	`statement_line_id` text,
	`event_date` text NOT NULL,
	`occurred_at` text,
	`title` text,
	`counterparty` text,
	`description` text,
	`user_note` text,
	`amount` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`direction` text NOT NULL,
	`flow_kind` text NOT NULL,
	`category_id` text,
	`source_kind` text DEFAULT 'manual' NOT NULL,
	`source_name` text,
	`payment_method` text,
	`account_hint` text,
	`include_in_analytics` integer DEFAULT true NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`classification_source` text DEFAULT 'manual' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`statement_line_id`) REFERENCES `statement_lines`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cashflow_events_date` ON `cashflow_events` (`event_date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cashflow_events_flow_kind` ON `cashflow_events` (`flow_kind`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cashflow_events_direction` ON `cashflow_events` (`direction`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cashflow_events_category` ON `cashflow_events` (`category_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_cashflow_events_status` ON `cashflow_events` (`status`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`parent_id` text,
	`category_kind` text NOT NULL,
	`color` text,
	`icon` text,
	`display_order` integer DEFAULT 0 NOT NULL,
	`archived_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_categories_parent` ON `categories` (`parent_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_categories_kind` ON `categories` (`category_kind`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_categories_order` ON `categories` (`display_order`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `currency_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`display_currency` text DEFAULT 'CNY' NOT NULL,
	`fx_provider` text DEFAULT 'manual' NOT NULL,
	`fx_request_policy` text DEFAULT 'manual_only' NOT NULL,
	`updated_at` text NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `exchange_rates` (
	`id` text PRIMARY KEY NOT NULL,
	`from_currency` text NOT NULL,
	`to_currency` text NOT NULL,
	`rate_date` text NOT NULL,
	`rate` text NOT NULL,
	`provider` text NOT NULL,
	`fetched_at` text NOT NULL,
	`source_date` text,
	`meta` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `exchange_rates_pair_date_provider_unique` ON `exchange_rates` (`from_currency`,`to_currency`,`rate_date`,`provider`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_exchange_rates_pair_date` ON `exchange_rates` (`from_currency`,`to_currency`,`rate_date`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `loan_payment_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`loan_id` text NOT NULL,
	`due_date` text NOT NULL,
	`payment_amount` text NOT NULL,
	`principal_amount` text,
	`interest_amount` text,
	`fee_amount` text,
	`remaining_principal_estimate` text,
	`status` text DEFAULT 'forecast' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `loan_payment_occurrences_unique` ON `loan_payment_occurrences` (`loan_id`,`due_date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_loan_payment_occurrences_due` ON `loan_payment_occurrences` (`due_date`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `loans` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`lender` text,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`principal_amount` text,
	`current_principal_estimate` text,
	`annual_rate_bps` integer,
	`repayment_method` text,
	`payment_amount` text NOT NULL,
	`payment_day` integer,
	`start_date` text NOT NULL,
	`term_months` integer,
	`status` text DEFAULT 'active' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_loans_status` ON `loans` (`status`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `object_links` (
	`id` text PRIMARY KEY NOT NULL,
	`from_type` text NOT NULL,
	`from_id` text NOT NULL,
	`to_type` text NOT NULL,
	`to_id` text NOT NULL,
	`link_type` text NOT NULL,
	`confidence` integer,
	`created_by` text DEFAULT 'user' NOT NULL,
	`note` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_object_links_from` ON `object_links` (`from_type`,`from_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_object_links_to` ON `object_links` (`to_type`,`to_id`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `statement_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`source_name` text NOT NULL,
	`file_name` text,
	`file_hash` text,
	`imported_at` text NOT NULL,
	`status` text DEFAULT 'imported' NOT NULL,
	`raw_summary` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_statement_imports_source` ON `statement_imports` (`source_name`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_statement_imports_status` ON `statement_imports` (`status`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `statement_lines` (
	`id` text PRIMARY KEY NOT NULL,
	`import_id` text NOT NULL,
	`external_id` text,
	`line_hash` text NOT NULL,
	`occurred_at` text,
	`event_date` text NOT NULL,
	`counterparty` text,
	`description` text,
	`amount` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`direction` text NOT NULL,
	`payment_method` text,
	`account_hint` text,
	`raw_payload` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`import_id`) REFERENCES `statement_imports`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `statement_lines_import_hash_unique` ON `statement_lines` (`import_id`,`line_hash`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_statement_lines_import` ON `statement_lines` (`import_id`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_statement_lines_date` ON `statement_lines` (`event_date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_statement_lines_status` ON `statement_lines` (`status`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscription_occurrences` (
	`id` text PRIMARY KEY NOT NULL,
	`subscription_id` text NOT NULL,
	`due_date` text NOT NULL,
	`amount` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`status` text DEFAULT 'forecast' NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`subscription_id`) REFERENCES `subscriptions`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `subscription_occurrences_unique` ON `subscription_occurrences` (`subscription_id`,`due_date`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_subscription_occurrences_due` ON `subscription_occurrences` (`due_date`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`merchant` text,
	`amount` text NOT NULL,
	`currency` text DEFAULT 'CNY' NOT NULL,
	`billing_cycle` text NOT NULL,
	`interval_count` integer DEFAULT 1 NOT NULL,
	`next_charge_date` text NOT NULL,
	`auto_renew` integer DEFAULT true NOT NULL,
	`category_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`note` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_subscriptions_next_charge` ON `subscriptions` (`next_charge_date`);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`color` text,
	`archived_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `tags_name_unique` ON `tags` (`name`);