import { describe, expect, it } from "vitest";
import { filterLocations } from "../client/src/lib/locations";

const locations = [
  { id: 1, name: "LRT Rasuna Said", type: "LRT" },
  { id: 2, name: "Stasiun Tebet", type: "KRL" },
  { id: 3, name: "Stasiun Manggarai", type: "KRL" },
  { id: 4, name: "Halte Rasuna Said", type: "TJ" },
];

describe("filterLocations", () => {
  it("filters by station name case-insensitively", () => {
    expect(filterLocations(locations, "manggarai").map(location => location.name)).toEqual(["Stasiun Manggarai"]);
  });
  it("filters by transport type and returns every location for an empty query", () => {
    expect(filterLocations(locations, "krl")).toHaveLength(2);
    expect(filterLocations(locations, "")).toHaveLength(4);
  });
});
