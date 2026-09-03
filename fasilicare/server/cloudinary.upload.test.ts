import { describe, expect, it, vi } from "vitest";
import { uploadImageToCloudinary } from "../client/src/lib/cloudinary";

describe("uploadImageToCloudinary", () => {
  it("posts the file and returns Cloudinary secure_url", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ secure_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg" }), { status: 200, headers: { "content-type": "application/json" } }));
    const result = await uploadImageToCloudinary(new File(["image-bytes"], "evidence.jpg", { type: "image/jpeg" }), "demo-cloud", "fasilicare_preset", fetcher);
    expect(result.secure_url).toContain("res.cloudinary.com");
    expect(fetcher).toHaveBeenCalledWith("https://api.cloudinary.com/v1_1/demo-cloud/image/upload", expect.objectContaining({ method: "POST", body: expect.any(FormData) }));
  });
  it("rejects non-image files before a network request", async () => {
    const fetcher = vi.fn();
    await expect(uploadImageToCloudinary(new File(["text"], "notes.txt", { type: "text/plain" }), "demo-cloud", "fasilicare_preset", fetcher)).rejects.toThrow("image file");
    expect(fetcher).not.toHaveBeenCalled();
  });
});
