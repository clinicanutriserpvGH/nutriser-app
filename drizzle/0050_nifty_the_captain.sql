ALTER TABLE `products` ADD `salePrice` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `soldCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `lowStockAlert` int DEFAULT 3;