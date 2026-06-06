CREATE TABLE `budgets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`period` text NOT NULL,
	`name` text NOT NULL,
	`account_name` text,
	`tag` text,
	`amount_number` text NOT NULL,
	`currency` text NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_budgets_period` ON `budgets` (`period`);--> statement-breakpoint
CREATE INDEX `idx_budgets_account` ON `budgets` (`account_name`);--> statement-breakpoint
CREATE INDEX `idx_budgets_tag` ON `budgets` (`tag`);--> statement-breakpoint
CREATE TABLE `import_batches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_name` text NOT NULL,
	`imported_at` text NOT NULL,
	`file_name` text,
	`file_hash` text,
	`status` text DEFAULT 'imported' NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_import_batches_source` ON `import_batches` (`source_name`);--> statement-breakpoint
CREATE INDEX `idx_import_batches_status` ON `import_batches` (`status`);--> statement-breakpoint
CREATE TABLE `imported_entries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`batch_id` integer NOT NULL,
	`external_id` text,
	`date` text NOT NULL,
	`payee` text,
	`narration` text,
	`amount_number` text NOT NULL,
	`currency` text NOT NULL,
	`account_name` text NOT NULL,
	`hash` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`matched_transaction_id` integer,
	`generated_transaction_id` integer,
	`raw` text,
	`meta` text,
	FOREIGN KEY (`batch_id`) REFERENCES `import_batches`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`matched_transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`generated_transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_imported_entries_batch` ON `imported_entries` (`batch_id`);--> statement-breakpoint
CREATE INDEX `idx_imported_entries_date` ON `imported_entries` (`date`);--> statement-breakpoint
CREATE INDEX `idx_imported_entries_status` ON `imported_entries` (`status`);--> statement-breakpoint
CREATE UNIQUE INDEX `imported_entries_batch_hash_unique` ON `imported_entries` (`batch_id`,`hash`);--> statement-breakpoint
CREATE TABLE `recurring_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`frequency` text NOT NULL,
	`interval_count` integer DEFAULT 1 NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text,
	`next_due_date` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_recurring_rules_status` ON `recurring_rules` (`status`);--> statement-breakpoint
CREATE INDEX `idx_recurring_rules_next_due` ON `recurring_rules` (`next_due_date`);--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`merchant` text,
	`recurring_rule_id` integer NOT NULL,
	`model` text DEFAULT 'cash_expense' NOT NULL,
	`amount_number` text NOT NULL,
	`currency` text NOT NULL,
	`cash_account` text NOT NULL,
	`expense_account` text NOT NULL,
	`prepaid_account` text,
	`status` text DEFAULT 'active' NOT NULL,
	`last_generated_date` text,
	`meta` text,
	FOREIGN KEY (`recurring_rule_id`) REFERENCES `recurring_rules`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_subscriptions_rule` ON `subscriptions` (`recurring_rule_id`);--> statement-breakpoint
CREATE INDEX `idx_subscriptions_status` ON `subscriptions` (`status`);--> statement-breakpoint
CREATE TABLE `loans` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`principal_number` text NOT NULL,
	`currency` text NOT NULL,
	`annual_rate_bps` integer NOT NULL,
	`term_months` integer NOT NULL,
	`start_date` text NOT NULL,
	`payment_day` integer NOT NULL,
	`liability_account` text NOT NULL,
	`payment_account` text NOT NULL,
	`interest_account` text NOT NULL,
	`fee_account` text,
	`status` text DEFAULT 'active' NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_loans_status` ON `loans` (`status`);--> statement-breakpoint
CREATE INDEX `idx_loans_start_date` ON `loans` (`start_date`);--> statement-breakpoint
CREATE TABLE `loan_schedule_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`loan_id` integer NOT NULL,
	`installment_number` integer NOT NULL,
	`due_date` text NOT NULL,
	`payment_number` text NOT NULL,
	`principal_number` text NOT NULL,
	`interest_number` text NOT NULL,
	`fee_number` text DEFAULT '0.00' NOT NULL,
	`remaining_principal_number` text NOT NULL,
	`transaction_id` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`meta` text,
	FOREIGN KEY (`loan_id`) REFERENCES `loans`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_loan_schedule_items_loan` ON `loan_schedule_items` (`loan_id`);--> statement-breakpoint
CREATE INDEX `idx_loan_schedule_items_due_date` ON `loan_schedule_items` (`due_date`);--> statement-breakpoint
CREATE UNIQUE INDEX `loan_schedule_items_loan_installment_unique` ON `loan_schedule_items` (`loan_id`,`installment_number`);--> statement-breakpoint
CREATE TABLE `investment_instruments` (
	`symbol` text PRIMARY KEY NOT NULL,
	`commodity_currency` text NOT NULL,
	`name` text NOT NULL,
	`kind` text DEFAULT 'stock' NOT NULL,
	`quote_currency` text NOT NULL,
	`asset_account` text NOT NULL,
	`dividend_account` text NOT NULL,
	`capital_gains_account` text NOT NULL,
	`fee_account` text NOT NULL,
	`meta` text,
	FOREIGN KEY (`commodity_currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_investment_instruments_kind` ON `investment_instruments` (`kind`);--> statement-breakpoint
CREATE INDEX `idx_investment_instruments_quote` ON `investment_instruments` (`quote_currency`);