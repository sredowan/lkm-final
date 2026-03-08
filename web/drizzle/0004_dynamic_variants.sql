CREATE TABLE `product_variant_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`variant_id` int NOT NULL,
	`option_id` int NOT NULL,
	CONSTRAINT `product_variant_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `variant_options` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type_id` int NOT NULL,
	`value` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `variant_options_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `variant_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `variant_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `product_variants` ADD `name` varchar(255);--> statement-breakpoint
ALTER TABLE `product_variants` ADD `image_url` varchar(255);--> statement-breakpoint
ALTER TABLE `product_variant_options` ADD CONSTRAINT `product_variant_options_variant_id_product_variants_id_fk` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variant_options` ADD CONSTRAINT `product_variant_options_option_id_variant_options_id_fk` FOREIGN KEY (`option_id`) REFERENCES `variant_options`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `variant_options` ADD CONSTRAINT `variant_options_type_id_variant_types_id_fk` FOREIGN KEY (`type_id`) REFERENCES `variant_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_variants` DROP COLUMN `color`;--> statement-breakpoint
ALTER TABLE `product_variants` DROP COLUMN `storage`;