ALTER TABLE `adminCredentials` ADD `loginToken` varchar(128);--> statement-breakpoint
ALTER TABLE `adminCredentials` ADD `loginTokenExpiresAt` timestamp;--> statement-breakpoint
ALTER TABLE `adminCredentials` ADD `loginAuthorized` boolean DEFAULT false;