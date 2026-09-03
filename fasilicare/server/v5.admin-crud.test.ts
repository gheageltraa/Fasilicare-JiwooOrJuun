import { describe, expect, it } from "vitest";
import { createTicket, deleteUser, getPublicProfile, getUserByOpenId, listLocations, listUsers, updateTicket, updateUserRole, upsertUser } from "./db";

describe("V5 admin CRUD and timeline contract", () => {
  it("changes a role and safely removes a user with authored ticket dependencies", async () => {
    const openId = "__fasilicare_admin_crud_user__";
    await upsertUser({ openId, name: "Admin CRUD User", email: "admin-crud-user@example.com" });
    const user = await getUserByOpenId(openId); const location = (await listLocations())[0];
    expect(user && location).toBeTruthy();
    await updateUserRole(user!.id, "tech");
    expect((await getUserByOpenId(openId))?.role).toBe("tech");
    await createTicket({ authorId: user!.id, locationId: location!.id, issueDesc: "Admin CRUD dependent ticket", photoUrl: "https://example.com/admin-crud.jpg", category: "Other", urgency: "low" });
    expect((await deleteUser(user!.id)).success).toBe(true);
    expect((await getUserByOpenId(openId))).toBeUndefined();
  });

  it("persists advanced ticket fields and exposes timestamps to the public profile timeline contract", async () => {
    const openId = "__fasilicare_admin_crud_ticket__";
    await upsertUser({ openId, name: "Timeline Contract User", email: "timeline-contract@example.com" });
    const user = await getUserByOpenId(openId); const location = (await listLocations())[0];
    const ticket = await createTicket({ authorId: user!.id, locationId: location!.id, issueDesc: "Advanced CRUD ticket before edit", photoUrl: "https://example.com/advanced.jpg", category: "Other", urgency: "low" });
    const edited = await updateTicket(ticket!.id, { issueDesc: "Advanced CRUD ticket after edit", category: "Lighting", urgency: "critical", status: "in_progress" });
    expect(edited?.issueDesc).toContain("after edit"); expect(edited?.category).toBe("Lighting"); expect(edited?.urgency).toBe("critical"); expect(edited?.startedAt).toBeInstanceOf(Date);
    const resolved = await updateTicket(ticket!.id, { status: "resolved", proofUrl: "https://example.com/advanced-proof.jpg" });
    const profile = await getPublicProfile(user!.id); const row = profile?.reports.find(item => item.id === ticket!.id);
    expect(resolved?.resolvedAt).toBeInstanceOf(Date); expect(row?.startedAt).toBeInstanceOf(Date); expect(row?.resolvedAt).toBeInstanceOf(Date); expect(row!.resolvedAt!.getTime()).toBeGreaterThanOrEqual(row!.startedAt!.getTime());
    expect((await listUsers()).some(item => item.id === user!.id)).toBe(true);
  });
});
