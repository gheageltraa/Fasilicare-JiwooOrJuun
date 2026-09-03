import { describe, expect, it } from "vitest";
import { getUserByOpenId, getUserProfile, upsertUser } from "./db";

describe("auth image persistence", () => {
  it("persists and updates the Google avatar through user upsert", async () => {
    const openId = "__fasilicare_avatar_regression__";
    await upsertUser({ openId, name: "Avatar Regression", email: "avatar-regression@example.com", loginMethod: "google", image: "https://example.com/avatar-v1.jpg" });
    expect((await getUserByOpenId(openId))?.image).toBe("https://example.com/avatar-v1.jpg");
    expect((await getUserProfile((await getUserByOpenId(openId))!.id))?.image).toBe("https://example.com/avatar-v1.jpg");
    await upsertUser({ openId, image: "https://example.com/avatar-v2.jpg", lastSignedIn: new Date() });
    expect((await getUserByOpenId(openId))?.image).toBe("https://example.com/avatar-v2.jpg");
  });
});
