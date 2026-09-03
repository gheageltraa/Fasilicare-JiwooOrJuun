/**
 * Google profile-picture allowlist for a future Next.js App Router migration.
 * The managed FasiliCare runtime currently renders Google avatar URLs with a
 * regular img element, so this file is intentionally not imported by Vite.
 */
module.exports = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "lh3.googleusercontent.com" }],
  },
};
