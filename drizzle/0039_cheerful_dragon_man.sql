CREATE TABLE `favorites` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`itemKey` varchar(100) NOT NULL,
	`itemType` enum('service','product','ebook','package') NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` int NOT NULL DEFAULT 0,
	`priceLabel` varchar(100),
	`imageUrl` text,
	`category` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `favorites_id` PRIMARY KEY(`id`)
);
