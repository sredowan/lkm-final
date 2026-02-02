CREATE TABLE `shipping_providers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`code` varchar(50) NOT NULL,
	`api_key` varchar(512),
	`api_secret` varchar(512),
	`account_number` varchar(100),
	`test_mode` boolean DEFAULT true,
	`is_active` boolean DEFAULT false,
	`settings` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_providers_id` PRIMARY KEY(`id`),
	CONSTRAINT `shipping_providers_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `shipping_zones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`postcodes` text,
	`flat_rate` decimal(10,2),
	`free_shipping_threshold` decimal(10,2),
	`weight_rate` decimal(10,2),
	`is_active` boolean DEFAULT true,
	`sort_order` int DEFAULT 0,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shipping_zones_id` PRIMARY KEY(`id`)
);
