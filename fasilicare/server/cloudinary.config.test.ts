import { describe, expect, it } from "vitest";

describe("Cloudinary configuration", () => {
  it("builds the expected unsigned upload endpoint", () => {
    const cloud = process.env.VITE_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    expect(cloud).toBeTruthy();
    expect(preset).toBeTruthy();
    expect(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`).toMatch(/^https:\/\/api\.cloudinary\.com\/v1_1\/[^/]+\/image\/upload$/);
  });

  const liveTest = process.env.RUN_CLOUDINARY_LIVE_TEST === "1" ? it : it.skip;
  liveTest("accepts the configured unsigned upload preset when live smoke testing is enabled", async () => {
    const cloud = process.env.VITE_CLOUDINARY_CLOUD_NAME!;
    const preset = process.env.VITE_CLOUDINARY_UPLOAD_PRESET!;
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: "POST", body: (() => { const form = new FormData(); form.append("upload_preset", preset); return form; })() });
    const payload = await response.json() as { error?: { message?: string } };
    expect(response.status).not.toBe(404);
    expect(payload.error?.message).not.toMatch(/upload preset not found/i);
  }, 15_000);
});
