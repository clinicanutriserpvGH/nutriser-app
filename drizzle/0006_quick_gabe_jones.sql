ALTER TABLE `giftPurchases` MODIFY COLUMN `status` enum('pending','approved','rejected','used') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `couponCode` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `isGift` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `recipientName` varchar(255);--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD `recipientContact` varchar(320);--> statement-breakpoint
ALTER TABLE `giftPurchases` ADD CONSTRAINT `giftPurchases_couponCode_unique` UNIQUE(`couponCode`);