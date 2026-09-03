import { describe, expect, it } from "vitest";
import { listLocations } from "./db";

describe("report locations", () => {
  it("provides the seeded transit locations for search", async () => {
    const rows = await listLocations();
    expect(rows.map(row => row.name)).toEqual(expect.arrayContaining([
      "LRT Rasuna Said",
      "Stasiun Tebet",
      "Stasiun Manggarai",
      "Halte Rasuna Said",
    ]));
  }, 15_000);
});
