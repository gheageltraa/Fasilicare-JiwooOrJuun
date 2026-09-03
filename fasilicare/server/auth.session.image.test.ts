import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getUserByOpenId, getUserProfile, upsertUser } from "./db";
import { sdk } from "./_core/sdk";
import { COOKIE_NAME } from "../shared/const";

describe("authenticated avatar contract", () => {
  it("returns the newest avatar through a real session after re-login", async () => {
    const openId = "__fasilicare_session_avatar__";
    await upsertUser({ openId, name: "Session Avatar", email: "session-avatar@example.com", loginMethod: "google", image: "https://example.com/avatar-a.jpg" });
    const firstToken = await sdk.createSessionToken(openId, { name: "Session Avatar" });
    const firstUser = await sdk.authenticateRequest({ headers: { cookie: `${COOKIE_NAME}=${firstToken}` } } as any);
    expect(firstUser.image).toBe("https://example.com/avatar-a.jpg");

    await upsertUser({ openId, image: "https://example.com/avatar-b.jpg", lastSignedIn: new Date() });
    const secondToken = await sdk.createSessionToken(openId, { name: "Session Avatar" });
    const secondUser = await sdk.authenticateRequest({ headers: { cookie: `${COOKIE_NAME}=${secondToken}` } } as any);
    expect(secondUser.image).toBe("https://example.com/avatar-b.jpg");

    const profile = await getUserProfile(secondUser.id);
    expect(profile?.image).toBe("https://example.com/avatar-b.jpg");
    const sessionUser = await appRouter.createCaller({ user: secondUser, req: {} as any, res: {} as any }).auth.me();
    expect(sessionUser?.image).toBe("https://example.com/avatar-b.jpg");
    expect((await getUserByOpenId(openId))?.image).toBe("https://example.com/avatar-b.jpg");
  });
});
