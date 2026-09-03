CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tickets` MODIFY COLUMN `urgency` enum('low','medium','high','critical') NOT NULL DEFAULT 'low';--> statement-breakpoint
ALTER TABLE `tickets` ADD `category` varchar(60);--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;