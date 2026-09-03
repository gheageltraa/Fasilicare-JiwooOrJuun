export type CloudinaryUploadResult = { secure_url: string };
export type CloudinaryUploadError = { error?: { message?: string } };

export async function uploadImageToCloudinary(file: File, cloudName: string, uploadPreset: string, fetcher: typeof fetch = fetch): Promise<CloudinaryUploadResult> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Please choose an image smaller than 10 MB.");
  const form = new FormData(); form.append("file", file); form.append("upload_preset", uploadPreset);
  const response = await fetcher(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  const data = await response.json() as CloudinaryUploadResult & CloudinaryUploadError;
  if (!response.ok || !data.secure_url) throw new Error(data.error?.message || "Cloudinary upload failed.");
  return { secure_url: data.secure_url };
}
