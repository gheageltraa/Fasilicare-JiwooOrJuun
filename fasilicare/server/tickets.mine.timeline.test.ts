import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { createTicket, getUserByOpenId, listLocations, updateTicket, upsertUser } from "./db";

describe("My Reports timeline contract", () => {
  it("returns startedAt and resolvedAt through tickets.mine", async () => {
    await upsertUser({ openId: "__fasilicare_mine_timeline__", name: "Timeline Commuter", email: "mine-timeline@example.com" });
    const user = await getUserByOpenId("__fasilicare_mine_timeline__"); const location = (await listLocations())[0];
    const ticket = await createTicket({ authorId: user!.id, locationId: location!.id, issueDesc: "Dedicated My Reports timeline regression", photoUrl: "https://example.com/mine.jpg", category: "Other", urgency: "low" });
    await updateTicket(ticket!.id, { status: "in_progress" }); await updateTicket(ticket!.id, { status: "resolved", proofUrl: "https://example.com/mine-proof.jpg" });
    const mine = await appRouter.createCaller({ user: user!, req: {} as any, res: {} as any }).tickets.mine(); const row = mine.find(item => item.id === ticket!.id);
    expect(row?.startedAt).toBeInstanceOf(Date); expect(row?.resolvedAt).toBeInstanceOf(Date);
  });
});
