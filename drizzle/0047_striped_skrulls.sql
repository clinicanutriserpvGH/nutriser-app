CREATE TABLE `installmentPayments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`walletId` int NOT NULL,
	`installmentNumber` int NOT NULL,
	`amountCents` int NOT NULL,
	`dueDate` timestamp NOT NULL,
	`status` enum('pending','paid','overdue') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`confirmedBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installmentPayments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `installmentPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`walletId` int NOT NULL,
	`patientId` int NOT NULL,
	`concept` varchar(255) NOT NULL,
	`originalAmountCents` int NOT NULL,
	`totalAmountCents` int NOT NULL,
	`surchargePercent` int NOT NULL,
	`modalidad` enum('quincenal','semanal') NOT NULL,
	`totalInstallments` int NOT NULL,
	`paidInstallments` int NOT NULL DEFAULT 0,
	`status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
	`createdBy` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `installmentPlans_id` PRIMARY KEY(`id`)
);
