import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { addComment, addUpvote, createNotification, createTicket, deleteTicket, deleteUser, getPublicProfile, getTicket, getUserById, getUserProfile, hasUpvoted, isLeadEmail, COMMUNITY_VALIDATION_THRESHOLD, listComments, listLocations, listNotifications, listUnreadNotifications, listTickets, listTechnicians, listUsers, markNotificationsRead, seedLocations, updateComment, updateTicket, updateUserImage, updateUserRole } from "./db";

const roleSchema = z.enum(["user", "admin", "tech"]);
async function ensureValidated(ticketId: number, status: string) { const ticket = await getTicket(ticketId); if (!ticket) throw new TRPCError({ code: "NOT_FOUND", message: "Ticket not found." }); if ((status === "approved" || status === "resolved") && ticket.upvoteCount < COMMUNITY_VALIDATION_THRESHOLD) throw new TRPCError({ code: "PRECONDITION_FAILED", message: `Community validation needs at least ${COMMUNITY_VALIDATION_THRESHOLD} support.` }); return ticket; }
const statusSchema = z.enum(["pending", "approved", "in_progress", "resolved"]);
const urgencySchema = z.enum(["low", "medium", "high", "critical"]); const categorySchema = z.enum(["AC", "Elevator", "Door", "Lighting", "Seat", "Toilet", "Escalator", "Other"]);
const leadOnly = protectedProcedure.use(({ ctx, next }) => {
  if (!isLeadEmail(ctx.user.email)) throw new TRPCError({ code: "FORBIDDEN", message: "Only FasiliCare leads can use God Mode." });
  return next();
});
const techProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "tech") throw new TRPCError({ code: "FORBIDDEN", message: "Technician access required." });
  return next();
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { ctx.res.clearCookie(COOKIE_NAME, { ...getSessionCookieOptions(ctx.req), maxAge: -1 }); return { success: true } as const; }),
  }),
  locations: router({ list: publicProcedure.query(() => listLocations()), seed: protectedProcedure.mutation(() => seedLocations()) }),
  tickets: router({
    feed: publicProcedure.query(() => listTickets(["pending", "in_progress"])),
    resolved: publicProcedure.query(() => listTickets(["resolved"])),
    detail: publicProcedure.input(z.object({ ticketId: z.number().int().positive() })).query(({ input }) => getTicket(input.ticketId)),
    comments: publicProcedure.input(z.object({ ticketId: z.number().int().positive() })).query(({ input }) => listComments(input.ticketId)),
    mine: protectedProcedure.query(({ ctx }) => listTickets(undefined, undefined, ctx.user.id)),
    triage: adminProcedure.query(() => listTickets(["pending", "approved", "in_progress"])),
    tasks: techProcedure.query(({ ctx }) => listTickets(["approved", "in_progress"], undefined, undefined, ctx.user.id)),
    create: protectedProcedure.input(z.object({ issueDesc: z.string().trim().min(12).max(500), category: categorySchema.default("Other"), photoUrl: z.string().url(), locationId: z.number().int().positive(), urgency: urgencySchema.default("low") })).mutation(({ ctx, input }) => createTicket({ ...input, authorId: ctx.user.id })),
    recentAtLocation: protectedProcedure.input(z.object({ locationId: z.number().int().positive() })).query(({ input }) => listTickets(["pending", "approved", "in_progress"], input.locationId)),
    upvote: protectedProcedure.input(z.object({ ticketId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { if (await hasUpvoted(ctx.user.id, input.ticketId)) throw new TRPCError({ code: "CONFLICT", message: "You already supported this report." }); return addUpvote(ctx.user.id, input.ticketId); }),
    updateStatus: adminProcedure.input(z.object({ ticketId: z.number().int().positive(), status: z.enum(["approved", "in_progress"]) })).mutation(async ({ input }) => { await ensureValidated(input.ticketId, input.status); return updateTicket(input.ticketId, { status: input.status }); }),
    adminEdit: adminProcedure.input(z.object({ ticketId: z.number().int().positive(), issueDesc: z.string().trim().min(12).max(500), category: categorySchema, urgency: urgencySchema.default("low"), status: statusSchema })).mutation(async ({ input }) => { await ensureValidated(input.ticketId, input.status); return updateTicket(input.ticketId, { issueDesc: input.issueDesc, category: input.category, urgency: input.urgency, status: input.status }); }),
    technicians: adminProcedure.query(() => listTechnicians()),
    assign: adminProcedure.input(z.object({ ticketId: z.number().int().positive(), technicianId: z.number().int().positive() })).mutation(async ({ input }) => { const technicians = await listTechnicians(); if (!technicians.some(tech => tech.id === input.technicianId)) throw new TRPCError({ code: "BAD_REQUEST", message: "Selected user is not a technician." }); await ensureValidated(input.ticketId, "approved"); return updateTicket(input.ticketId, { assignedTechId: input.technicianId, status: "approved" }); }),
    adminDelete: adminProcedure.input(z.object({ ticketId: z.number().int().positive() })).mutation(({ input }) => deleteTicket(input.ticketId)),
    startRepair: techProcedure.input(z.object({ ticketId: z.number().int().positive() })).mutation(({ input }) => updateTicket(input.ticketId, { status: "in_progress", startedAt: new Date() })),
    resolve: techProcedure.input(z.object({ ticketId: z.number().int().positive(), proofUrl: z.string().url() })).mutation(({ input }) => updateTicket(input.ticketId, { status: "resolved", proofUrl: input.proofUrl, resolvedAt: new Date() })),
    addComment: protectedProcedure.input(z.object({ ticketId: z.number().int().positive(), text: z.string().trim().min(2).max(500) })).mutation(({ ctx, input }) => addComment({ ...input, userId: ctx.user.id })),
    editComment: protectedProcedure.input(z.object({ commentId: z.number().int().positive(), text: z.string().trim().min(2).max(500) })).mutation(({ ctx, input }) => updateComment(input.commentId, ctx.user.id, input.text)),
  }),
  admin: router({ users: adminProcedure.query(() => listUsers()), updateUserRole: adminProcedure.input(z.object({ userId: z.number().int().positive(), role: roleSchema })).mutation(({ input }) => updateUserRole(input.userId, input.role)), deleteUser: adminProcedure.input(z.object({ userId: z.number().int().positive() })).mutation(({ input }) => deleteUser(input.userId)), tickets: adminProcedure.query(() => listTickets()), forceUpdate: adminProcedure.input(z.object({ ticketId: z.number().int().positive(), status: statusSchema })).mutation(({ input }) => updateTicket(input.ticketId, { status: input.status })), deleteTicket: adminProcedure.input(z.object({ ticketId: z.number().int().positive() })).mutation(({ input }) => deleteTicket(input.ticketId)) }),
  publicProfiles: router({ detail: publicProcedure.input(z.object({ userId: z.number().int().positive() })).query(({ input }) => getPublicProfile(input.userId)) }),
  analytics: adminProcedure.query(async () => { const rows = await listTickets(); const byCategory = rows.reduce<Record<string, number>>((acc, row) => { const key = row.category || "Other"; acc[key] = (acc[key] || 0) + 1; return acc; }, {}); const byLocation = rows.reduce<Record<string, number>>((acc, row) => { const key = row.locationName || "Unknown"; acc[key] = (acc[key] || 0) + 1; return acc; }, {}); return { total: rows.length, resolved: rows.filter(row => row.status === "resolved").length, byCategory, byLocation }; }),
  notifications: router({
    unread: protectedProcedure.query(({ ctx }) => listUnreadNotifications(ctx.user.id)), history: protectedProcedure.query(({ ctx }) => listNotifications(ctx.user.id)),
    markRead: protectedProcedure.mutation(({ ctx }) => markNotificationsRead(ctx.user.id)),
  }),
  user: router({
    role: leadOnly.input(z.object({ role: roleSchema })).mutation(async ({ ctx, input }) => updateUserRole(ctx.user.id, input.role)),
    profile: protectedProcedure.query(({ ctx }) => getUserProfile(ctx.user.id)),
    updateImage: protectedProcedure.input(z.object({ image: z.string().url() })).mutation(({ ctx, input }) => updateUserImage(ctx.user.id, input.image)),
  }),
});
export type AppRouter = typeof appRouter;
