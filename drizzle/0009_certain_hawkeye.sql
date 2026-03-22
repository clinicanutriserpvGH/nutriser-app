CREATE TABLE `ebookPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ebookId` int NOT NULL,
	`buyerName` varchar(255) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`proofUrl` text NOT NULL,
	`accessToken` varchar(64) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`approvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebookPurchases_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebookPurchases_accessToken_unique` UNIQUE(`accessToken`)
);
--> statement-breakpoint
CREATE TABLE `ebooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`coverUrl` text,
	`backCoverUrl` text,
	`pdfUrl` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebooks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ebookPurchases` ADD CONSTRAINT `ebookPurchases_ebookId_ebooks_id_fk` FOREIGN KEY (`ebookId`) REFERENCES `ebooks`(`id`) ON DELETE no action ON UPDATE no action;