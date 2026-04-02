CREATE TABLE `patientAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`passwordHash` varchar(255) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`birthday` varchar(10),
	`resetToken` varchar(128),
	`resetTokenExpiresAt` timestamp,
	`pushSubscription` text,
	`consentAcceptedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `patientAccounts_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `patientAppointments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`treatmentId` int NOT NULL,
	`appointmentDate` varchar(10) NOT NULL,
	`appointmentTime` varchar(5) NOT NULL,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientAppointments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientPhotos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`treatmentId` int,
	`type` enum('before','after','progress') NOT NULL,
	`photoUrl` text NOT NULL,
	`photoDate` varchar(10) NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `patientPhotos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `patientTreatments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`patientId` int NOT NULL,
	`serviceName` varchar(255) NOT NULL,
	`totalSessions` int NOT NULL DEFAULT 1,
	`completedSessions` int NOT NULL DEFAULT 0,
	`status` enum('pending','in_progress','completed') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `patientTreatments_id` PRIMARY KEY(`id`)
);
