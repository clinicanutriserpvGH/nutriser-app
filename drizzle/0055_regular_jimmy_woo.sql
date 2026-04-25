ALTER TABLE `installmentPlans` ADD `downPaymentCents` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `showUrgency` boolean DEFAULT false NOT NULL;