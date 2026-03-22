CREATE TABLE `ebookDiscountCodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`discountPercent` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT false,
	`description` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ebookDiscountCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `ebookDiscountCodes_code_unique` UNIQUE(`code`)
);
