import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { addUpvote, createTicket, getUserByOpenId, listLocations, upsertUser } from "./db";
import type { TrpcContext } from "./_core/context";

function adminContext(user: NonNullable<TrpcContext["user"]>): TrpcContext { return { user, req: { protocol: "https", headers: {} } as TrpcContext["req"], res: {} as TrpcContext["res"] }; }

describe("community validation threshold", () => {
  it("blocks admin approval until a community support exists", async () => {
    await upsertUser({ openId: "__validation_admin__", email: "dhanny.aljael@gmail.com", name: "Lead Admin", role: "admin" }); await upsertUser({ openId: "__validation_author__", email: "validation-author@example.com", name: "Author" }); await upsertUser({ openId: "__validation_voter__", email: "validation-voter@example.com", name: "Voter" });
    const admin = await getUserByOpenId("__validation_admin__"); const author = await getUserByOpenId("__validation_author__"); const voter = await getUserByOpenId("__validation_voter__"); const location = (await listLocations())[0];
    expect(admin && author && voter && location).toBeTruthy();
    const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Validation threshold regression ticket", photoUrl: "https://example.com/validation.jpg", category: "Other", urgency: "high" });
    const caller = appRouter.createCaller(adminContext(admin!));
    await expect(caller.tickets.updateStatus({ ticketId: ticket!.id, status: "approved" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
    await addUpvote(voter!.id, ticket!.id);
    await expect(caller.tickets.updateStatus({ ticketId: ticket!.id, status: "approved" })).resolves.toBeTruthy();
  });
});

  it("blocks assignment before validation and allows it after support", async () => {
    await upsertUser({ openId: "__validation_admin_assign__", email: "dhanny.aljael@gmail.com", name: "Lead Admin", role: "admin" }); await upsertUser({ openId: "__validation_author_assign__", email: "validation-author-assign@example.com", name: "Author" }); await upsertUser({ openId: "__validation_tech__", email: "validation-tech@example.com", name: "Tech", role: "tech" }); await upsertUser({ openId: "__validation_voter_assign__", email: "validation-voter-assign@example.com", name: "Voter" });
    const admin = await getUserByOpenId("__validation_admin_assign__"); const author = await getUserByOpenId("__validation_author_assign__"); const tech = await getUserByOpenId("__validation_tech__"); const voter = await getUserByOpenId("__validation_voter_assign__"); const location = (await listLocations())[0]; const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Assignment validation regression ticket", photoUrl: "https://example.com/assign.jpg", category: "Other", urgency: "medium" }); const caller = appRouter.createCaller(adminContext(admin!));
    await expect(caller.tickets.assign({ ticketId: ticket!.id, technicianId: tech!.id })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" }); await addUpvote(voter!.id, ticket!.id); await expect(caller.tickets.assign({ ticketId: ticket!.id, technicianId: tech!.id })).resolves.toBeTruthy();
  });

  it("blocks adminEdit status transitions before validation and allows them after support", async () => {
    await upsertUser({ openId: "__validation_admin_edit__", email: "dhanny.aljael@gmail.com", name: "Lead Admin", role: "admin" }); await upsertUser({ openId: "__validation_author_edit__", email: "validation-author-edit@example.com", name: "Author" }); await upsertUser({ openId: "__validation_voter_edit__", email: "validation-voter-edit@example.com", name: "Voter" });
    const admin = await getUserByOpenId("__validation_admin_edit__"); const author = await getUserByOpenId("__validation_author_edit__"); const voter = await getUserByOpenId("__validation_voter_edit__"); const location = (await listLocations())[0]; const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Admin edit validation regression ticket", photoUrl: "https://example.com/edit.jpg", category: "Other", urgency: "medium" }); const caller = appRouter.createCaller(adminContext(admin!));
    await expect(caller.tickets.adminEdit({ ticketId: ticket!.id, issueDesc: "Admin edit validation regression ticket updated", category: "Lighting", status: "approved" })).rejects.toMatchObject({ code: "PRECONDITION_FAILED" }); await addUpvote(voter!.id, ticket!.id); await expect(caller.tickets.adminEdit({ ticketId: ticket!.id, issueDesc: "Admin edit validation regression ticket resolved", category: "Lighting", status: "resolved" })).resolves.toBeTruthy();
  });
