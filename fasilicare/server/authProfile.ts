export function getProfileImage(userInfo: unknown): string | null {
  if (!userInfo || typeof userInfo !== "object") return null;
  const profile = userInfo as Record<string, unknown>;
  for (const key of ["image", "avatarUrl", "picture"]) {
    if (typeof profile[key] === "string" && profile[key]) return profile[key];
  }
  return null;
}
