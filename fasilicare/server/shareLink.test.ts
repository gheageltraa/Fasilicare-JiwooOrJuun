import { describe, expect, it, vi } from "vitest";
import { copyShareLink } from "../client/src/lib/shareLink";

describe("copyShareLink", () => {
  it("writes the ticket URL to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await copyShareLink("https://fasilicare.example/ticket/42", { writeText });
    expect(writeText).toHaveBeenCalledWith("https://fasilicare.example/ticket/42");
  });

  it("surfaces clipboard failures for the UI fallback", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("permission denied"));
    await expect(copyShareLink("https://fasilicare.example/ticket/42", { writeText })).rejects.toThrow("permission denied");
  });
});
