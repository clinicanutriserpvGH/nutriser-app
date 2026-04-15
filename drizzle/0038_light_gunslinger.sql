CREATE TABLE `loyaltyPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`category` enum('consultation','product','service') NOT NULL,
	`requiredPurchases` int NOT NULL DEFAULT 3,
	`rewardDescription` varchar(255) NOT NULL DEFAULT '1 GRATIS',
	`isActive` boolean NOT NULL DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyPlans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`planId` int NOT NULL,
	`currentCount` int NOT NULL DEFAULT 0,
	`rewardsEarned` int NOT NULL DEFAULT 0,
	`rewardsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `loyaltyTracker` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`nutritionConsultations` int NOT NULL DEFAULT 0,
	`freeConsultationsEarned` int NOT NULL DEFAULT 0,
	`freeConsultationsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `loyaltyTracker_id` PRIMARY KEY(`id`),
	CONSTRAINT `loyaltyTracker_walletId_unique` UNIQUE(`walletId`)
);
--> statement-breakpoint
CREATE TABLE `shopPromotions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`subtitle` varchar(255),
	`description` text,
	`discountText` varchar(100),
	`couponCode` varchar(50),
	`imageUrl` text,
	`ctaText` varchar(100) DEFAULT 'Ver oferta',
	`ctaLink` varchar(500),
	`template` enum('gold_elegant','vibrant_orange','fresh_green','royal_purple','clean_white','dark_luxury') NOT NULL DEFAULT 'gold_elegant',
	`isActive` boolean NOT NULL DEFAULT true,
	`isFullscreen` boolean NOT NULL DEFAULT false,
	`priority` int NOT NULL DEFAULT 0,
	`startDate` timestamp,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopPromotions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `walletTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`type` enum('cashback','redeem','bonus','adjustment','free_consultation') NOT NULL,
	`amount` int NOT NULL,
	`description` varchar(500) NOT NULL,
	`referenceType` varchar(50),
	`referenceId` int,
	`balanceAfter` int NOT NULL,
	`createdBy` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `walletTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wallets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`walletNumber` varchar(20) NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`totalCashback` int NOT NULL DEFAULT 0,
	`totalRedeemed` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallets_patientId_unique` UNIQUE(`patientId`),
	CONSTRAINT `wallets_walletNumber_unique` UNIQUE(`walletNumber`)
);
