ALTER TABLE `adminCredentials` ADD `resetToken` varchar(128);--> statement-breakpoint
ALTER TABLE `adminCredentials` ADD `resetTokenExpiresAt` timestamp;