import { describe, expect, it } from "vitest";
import { listTickets } from "./db";

describe("tickets.feed", () => {
  it("executes the pending feed query with grouped upvote counting", async () => {
    const rows = await listTickets(["pending"]);
    expect(Array.isArray(rows)).toBe(true);
    for (const row of rows) {
      expect(typeof row.id).toBe("number");
      expect(typeof row.upvoteCount).toBe("number");
      expect(row.status).toBe("pending");
    }
  }, 15_000);
});
