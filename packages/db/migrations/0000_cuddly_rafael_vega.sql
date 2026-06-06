CREATE TABLE `account_currencies` (
	`account_id` integer NOT NULL,
	`currency` text NOT NULL,
	PRIMARY KEY(`account_id`, `currency`),
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`opened_at` text NOT NULL,
	`closed_at` text,
	`booking` text DEFAULT 'STRICT' NOT NULL,
	`parent_id` integer,
	`meta` text,
	FOREIGN KEY (`parent_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `accounts_name_unique` ON `accounts` (`name`);--> statement-breakpoint
CREATE TABLE `commodities` (
	`currency` text PRIMARY KEY NOT NULL,
	`declared_at` text,
	`meta` text
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`flag` text DEFAULT '*' NOT NULL,
	`payee` text,
	`narration` text DEFAULT '' NOT NULL,
	`origin` text DEFAULT 'user' NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_txn_date` ON `transactions` (`date`);--> statement-breakpoint
CREATE TABLE `postings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`txn_id` integer NOT NULL,
	`ordinal` integer NOT NULL,
	`account_id` integer NOT NULL,
	`flag` text,
	`units_number` text,
	`units_currency` text,
	`cost_number` text,
	`cost_currency` text,
	`cost_date` text,
	`cost_label` text,
	`price_number` text,
	`price_currency` text,
	`price_is_total` integer DEFAULT 0 NOT NULL,
	`meta` text,
	FOREIGN KEY (`txn_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`units_currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_postings_account` ON `postings` (`account_id`);--> statement-breakpoint
CREATE INDEX `idx_postings_txn` ON `postings` (`txn_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `postings_txn_ordinal` ON `postings` (`txn_id`,`ordinal`);