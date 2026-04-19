CREATE TABLE `userBehaviorEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemType` enum('service','product','ebook','package','promotion') NOT NULL,
	`itemId` varchar(100) NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`eventType` enum('view','wishlist','cart','info','purchase') NOT NULL,
	`patientId` int,
	`sessionId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userBehaviorEvents_id` PRIMARY KEY(`id`)
);
