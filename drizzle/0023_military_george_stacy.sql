CREATE TABLE `courseComments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorEmail` varchar(320),
	`content` text NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`approvedAt` timestamp,
	CONSTRAINT `courseComments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseDocuments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videoId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileType` varchar(50) DEFAULT 'pdf',
	`fileSize` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courseDocuments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseSubscribers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320),
	`name` varchar(255),
	`pushSubscription` text,
	`notifyByEmail` boolean NOT NULL DEFAULT true,
	`notifyByPush` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `courseSubscribers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courseVideos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`courseId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`videoUrl` text NOT NULL,
	`thumbnailUrl` text,
	`duration` varchar(20),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPublished` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courseVideos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`category` varchar(100) DEFAULT 'nutricion',
	`isPublished` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
