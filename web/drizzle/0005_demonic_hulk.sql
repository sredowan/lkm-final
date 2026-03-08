CREATE TABLE `blog_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blog_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_categories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_post_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_id` int NOT NULL,
	`tag_id` int NOT NULL,
	CONSTRAINT `blog_post_tags_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` text,
	`content` text,
	`featured_image_url` varchar(512),
	`author_id` int,
	`category_id` int,
	`status` varchar(50) DEFAULT 'draft',
	`view_count` int DEFAULT 0,
	`meta_title` varchar(255),
	`meta_description` text,
	`canonical_url` varchar(512),
	`focus_keyword` varchar(100),
	`secondary_keywords` text,
	`og_title` varchar(255),
	`og_description` text,
	`og_image_url` varchar(512),
	`published_at` timestamp,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `blog_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `blog_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `blog_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `blog_tags_name_unique` UNIQUE(`name`),
	CONSTRAINT `blog_tags_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `global_tags` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`created_at` timestamp DEFAULT (now()),
	CONSTRAINT `global_tags_id` PRIMARY KEY(`id`),
	CONSTRAINT `global_tags_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
ALTER TABLE `products` ADD `tags` varchar(512);--> statement-breakpoint
ALTER TABLE `blog_post_tags` ADD CONSTRAINT `blog_post_tags_post_id_blog_posts_id_fk` FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_post_tags` ADD CONSTRAINT `blog_post_tags_tag_id_blog_tags_id_fk` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_admins_id_fk` FOREIGN KEY (`author_id`) REFERENCES `admins`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_category_id_blog_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE no action ON UPDATE no action;