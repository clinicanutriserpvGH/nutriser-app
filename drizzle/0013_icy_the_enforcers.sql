ALTER TABLE `ebooks` ADD `comingSoon` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `ebooks` DROP COLUMN `backCoverUrl`;