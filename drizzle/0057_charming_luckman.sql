ALTER TABLE `servicePurchases` DROP INDEX `servicePurchases_serviceCode_unique`;--> statement-breakpoint
ALTER TABLE `servicePurchases` MODIFY COLUMN `serviceCode` varchar(20);