CREATE TABLE `beforeAfterPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientName` varchar(255) NOT NULL,
	`category` enum('nutricion','estetica','ambos') NOT NULL DEFAULT 'nutricion',
	`description` text,
	`beforeImageUrl` text NOT NULL,
	`afterImageUrl` text NOT NULL,
	`isVisible` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `beforeAfterPhotos_id` PRIMARY KEY(`id`)
);
