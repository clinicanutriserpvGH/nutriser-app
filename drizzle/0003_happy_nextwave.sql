CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercentage` int NOT NULL,
	`status` enum('pending','active','inactive') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`approvedAt` timestamp,
	`approvedBy` int,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `membershipCoupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`membershipId` int NOT NULL,
	`couponId` int NOT NULL,
	`discountAmount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `membershipCoupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `membershipCoupons` ADD CONSTRAINT `membershipCoupons_membershipId_memberships_id_fk` FOREIGN KEY (`membershipId`) REFERENCES `memberships`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `membershipCoupons` ADD CONSTRAINT `membershipCoupons_couponId_coupons_id_fk` FOREIGN KEY (`couponId`) REFERENCES `coupons`(`id`) ON DELETE no action ON UPDATE no action;