CREATE TABLE `bannerInterests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bannerId` int,
	`bannerTitle` varchar(255),
	`bannerImageUrl` text,
	`patientName` varchar(255),
	`patientEmail` varchar(320),
	`status` enum('pending','attended','cancelled') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`attendedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bannerInterests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cashPendingPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`patientId` int NOT NULL,
	`concept` varchar(500) NOT NULL,
	`itemType` enum('service','product','ebook','package','promotion','course','other') NOT NULL,
	`itemId` varchar(100),
	`amountCents` int NOT NULL,
	`walletAmountUsedCents` int NOT NULL DEFAULT 0,
	`cashbackPercent` int NOT NULL DEFAULT 0,
	`status` enum('pending','confirmed','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`confirmedAt` timestamp,
	`confirmedBy` varchar(100),
	`cancelledAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cashPendingPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `physicalCardRequests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`walletNumber` varchar(50) NOT NULL,
	`patientEmail` varchar(320),
	`status` enum('pending','printed','delivered') NOT NULL DEFAULT 'pending',
	`notes` text,
	`requestedAt` timestamp NOT NULL DEFAULT (now()),
	`printedAt` timestamp,
	`deliveredAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `physicalCardRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `splashAds` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('inicio','tienda') NOT NULL DEFAULT 'inicio',
	`imageUrl` text NOT NULL,
	`title` varchar(255),
	`subtitle` varchar(500),
	`linkUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`showDefault` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `splashAds_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `splashConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`type` enum('inicio','tienda') NOT NULL,
	`showDefault` boolean NOT NULL DEFAULT false,
	`customImageUrl` varchar(1024),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `splashConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `splashConfig_type_unique` UNIQUE(`type`)
);
--> statement-breakpoint
CREATE TABLE `storeBanners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`imageUrl` text,
	`title` varchar(255),
	`linkTarget` varchar(50),
	`linkUrl` varchar(500),
	`isActive` boolean NOT NULL DEFAULT true,
	`isSystem` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeBanners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
DROP TABLE `couponSubscribers`;--> statement-breakpoint
ALTER TABLE `adminCredentials` ADD `sessionToken` varchar(128);--> statement-breakpoint
ALTER TABLE `adminCredentials` ADD `sessionTokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `wallets` ADD `discountPercent` int;--> statement-breakpoint
ALTER TABLE `wallets` ADD `discountActivatedAt` timestamp;