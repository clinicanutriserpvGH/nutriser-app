CREATE TABLE `shopCartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`itemKey` varchar(100) NOT NULL,
	`itemType` enum('service','product','ebook','package') NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`priceLabel` varchar(100),
	`imageUrl` text,
	`category` varchar(100),
	`qty` int NOT NULL DEFAULT 1,
	`serviceId` int,
	`productId` int,
	`ebookId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shopCartItems_id` PRIMARY KEY(`id`)
);
