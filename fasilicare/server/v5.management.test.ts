import { describe, expect, it } from "vitest";
import { createTicket, getPublicProfile, getUserByOpenId, listLocations, listUsers, updateTicket, upsertUser } from "./db";

describe("V5 management surfaces", () => {
  it("exposes public profile reports and admin user fields", async () => {
    const openId = "__fasilicare_v5_surface_author__";
    await upsertUser({ openId, name: "V5 Surface Author", email: "v5-surface@example.com" });
    const author = await getUserByOpenId(openId); const location = (await listLocations())[0];
    expect(author && location).toBeTruthy();
    const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "V5 management surface regression report", photoUrl: "https://example.com/v5.jpg", category: "Other", urgency: "low" });
    await updateTicket(ticket!.id, { urgency: "critical" });
    const profile = await getPublicProfile(author!.id); const users = await listUsers();
    expect(profile?.reports.some(row => row.id === ticket!.id)).toBe(true);
    expect(users.some(row => row.id === author!.id && row.reputation >= 10)).toBe(true);
    expect((await getPublicProfile(author!.id))?.reports.find(row => row.id === ticket!.id)?.urgency).toBe("critical");
  });
});
