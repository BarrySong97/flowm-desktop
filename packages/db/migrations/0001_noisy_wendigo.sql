ALTER TABLE `cashflow_events` ADD `source_external_id` text;--> statement-breakpoint
ALTER TABLE `cashflow_events` ADD `source_file_hash` text;--> statement-breakpoint
ALTER TABLE `cashflow_events` ADD `imported_at` text;--> statement-breakpoint
CREATE UNIQUE INDEX `cashflow_events_source_external_unique` ON `cashflow_events` (`source_name`,`source_external_id`);