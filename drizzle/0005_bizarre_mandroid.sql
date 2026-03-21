CREATE TABLE `giftPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promotionId` int NOT NULL,
	`buyerName` varchar(255) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerPhone` varchar(20),
	`proofUrl` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedAt` timestamp,
	`approvedBy` int,
	`sharedWith` varchar(320),
	`sharedMethod` enum('whatsapp','email'),
	`sharedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `giftPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD CONSTRAINT `giftPurchases_promotionId_promotions_id_fk` FOREIGN KEY (`promotionId`) REFERENCES `promotions`(`id`) ON DELETE no action ON UPDATE no action;