import { describe, expect, it } from "vitest";
import { getProfileImage } from "./authProfile";

describe("Google profile image mapping", () => {
  it("prefers the supported avatar fields and returns null when absent", () => {
    expect(getProfileImage({ picture: "https://example.com/google-avatar.jpg" })).toBe("https://example.com/google-avatar.jpg");
    expect(getProfileImage({ avatarUrl: "https://example.com/avatar.png", picture: "fallback" })).toBe("https://example.com/avatar.png");
    expect(getProfileImage({ name: "No image" })).toBeNull();
  });
});
