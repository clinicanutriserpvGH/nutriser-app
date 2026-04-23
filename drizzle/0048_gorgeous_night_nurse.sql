CREATE TABLE `adminNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`patientId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`imageUrl` text,
	`type` enum('cobro','promocion','felicitacion','general') NOT NULL DEFAULT 'general',
	`isRead` boolean NOT NULL DEFAULT false,
	`readAt` timestamp,
	`sentBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminNotifications_id` PRIMARY KEY(`id`)
);
