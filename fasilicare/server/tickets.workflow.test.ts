import { describe, expect, it } from "vitest";
import { createTicket, getUserByOpenId, listLocations, updateTicket } from "./db";

describe("technician repair timestamps", () => {
  it("records startedAt and resolvedAt on workflow transitions", async () => {
    const authorOpenId = "__fasilicare_workflow_author__";
    await import("./db").then(({ upsertUser }) => upsertUser({ openId: authorOpenId, name: "Workflow Author", email: "workflow-author@example.com" }));
    const author = await getUserByOpenId(authorOpenId); const location = (await listLocations())[0];
    expect(author && location).toBeTruthy();
    const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Regression ticket for repair timestamps", photoUrl: "https://example.com/workflow.jpg", category: "Other", urgency: "low" });
    const started = await updateTicket(ticket!.id, { status: "in_progress" });
    expect(started?.startedAt).toBeInstanceOf(Date); expect(started?.resolvedAt).toBeNull();
    const resolved = await updateTicket(ticket!.id, { status: "resolved", proofUrl: "https://example.com/proof.jpg" });
    expect(resolved?.startedAt).toBeInstanceOf(Date); expect(resolved?.resolvedAt).toBeInstanceOf(Date); expect(resolved!.resolvedAt!.getTime()).toBeGreaterThanOrEqual(resolved!.startedAt!.getTime());
  });
});
