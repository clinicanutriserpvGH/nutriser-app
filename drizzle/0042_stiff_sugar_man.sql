ALTER TABLE `ebookPurchases` ADD `walletDiscount` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `ebookPurchases` ADD `patientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `memberships` ADD `walletDiscount` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `memberships` ADD `patientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `productPurchases` ADD `walletDiscount` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `productPurchases` ADD `patientEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `walletDiscount` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `servicePurchases` ADD `patientEmail` varchar(320);