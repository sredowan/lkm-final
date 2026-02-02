CREATE TABLE `customers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(100) NOT NULL,
	`name` varchar(100) NOT NULL,
	`phone` varchar(20),
	`address` text,
	`city` varchar(100),
	`postcode` varchar(20),
	`state` varchar(50),
	`country` varchar(50) DEFAULT 'Australia',
	`total_orders` int DEFAULT 0,
	`total_spent` decimal(10,2) DEFAULT '0',
	`last_order_date` timestamp,
	`notes` text,
	`tags` varchar(255),
	`source` varchar(50),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `customers_id` PRIMARY KEY(`id`),
	CONSTRAINT `customers_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `order_refunds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`reason` text,
	`refunded_items` text,
	`is_shipping_refunded` boolean DEFAULT false,
	`stripe_refund_id` varchar(100),
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `order_refunds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `order_items` ADD `refunded_quantity` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `orders` ADD `stripe_payment_intent_id` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `total_refunded` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `orders` ADD `refund_status` varchar(50) DEFAULT 'none';--> statement-breakpoint
ALTER TABLE `orders` ADD `tracking_number` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `shipping_provider` varchar(50);--> statement-breakpoint
ALTER TABLE `order_refunds` ADD CONSTRAINT `order_refunds_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE no action ON UPDATE no action;