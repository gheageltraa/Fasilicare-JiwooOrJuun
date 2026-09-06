import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, asc, count, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { comments, flags, hoaxFlags, locations, notifications, tickets, upvotes, users, type InsertUser, type Role, type TicketStatus, type Urgency } from "../drizzle/schema.js";
import { getDatabaseUrl } from "./_core/databaseUrl.js";

let _db: ReturnType<typeof drizzle> | null = null;
const scrypt = promisify(scryptCallback);
export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); const derived = await scrypt(password, salt, 64) as Buffer; return `${salt}:${derived.toString("hex")}`; }
export async function verifyPassword(password: string, stored: string) { const [salt, hash] = stored.split(":"); if (!salt || !hash) return false; const derived = await scrypt(password, salt, 64) as Buffer; const expected = Buffer.from(hash, "hex"); return expected.length === derived.length && timingSafeEqual(expected, derived); }
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(getDatabaseUrl(process.env.DATABASE_URL, process.env.DATABASE_POOLER_REGION)); } catch (error) { console.warn("[Database] Failed to connect:", error); }
  }
  return _db;
}

export const LEAD_EMAILS = new Set(["dhanny.aljael@gmail.com", "ghea.geltra@gmail.com"]);
export const COMMUNITY_VALIDATION_THRESHOLD = 1;
export function isLeadEmail(email?: string | null) { return !!email && LEAD_EMAILS.has(email.toLowerCase()); }

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const lead = isLeadEmail(user.email);
  const role: Role = lead ? "admin" : (user.role ?? "user");
  await db.insert(users).values({ ...user, role, lastSignedIn: user.lastSignedIn ?? new Date() }).onConflictDoUpdate({ target: users.openId,
    set: { name: user.name, email: user.email, loginMethod: user.loginMethod, ...(user.image !== undefined ? { image: user.image } : {}), lastSignedIn: new Date(), ...(lead ? { role: "admin" as Role } : {}) },
  });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }
export async function getUserById(id: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.id, id)).limit(1); return rows[0]; }
export async function updateUserRole(id: number, role: Role) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ role }).where(eq(users.id, id)); return getUserById(id); }
export async function listUsers() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, username: users.username, name: users.name, email: users.email, image: users.image, role: users.role, reputation: users.reputation, reputationPoints: users.reputationPoints, isBanned: users.isBanned, createdAt: users.createdAt }).from(users).orderBy(desc(users.createdAt)); }
export async function getUserByLogin(login: string) { const db = await getDb(); if (!db) return undefined; const normalized = login.trim().toLowerCase(); const rows = await db.select().from(users).where(sql`lower(${users.email}) = ${normalized} or lower(${users.username}) = ${normalized}`).limit(1); return rows[0]; }
export async function createLocalUser(input: { email: string; username: string; password: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const passwordHash = await hashPassword(input.password); const [user] = await db.insert(users).values({ openId: `local:${input.username.toLowerCase()}`, email: input.email.trim().toLowerCase(), username: input.username.trim(), name: input.username.trim(), passwordHash, loginMethod: "password" }).returning(); return user; }
export async function setUserPassword(id: number, password: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const passwordHash = await hashPassword(password); await db.update(users).set({ passwordHash, loginMethod: "password" }).where(eq(users.id, id)); return getUserById(id); }
export async function updateUsername(id: number, username: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ username: username.trim() }).where(eq(users.id, id)); return getUserById(id); }
export async function deleteUser(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.transaction(async tx => { const owned = await tx.select({ id: tickets.id }).from(tickets).where(eq(tickets.authorId, id)); for (const ticket of owned) { await tx.delete(flags).where(eq(flags.ticketId, ticket.id)); await tx.delete(upvotes).where(eq(upvotes.ticketId, ticket.id)); await tx.delete(comments).where(eq(comments.ticketId, ticket.id)); await tx.delete(tickets).where(eq(tickets.id, ticket.id)); } await tx.update(tickets).set({ assignedTechId: null }).where(eq(tickets.assignedTechId, id)); await tx.delete(flags).where(eq(flags.userId, id)); await tx.delete(comments).where(eq(comments.userId, id)); await tx.delete(upvotes).where(eq(upvotes.userId, id)); await tx.delete(notifications).where(eq(notifications.userId, id)); await tx.delete(users).where(eq(users.id, id)); }); return { success: true as const }; }
export async function getPublicProfile(id: number) { const profile = await getUserProfile(id); if (!profile) return undefined; return { ...profile, reports: await listTickets(undefined, undefined, id) }; }

export async function listLocations() {
  try {
    const db = await getDb(); if (!db) return [];
    let rows = await db.select().from(locations).orderBy(asc(locations.name));
    if (rows.length === 0) { await seedLocations(); rows = await db.select().from(locations).orderBy(asc(locations.name)); }
    return rows;
  } catch (error) {
    console.warn("[Database] Failed to load locations:", error);
    return [];
  }
}
export async function seedLocations() {
  const db = await getDb(); if (!db) return;
  const exactTransitLocations = [
    ...["Jakarta Kota", "Jayakarta", "Mangga Besar", "Sawah Besar", "Juanda", "Gondangdia", "Cikini", "Manggarai", "Tebet", "Cawang", "Duren Kalibata", "Pasar Minggu Baru", "Pasar Minggu", "Tanjung Barat", "Lenteng Agung", "Universitas Pancasila", "Universitas Indonesia", "Pondok Cina", "Depok Baru", "Depok", "Citayam", "Bojong Gede", "Cilebut", "Bogor", "Sudirman", "Karet", "Tanah Abang", "Palmerah", "Kebayoran", "Pondok Ranji", "Jurangmangu", "Sudimara", "Rawa Buntu", "Serpong", "Bekasi", "Cikarang"].map(name => ({ name, type: "KRL" })),
    ...["Lebak Bulus Grab", "Fatmawati", "Cipete Raya", "Haji Nawi", "Blok A", "Blok M BCA", "ASEAN", "Senayan", "Istora Mandiri", "Bendungan Hilir", "Setiabudi Astra", "Dukuh Atas BNI", "Bundaran HI"].map(name => ({ name, type: "MRT" })),
    ...["Harjamukti", "Ciracas", "Kampung Rambutan", "TMII", "Cawang", "Ciliwung", "Cikoko", "Pancoran", "Kuningan", "Rasuna Said", "Setiabudi", "Dukuh Atas", "Halim", "Jati Bening Baru", "Cikunir 1", "Cikunir 2", "Bekasi Barat", "Jati Mulya"].map(name => ({ name, type: "LRT Jabodebek" })),
    ...["Pegangsaan Dua", "Boulevard Utara", "Boulevard Selatan", "Pulomas", "Equestrian", "Velodrome"].map(name => ({ name, type: "LRT Jakarta" })),
    ...["Blok M", "Kota", "Harmoni", "Monas", "Tosari", "Bundaran HI", "CSW", "Kampung Melayu", "Matraman 1", "Matraman 2", "Salemba Carolus", "Senen", "Cempaka Mas", "Pulo Gadung", "Ragunan", "Kuningan Barat", "Kuningan Timur", "Halte Rasuna Said"].map(name => ({ name, type: "TransJakarta" })),
  ];
  const rows = [
    ...exactTransitLocations,
    ...["Lebak Bulus Grab", "Fatmawati Indomaret", "Cipete Raya", "Haji Nawi", "Blok A", "Blok M BCA", "ASEAN", "Senayan", "Istora Mandiri", "Bendungan Hilir", "Setiabudi Astra", "Dukuh Atas BNI", "Bundaran HI Bank DKI"].map(name => ({ name: `MRT ${name}`, type: "MRT" })),
    ...["Pegangsaan Dua", "Pulomas", "Boulevard Utara", "Boulevard Selatan", "Boulevar Utara", "Boulevar Selatan", "Ecoventure", "Equestrian", "Velodrome", "Dukuh Atas BNI", "Setiabudi", "Rasuna Said", "Kuningan", "Pancoran", "Cikoko", "Cawang", "TMII", "Kampung Rambutan", "Ciracas", "Harjamukti", "Jati Mulya", "Cikunir 1", "Cikunir 2", "Bekasi Barat", "Jatibening Baru"].map(name => ({ name: `LRT ${name}`, type: "LRT" })),
    ...["Bogor", "Cilebut", "Bojong Gede", "Citayam", "Depok", "Depok Baru", "Pondok Cina", "Universitas Indonesia", "Pasar Minggu", "Tebet", "Manggarai", "Jatinegara", "Klender", "Bekasi", "Kranji", "Cikarang", "Tanah Abang", "Palmerah", "Kebayoran", "Serpong", "Rangkasbitung", "Duri", "Grogol", "Tangerang", "Jakarta Kota", "Gondangdia", "Juanda", "Sudirman", "Karet"].map(name => ({ name: `Stasiun ${name}`, type: "KRL" })),
    ...["Blok M", "Monas", "Harmoni", "Kota", "Sarinah", "Bundaran HI", "Dukuh Atas", "Tosari", "Karet Sudirman", "Rasuna Said", "Kuningan Madya", "Pancoran", "Cawang UKI", "Tanjung Priok", "Pulo Gadung", "Matraman", "Senen", "Kampung Melayu", "Cililitan", "Lebak Bulus", "Kebayoran Lama", "Sisingamangaraja", "Gelora Bung Karno", "Bendungan Hilir", "Setiabudi", "Mampang Prapatan", "Warung Jati", "Duren Tiga", "Cipete", "Ampera", "Ragunan", "Pasar Minggu", "Tebet", "Flyover Jatinegara", "Utan Kayu", "Pemuda Rawamangun", "Kayu Putih", "Cempaka Putih", "Galur", "Pasar Senen", "Ancol", "Gunung Sahari", "Pecenongan", "RS Tarakan", "Grogol", "Jelambar", "Indosiar", "Pesing", "Kebon Jeruk", "Pondok Pinang", "Pinang Ranti", "Pulo Gebang", "Cakung", "Pramuka BPKP"].map(name => ({ name: `Halte ${name}`, type: "TJ" })),
    { name: "LRT Rasuna Said", type: "LRT" }, { name: "Stasiun Tebet", type: "KRL" }, { name: "Stasiun Manggarai", type: "KRL" }, { name: "Halte Rasuna Said", type: "TJ" }
  ];
  for (const location of rows) await db.insert(locations).values({ ...location, isVerified: true }).onConflictDoUpdate({ target: locations.name, set: { type: location.type, isVerified: true } });
}

export async function createLocation(name: string, type = "Custom") {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const [location] = await db.insert(locations).values({ name: name.trim(), type, isVerified: false }).onConflictDoUpdate({ target: locations.name, set: {} }).returning();
  if (!location) { const rows = await db.select().from(locations).where(eq(locations.name, name.trim())).limit(1); return rows[0]; }
  const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin"));
  for (const admin of admins) await db.insert(notifications).values({ userId: admin.id, message: "New unverified location added" });
  return location;
}
export async function listUnverifiedLocations() { const db = await getDb(); if (!db) return []; return db.select().from(locations).where(eq(locations.isVerified, false)).orderBy(desc(locations.createdAt)); }
export async function updateLocation(id: number, update: { name?: string; type?: string; isVerified?: boolean }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [location] = await db.update(locations).set(update).where(eq(locations.id, id)).returning(); return location; }
export async function verifyLocation(id: number, isVerified: boolean) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [location] = await db.update(locations).set({ isVerified }).where(eq(locations.id, id)).returning(); return location; }
export async function deleteLocation(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.transaction(async tx => { const linked = await tx.select({ id: tickets.id }).from(tickets).where(eq(tickets.locationId, id)); for (const ticket of linked) { await tx.delete(flags).where(eq(flags.ticketId, ticket.id)); await tx.delete(upvotes).where(eq(upvotes.ticketId, ticket.id)); await tx.delete(comments).where(eq(comments.ticketId, ticket.id)); await tx.delete(tickets).where(eq(tickets.id, ticket.id)); } await tx.delete(locations).where(eq(locations.id, id)); }); return { success: true as const }; }

const ticketSelect = {
  id: tickets.id, issueDesc: tickets.issueDesc, category: tickets.category, photoUrl: tickets.photoUrl, proofUrl: tickets.proofUrl,
  status: tickets.status, urgency: tickets.urgency, authorId: tickets.authorId, assignedTechId: tickets.assignedTechId, startedAt: tickets.startedAt, resolvedAt: tickets.resolvedAt, locationId: tickets.locationId, createdAt: tickets.createdAt, updatedAt: tickets.updatedAt,
  locationName: locations.name, locationType: locations.type, authorName: users.name, authorEmail: users.email, completedAt: tickets.completedAt,
  upvoteCount: count(upvotes.id).as("upvoteCount"),
};

export async function listTickets(statuses?: TicketStatus[], locationId?: number, authorId?: number, assignedTechId?: number) {
  try {
    const db = await getDb(); if (!db) return [];
    const base = db.select(ticketSelect).from(tickets).leftJoin(locations, eq(tickets.locationId, locations.id)).leftJoin(users, eq(tickets.authorId, users.id)).leftJoin(upvotes, eq(tickets.id, upvotes.ticketId)).groupBy(tickets.id, locations.id, users.id);
    const filters = [statuses?.length ? inArray(tickets.status, statuses) : undefined, locationId ? eq(tickets.locationId, locationId) : undefined, authorId ? eq(tickets.authorId, authorId) : undefined, assignedTechId ? eq(tickets.assignedTechId, assignedTechId) : undefined].filter(Boolean) as any[]; const filtered = filters.length ? base.where(and(...filters)) : base;
    return filtered.orderBy(desc(sql`case ${tickets.urgency} when 'critical' then 4 when 'high' then 3 when 'medium' then 2 else 1 end`), desc(count(upvotes.id)), desc(tickets.createdAt));
  } catch (error) {
    console.warn("[Database] Failed to load tickets:", error);
    return [];
  }
}
export async function getTicket(id: number) { const rows = await listTickets(); return rows.find(ticket => ticket.id === id); }
export async function createTicket(input: { issueDesc: string; category?: string; photoUrl: string; authorId: number; locationId: number; urgency: Urgency }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const author = await getUserById(input.authorId); if (author?.isBanned) throw new Error("Banned users cannot submit reports."); const [ticket] = await db.insert(tickets).values(input).returning({ id: tickets.id }); await incrementReputation(input.authorId, 10); await createNotification(input.authorId, "Your report was submitted. Thank you for helping the city move."); return getTicket(ticket.id); }
export async function updateTicket(id: number, update: { status?: TicketStatus; proofUrl?: string; issueDesc?: string; category?: string; urgency?: Urgency; assignedTechId?: number | null; startedAt?: Date | null; resolvedAt?: Date | null; completedAt?: Date | null }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const before = await getTicket(id); const patch = { ...update, ...(update.status === "in_progress" && before?.status !== "in_progress" && !before?.startedAt ? { startedAt: new Date() } : {}), ...(update.status === "resolved" && before?.status !== "resolved" && !before?.resolvedAt ? { resolvedAt: new Date(), completedAt: new Date() } : {}) }; await db.update(tickets).set(patch).where(eq(tickets.id, id)); if (before?.authorId && update.status && update.status !== before.status) await createNotification(before.authorId, `Your ticket status changed to ${update.status.toUpperCase()}.`); if (update.status === "resolved" && before?.status !== "resolved" && before?.authorId) await incrementReputation(before.authorId, 50); return getTicket(id); }
export async function addUpvote(userId: number, ticketId: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); try { await db.insert(upvotes).values({ userId, ticketId }); } catch (error) { if (!String(error).toLowerCase().includes("duplicate")) throw error; } const ticket = await getTicket(ticketId); if (ticket?.authorId && ticket.authorId !== userId) await createNotification(ticket.authorId, "Your report received a new community support."); return ticket; }
export async function hasUpvoted(userId: number, ticketId: number) { const db = await getDb(); if (!db) return false; const rows = await db.select({ id: upvotes.id }).from(upvotes).where(and(eq(upvotes.userId, userId), eq(upvotes.ticketId, ticketId))).limit(1); return rows.length > 0; }
export async function incrementReputation(userId: number, points: number) { const db = await getDb(); if (!db) return; await db.update(users).set({ reputation: sql`${users.reputation} + ${points}`, reputationPoints: sql`${users.reputationPoints} + ${points}` }).where(eq(users.id, userId)); }
export async function listComments(ticketId: number) { const db = await getDb(); if (!db) return []; return db.select({ id: comments.id, text: comments.text, userId: comments.userId, authorName: users.name, authorImage: users.image, createdAt: comments.createdAt }).from(comments).leftJoin(users, eq(comments.userId, users.id)).where(eq(comments.ticketId, ticketId)).orderBy(asc(comments.createdAt)); }
export async function addComment(input: { ticketId: number; userId: number; text: string }) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const author = await getUserById(input.userId); if (author?.isBanned) throw new Error("Banned users cannot comment."); const [comment] = await db.insert(comments).values(input).returning({ id: comments.id }); const ticket = await getTicket(input.ticketId); if (ticket?.authorId && ticket.authorId !== input.userId) await createNotification(ticket.authorId, "Someone added a comment to your report."); return db.select().from(comments).where(eq(comments.id, comment.id)).limit(1); }
export async function updateComment(id: number, userId: number, text: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(comments).set({ text }).where(and(eq(comments.id, id), eq(comments.userId, userId))); return { success: true as const }; }
export async function updateUserImage(userId: number, image: string | null) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.update(users).set({ image }).where(eq(users.id, userId)); return getUserProfile(userId); }
export async function deleteTicket(id: number) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); await db.transaction(async tx => { await tx.delete(flags).where(eq(flags.ticketId, id)); await tx.delete(upvotes).where(eq(upvotes.ticketId, id)); await tx.delete(comments).where(eq(comments.ticketId, id)); await tx.delete(tickets).where(eq(tickets.id, id)); }); return { success: true as const }; }
export async function listNotifications(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)); }
export async function listUnreadNotifications(userId: number) { const db = await getDb(); if (!db) return []; return db.select().from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0))).orderBy(desc(notifications.createdAt)); }
export async function createNotification(userId: number, message: string) { const db = await getDb(); if (!db) return; await db.insert(notifications).values({ userId, message }); }
export async function markNotificationsRead(userId: number) { const db = await getDb(); if (!db) return; await db.update(notifications).set({ isRead: 1 }).where(and(eq(notifications.userId, userId), eq(notifications.isRead, 0))); return { success: true as const }; }
export async function listTechnicians() { const db = await getDb(); if (!db) return []; return db.select({ id: users.id, name: users.name, email: users.email, image: users.image }).from(users).where(eq(users.role, "tech")); }
export async function getUserProfile(id: number) { try { const db = await getDb(); if (!db) return undefined; const rows = await db.select({ id: users.id, username: users.username, name: users.name, email: users.email, image: users.image, loginMethod: users.loginMethod, role: users.role, reputation: users.reputation, reputationPoints: users.reputationPoints, isBanned: users.isBanned }).from(users).where(eq(users.id, id)).limit(1); return rows[0]; } catch (error) { console.warn("[Database] Failed to load profile:", error); return undefined; } }

export async function flagHoax(input: { ticketId: number; reporterId: number; reason?: string }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  await db.insert(hoaxFlags).values({ ticketId: input.ticketId, userId: input.reporterId, reason: input.reason }).onConflictDoNothing();
  return db.select().from(hoaxFlags).where(and(eq(hoaxFlags.ticketId, input.ticketId), eq(hoaxFlags.userId, input.reporterId))).limit(1);
}
export async function listHoaxFlags() {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: hoaxFlags.id, ticketId: hoaxFlags.ticketId, reporterId: hoaxFlags.userId, reason: hoaxFlags.reason, createdAt: hoaxFlags.createdAt, reporterName: users.name }).from(hoaxFlags).leftJoin(users, eq(hoaxFlags.userId, users.id)).orderBy(desc(hoaxFlags.createdAt));
}
export async function updateUser(id: number, update: { username?: string | null; name?: string | null; email?: string | null; role?: Role; reputationPoints?: number; isBanned?: boolean }) {
  const db = await getDb(); if (!db) throw new Error("Database unavailable");
  const patch = { ...update, ...(update.reputationPoints === undefined ? {} : { reputation: update.reputationPoints }) };
  await db.update(users).set(patch).where(eq(users.id, id)); return getUserById(id);
}
export async function setUserBanned(id: number, isBanned: boolean) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const [user] = await db.update(users).set({ isBanned }).where(eq(users.id, id)).returning(); return user; }
export async function reportUser(reporterId: number, reportedUserId: number, reason?: string) { const db = await getDb(); if (!db) throw new Error("Database unavailable"); const admins = await db.select({ id: users.id }).from(users).where(eq(users.role, "admin")); for (const admin of admins) await db.insert(notifications).values({ userId: admin.id, message: `User #${reportedUserId} was reported${reason ? `: ${reason}` : "."}` }); return { success: true as const }; }
export async function importUsers(usersToImport: InsertUser[]) {
  for (const user of usersToImport) await upsertUser(user);
  return { imported: usersToImport.length, count: usersToImport.length };
}
