CREATE TABLE `couponShares` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`patientId` int NOT NULL,
	`promotionId` int NOT NULL,
	`promotionTitle` varchar(255),
	`promotionPrice` int,
	`cashbackAmount` int NOT NULL,
	`shareMethod` enum('whatsapp','link') NOT NULL DEFAULT 'whatsapp',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `couponShares_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `recipientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `recipientPhone` varchar(20);--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `purchaseType` enum('service','package') DEFAULT 'service' NOT NULL;