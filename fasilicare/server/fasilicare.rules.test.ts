import { describe, expect, it } from "vitest";
import { isLeadEmail, LEAD_EMAILS } from "./db";

describe("FasiliCare access rules", () => {
  it("recognizes only the two lead emails for God Mode", () => {
    expect(LEAD_EMAILS.size).toBe(2);
    expect(isLeadEmail("dhanny.aljael@gmail.com")).toBe(true);
    expect(isLeadEmail("GHEA.GELTRA@GMAIL.COM")).toBe(true);
    expect(isLeadEmail("someone@example.com")).toBe(false);
  });
});
