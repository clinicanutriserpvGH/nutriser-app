CREATE TABLE `productPurchases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`buyerName` varchar(255) NOT NULL,
	`buyerEmail` varchar(320) NOT NULL,
	`buyerPhone` varchar(50),
	`quantity` int NOT NULL DEFAULT 1,
	`proofUrl` text,
	`status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`purchaseCode` varchar(30) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `productPurchases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL DEFAULT 'general',
	`price` varchar(100),
	`imageUrl` text,
	`stock` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
