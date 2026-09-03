import { describe, expect, it } from "vitest";
import { createTicket, getUserByOpenId, listLocations, listTickets, updateTicket, upsertUser } from "./db";

describe("technician assignment", () => {
  it("filters the task board by assigned technician", async () => {
    const authorOpenId = "__fasilicare_assignment_author__"; const techOpenId = "__fasilicare_assignment_tech__";
    await upsertUser({ openId: authorOpenId, name: "Assignment Author", email: "assignment-author@example.com" }); await upsertUser({ openId: techOpenId, name: "Assignment Tech", email: "assignment-tech@example.com", role: "tech" });
    const author = await getUserByOpenId(authorOpenId); const tech = await getUserByOpenId(techOpenId); const location = (await listLocations())[0];
    expect(author && tech && location).toBeTruthy();
    const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Regression ticket for technician assignment", photoUrl: "https://example.com/assignment.jpg", category: "Other", urgency: "low" });
    await updateTicket(ticket!.id, { assignedTechId: tech!.id, status: "approved" });
    const tasks = await listTickets(["approved", "in_progress"], undefined, undefined, tech!.id);
    expect(tasks.some(row => row.id === ticket!.id)).toBe(true);
  });
});
