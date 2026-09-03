import { describe, expect, it } from "vitest";
import { addComment, addUpvote, createTicket, deleteTicket, getUserByOpenId, getTicket, hasUpvoted, listComments, listLocations, upsertUser } from "./db";

describe("admin ticket deletion", () => {
  it("removes dependent upvotes and comments before deleting a ticket", async () => {
    const authorOpenId = "__fasilicare_delete_author__"; const supporterOpenId = "__fasilicare_delete_supporter__";
    await upsertUser({ openId: authorOpenId, name: "Delete Author", email: "delete-author@example.com" }); await upsertUser({ openId: supporterOpenId, name: "Delete Supporter", email: "delete-supporter@example.com" });
    const author = await getUserByOpenId(authorOpenId); const supporter = await getUserByOpenId(supporterOpenId); const location = (await listLocations())[0];
    expect(author && supporter && location).toBeTruthy();
    const ticket = await createTicket({ authorId: author!.id, locationId: location!.id, issueDesc: "Regression ticket for safe admin deletion", photoUrl: "https://example.com/delete.jpg", category: "Other", urgency: "low" });
    expect(ticket).toBeTruthy();
    await addUpvote(supporter!.id, ticket!.id); await addComment({ ticketId: ticket!.id, userId: supporter!.id, text: "Related comment for deletion test" });
    expect(await hasUpvoted(supporter!.id, ticket!.id)).toBe(true); expect(await listComments(ticket!.id)).toHaveLength(1);
    await deleteTicket(ticket!.id);
    expect(await getTicket(ticket!.id)).toBeUndefined(); expect(await hasUpvoted(supporter!.id, ticket!.id)).toBe(false); expect(await listComments(ticket!.id)).toHaveLength(0);
  });
});
