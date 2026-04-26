ALTER TABLE `patientAccounts` ADD `referredByWalletCode` varchar(20);--> statement-breakpoint
ALTER TABLE `patientAccounts` ADD `referralCashbackPaid` boolean DEFAULT false NOT NULL;