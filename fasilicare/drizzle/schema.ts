import { foreignKey, int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const roleValues = ["user", "admin", "tech"] as const;
export type Role = (typeof roleValues)[number];

export const ticketStatusValues = ["pending", "approved", "in_progress", "resolved"] as const;
export type TicketStatus = (typeof ticketStatusValues)[number];
export const urgencyValues = ["low", "medium", "high", "critical"] as const;
export type Urgency = (typeof urgencyValues)[number];

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  image: text("image"),
  reputation: int("reputation").default(0).notNull(),
  role: mysqlEnum("role", roleValues).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const locations = mysqlTable("locations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull().unique(),
  type: varchar("type", { length: 40 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  issueDesc: text("issueDesc").notNull(),
  category: varchar("category", { length: 60 }),
  photoUrl: text("photoUrl").notNull(),
  proofUrl: text("proofUrl"),
  status: mysqlEnum("status", ticketStatusValues).default("pending").notNull(),
  urgency: mysqlEnum("urgency", urgencyValues).default("low").notNull(),
  authorId: int("authorId").notNull(),
  assignedTechId: int("assignedTechId"),
  startedAt: timestamp("startedAt"),
  resolvedAt: timestamp("resolvedAt"),
  locationId: int("locationId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  authorFk: foreignKey({ columns: [table.authorId], foreignColumns: [users.id], name: "tickets_author_fk" }),
  assignedTechFk: foreignKey({ columns: [table.assignedTechId], foreignColumns: [users.id], name: "tickets_assigned_tech_fk" }),
  locationFk: foreignKey({ columns: [table.locationId], foreignColumns: [locations.id], name: "tickets_location_fk" }),
}));

export const upvotes = mysqlTable("upvotes", {

  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userTicketUnique: uniqueIndex("upvotes_user_ticket_unique").on(table.userId, table.ticketId),
  userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "upvotes_user_fk" }),
  ticketFk: foreignKey({ columns: [table.ticketId], foreignColumns: [tickets.id], name: "upvotes_ticket_fk" }),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Location = typeof locations.$inferSelect;
export type InsertLocation = typeof locations.$inferInsert;
export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;
export type Upvote = typeof upvotes.$inferSelect;
export type InsertUpvote = typeof upvotes.$inferInsert;

export const comments = mysqlTable("comments", {
  id: int("id").autoincrement().primaryKey(),
  text: text("text").notNull(),
  userId: int("userId").notNull(),
  ticketId: int("ticketId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "comments_user_fk" }),
  ticketFk: foreignKey({ columns: [table.ticketId], foreignColumns: [tickets.id], name: "comments_ticket_fk" }),
}));

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isRead: int("isRead").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id], name: "notifications_user_fk" }),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
