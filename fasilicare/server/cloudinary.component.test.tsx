// @vitest-environment jsdom
import { fireEvent, render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const uploadMock = vi.fn();
vi.mock("../client/src/lib/cloudinary", () => ({ uploadImageToCloudinary: uploadMock }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import { CloudinaryUpload } from "../client/src/components/FasiliCareShell";

describe("CloudinaryUpload", () => {
  beforeEach(() => {
    uploadMock.mockReset();
    uploadMock.mockResolvedValue({ secure_url: "https://res.cloudinary.com/demo/image/upload/evidence.jpg" });
  });

  it("uploads a selected image and returns secure_url to the parent", async () => {
    const onUploaded = vi.fn();
    const view = render(<CloudinaryUpload label="Upload evidence photo" onUploaded={onUploaded} />);
    const file = new File(["image-bytes"], "evidence.jpg", { type: "image/jpeg" });
    fireEvent.change(view.getByLabelText("Upload evidence photo").querySelector("input")!, { target: { files: [file] } });
    await waitFor(() => expect(onUploaded).toHaveBeenCalledWith("https://res.cloudinary.com/demo/image/upload/evidence.jpg"));
    expect(uploadMock).toHaveBeenCalledWith(file, expect.any(String), expect.any(String));
  });
});
