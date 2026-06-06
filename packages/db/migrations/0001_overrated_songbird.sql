CREATE TABLE `balance_asserts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`account_id` integer NOT NULL,
	`amount_number` text NOT NULL,
	`amount_currency` text NOT NULL,
	`tolerance_number` text,
	`diff_number` text,
	`diff_currency` text,
	`meta` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`amount_currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`diff_currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_balance_asserts_date` ON `balance_asserts` (`date`);--> statement-breakpoint
CREATE INDEX `idx_balance_asserts_account` ON `balance_asserts` (`account_id`);--> statement-breakpoint
CREATE TABLE `customs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`values` text NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_customs_date` ON `customs` (`date`);--> statement-breakpoint
CREATE INDEX `idx_customs_type` ON `customs` (`type`);--> statement-breakpoint
CREATE TABLE `document_links` (
	`document_id` integer NOT NULL,
	`link` text NOT NULL,
	PRIMARY KEY(`document_id`, `link`),
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`link`) REFERENCES `links`(`link`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `document_tags` (
	`document_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`document_id`, `tag`),
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag`) REFERENCES `tags`(`tag`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`account_id` integer NOT NULL,
	`filename` text NOT NULL,
	`meta` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_documents_date` ON `documents` (`date`);--> statement-breakpoint
CREATE INDEX `idx_documents_account` ON `documents` (`account_id`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`type` text NOT NULL,
	`description` text NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_events_date` ON `events` (`date`);--> statement-breakpoint
CREATE INDEX `idx_events_type` ON `events` (`type`);--> statement-breakpoint
CREATE TABLE `tags` (
	`tag` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`link` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `transaction_tags` (
	`txn_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`txn_id`, `tag`),
	FOREIGN KEY (`txn_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag`) REFERENCES `tags`(`tag`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `transaction_links` (
	`txn_id` integer NOT NULL,
	`link` text NOT NULL,
	PRIMARY KEY(`txn_id`, `link`),
	FOREIGN KEY (`txn_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`link`) REFERENCES `links`(`link`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `pads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`account_id` integer NOT NULL,
	`source_account_id` integer NOT NULL,
	`meta` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_pads_date` ON `pads` (`date`);--> statement-breakpoint
CREATE INDEX `idx_pads_account` ON `pads` (`account_id`);--> statement-breakpoint
CREATE TABLE `prices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`currency` text NOT NULL,
	`amount_number` text NOT NULL,
	`amount_currency` text NOT NULL,
	`meta` text,
	FOREIGN KEY (`currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`amount_currency`) REFERENCES `commodities`(`currency`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_prices_date` ON `prices` (`date`);--> statement-breakpoint
CREATE INDEX `idx_prices_quote` ON `prices` (`amount_currency`);--> statement-breakpoint
CREATE UNIQUE INDEX `prices_date_currency_quote_unique` ON `prices` (`date`,`currency`,`amount_currency`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`account_id` integer NOT NULL,
	`comment` text NOT NULL,
	`meta` text,
	FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_notes_date` ON `notes` (`date`);--> statement-breakpoint
CREATE INDEX `idx_notes_account` ON `notes` (`account_id`);--> statement-breakpoint
CREATE TABLE `note_tags` (
	`note_id` integer NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`note_id`, `tag`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag`) REFERENCES `tags`(`tag`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `note_links` (
	`note_id` integer NOT NULL,
	`link` text NOT NULL,
	PRIMARY KEY(`note_id`, `link`),
	FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`link`) REFERENCES `links`(`link`) ON UPDATE no action ON DELETE cascade
);
