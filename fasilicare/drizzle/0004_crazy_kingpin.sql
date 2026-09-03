CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`text` text NOT NULL,
	`userId` int NOT NULL,
	`ticketId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `tickets` ADD `urgency` enum('low','medium','high') DEFAULT 'low' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `image` text;--> statement-breakpoint
ALTER TABLE `users` ADD `reputation` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_user_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_ticket_fk` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE no action ON UPDATE no action;