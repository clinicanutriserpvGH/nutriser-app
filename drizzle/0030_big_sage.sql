CREATE TABLE `topicSuggestions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorName` varchar(255) NOT NULL,
	`authorEmail` varchar(320),
	`title` varchar(255) NOT NULL,
	`description` text,
	`votes` int NOT NULL DEFAULT 0,
	`status` enum('pending','approved','rejected','published') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topicSuggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topicVotes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`suggestionId` int NOT NULL,
	`voterFingerprint` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topicVotes_id` PRIMARY KEY(`id`)
);
