import { boolean, foreignKey, integer, pgEnum, pgTable, serial, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";

export const roleValues = ["user", "admin", "tech"] as const;
export type Role = (typeof roleValues)[number];
export const ticketStatusValues = ["pending", "approved", "in_progress", "resolved"] as const;
export type TicketStatus = (typeof ticketStatusValues)[number];
export const urgencyValues = ["low", "medium", "high", "critical"] as const;
export type Urgency = (typeof urgencyValues)[number];
export const roleEnum = pgEnum("role", roleValues);
export const ticketStatusEnum = pgEnum("ticket_status", ticketStatusValues);
export const urgencyEnum = pgEnum("urgency", urgencyValues);

export const users = pgTable("users", {
  id: serial("id").primaryKey(), openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"), email: varchar("email", { length: 320 }), loginMethod: varchar("loginMethod", { length: 64 }), image: text("image"),
  reputation: integer("reputation").default(0).notNull(), reputationPoints: integer("reputation_points").default(0).notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  role: roleEnum("role").default("user").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().notNull(), lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export const locations = pgTable("locations", { id: serial("id").primaryKey(), name: varchar("name", { length: 180 }).notNull().unique(), type: varchar("type", { length: 40 }).notNull(), isVerified: boolean("is_verified").default(true).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() });
export const tickets = pgTable("tickets", {
  id: serial("id").primaryKey(), issueDesc: text("issueDesc").notNull(), category: varchar("category", { length: 60 }), photoUrl: text("photoUrl").notNull(), proofUrl: text("proofUrl"),
  status: ticketStatusEnum("status").default("pending").notNull(), urgency: urgencyEnum("urgency").default("low").notNull(), authorId: integer("authorId").notNull(), assignedTechId: integer("assignedTechId"), startedAt: timestamp("started_at"), resolvedAt: timestamp("resolvedAt"), completedAt: timestamp("completed_at"), locationId: integer("locationId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull(), updatedAt: timestamp("updatedAt").defaultNow().notNull(),
}, table => ({ authorFk: foreignKey({ columns: [table.authorId], foreignColumns: [users.id], name: "tickets_author_fk" }), assignedTechFk: foreignKey({ columns: [table.assignedTechId], foreignColumns: [users.id], name: "tickets_assigned_tech_fk" }), locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id], name: "tickets_location_fk" }) }));
export const upvotes = pgTable("upvotes", { id: serial("id").primaryKey(), userId: integer("userId").notNull(), ticketId: integer("ticketId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, table => ({ userTicketUnique: uniqueIndex("upvotes_user_ticket_unique").on(table.userId, table.ticketId), userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "upvotes_user_fk" }), ticketFk: foreignKey({ columns: [table.ticketId], foreignColumns: [tickets.id], name: "upvotes_ticket_fk" }) }));
export const comments = pgTable("comments", { id: serial("id").primaryKey(), text: text("text").notNull(), userId: integer("userId").notNull(), ticketId: integer("ticketId").notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, table => ({ userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "comments_user_fk" }), ticketFk: foreignKey({ columns: [table.ticketId], foreignColumns: [tickets.id], name: "comments_ticket_fk" }) }));
export const notifications = pgTable("notifications", { id: serial("id").primaryKey(), userId: integer("userId").notNull(), message: text("message").notNull(), isRead: integer("isRead").default(0).notNull(), createdAt: timestamp("createdAt").defaultNow().notNull() }, table => ({ userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "notifications_user_fk" }) }));
export const flags = pgTable("flags", { id: serial("id").primaryKey(), ticketId: integer("ticket_id").notNull(), userId: integer("user_id").notNull(), reason: text("reason"), createdAt: timestamp("created_at").defaultNow().notNull() }, table => ({ ticketReporterUnique: uniqueIndex("flags_ticket_reporter_unique").on(table.ticketId, table.userId), ticketFk: foreignKey({ columns: [table.ticketId], foreignColumns: [tickets.id], name: "flags_ticket_fk" }), reporterFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "flags_reporter_fk" }) }));
/** Compatibility alias for callers that describe these as hoax flags. */
export const hoaxFlags = flags;
export type User = typeof users.$inferSelect; export type InsertUser = typeof users.$inferInsert; export type Location = typeof locations.$inferSelect; export type InsertLocation = typeof locations.$inferInsert; export type Ticket = typeof tickets.$inferSelect; export type InsertTicket = typeof tickets.$inferInsert; export type Upvote = typeof upvotes.$inferSelect; export type InsertUpvote = typeof upvotes.$inferInsert; export type Comment = typeof comments.$inferSelect; export type InsertComment = typeof comments.$inferInsert; export type Notification = typeof notifications.$inferSelect; export type InsertNotification = typeof notifications.$inferInsert; export type HoaxFlag = typeof hoaxFlags.$inferSelect; export type InsertHoaxFlag = typeof hoaxFlags.$inferInsert;
