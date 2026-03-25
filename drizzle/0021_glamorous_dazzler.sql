CREATE TABLE `discountCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercent` int NOT NULL,
	`isGift` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT false,
	`description` varchar(255),
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `discountCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `discountCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `memberships` ADD `discountCode` varchar(50);--> statement-breakpoint
ALTER TABLE `memberships` ADD `discountPercent` int;--> statement-breakpoint
ALTER TABLE `memberships` ADD `originalPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `productPurchases` ADD `discountCode` varchar(50);--> statement-breakpoint
ALTER TABLE `productPurchases` ADD `discountPercent` int;--> statement-breakpoint
ALTER TABLE `productPurchases` ADD `originalPrice` varchar(100);--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `discountCode` varchar(50);--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `discountPercent` int;--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `originalPrice` varchar(100);