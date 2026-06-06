CREATE TABLE `queries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`date` text NOT NULL,
	`name` text NOT NULL,
	`query_string` text NOT NULL,
	`meta` text
);
--> statement-breakpoint
CREATE INDEX `idx_queries_date` ON `queries` (`date`);--> statement-breakpoint
CREATE INDEX `idx_queries_name` ON `queries` (`name`);