import { describe, expect, it, vi } from "vitest";
import { copyShareLink } from "./shareLink";

describe("copyShareLink", () => {
  it("writes the current ticket URL to the clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    await copyShareLink("https://fasilicare.example/ticket/42", { writeText });
    expect(writeText).toHaveBeenCalledWith("https://fasilicare.example/ticket/42");
  });

  it("surfaces clipboard failures for the UI fallback", async () => {
    const error = new Error("permission denied");
    const writeText = vi.fn().mockRejectedValue(error);
    await expect(copyShareLink("https://fasilicare.example/ticket/42", { writeText })).rejects.toThrow("permission denied");
  });
});
