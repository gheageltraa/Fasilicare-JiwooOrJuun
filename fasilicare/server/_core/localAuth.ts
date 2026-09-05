import type express from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { createLocalUser, getUserByLogin, getUserByOpenId, upsertUser, verifyPassword } from "../db";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

function sendError(res: express.Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

export function registerLocalAuthRoutes(app: express.Application) {
  app.post("/api/auth/supabase", async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const accessToken = typeof req.body?.accessToken === "string" ? req.body.accessToken : "";
    const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY;
    if (!accessToken || !supabaseUrl || !supabaseKey) return sendError(res, 400, "Google sign-in is not configured.");
    try {
      const client = createClient(supabaseUrl, supabaseKey);
      const { data, error } = await client.auth.getUser(accessToken);
      if (error || !data.user?.email) return sendError(res, 401, "Google sign-in session is invalid.");
      const profile = data.user.user_metadata as { full_name?: string; name?: string; avatar_url?: string };
      const openId = `supabase:${data.user.id}`;
      await upsertUser({ openId, email: data.user.email.toLowerCase(), name: profile.full_name ?? profile.name ?? data.user.email, image: profile.avatar_url ?? null, loginMethod: "supabase" });
      const user = await getUserByOpenId(openId);
      if (!user) return sendError(res, 500, "Could not create your Google profile.");
      const token = await sdk.createSessionToken(openId, { name: user.name ?? data.user.email, email: user.email, role: user.role });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Supabase sign-in failed", error);
      return sendError(res, 500, "Could not complete Google sign-in.");
    }
  });

  app.post("/api/register", async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Enter a valid email, username, and password.");
    try {
      if (await getUserByLogin(parsed.data.email)) return sendError(res, 409, "Email already registered.");
      if (await getUserByLogin(parsed.data.username)) return sendError(res, 409, "Username already taken.");
      const user = await createLocalUser(parsed.data);
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? parsed.data.username, email: user.email, role: user.role });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("[Auth] Registration failed", error);
      return sendError(res, 500, "Could not create your account.");
    }
  });

  app.post("/api/login", async (req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return sendError(res, 400, "Enter your email or username and password.");
    try {
      const user = await getUserByLogin(parsed.data.login);
      if (!user?.passwordHash || !(await verifyPassword(parsed.data.password, user.passwordHash))) return sendError(res, 401, "Invalid email/username or password.");
      if (user.isBanned) return sendError(res, 403, "This account is banned.");
      const token = await sdk.createSessionToken(user.openId, { name: user.name ?? user.username ?? "User", email: user.email, role: user.role });
      res.cookie(COOKIE_NAME, token, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      return res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Login failed", error);
      return sendError(res, 500, "Could not sign you in.");
    }
  });
}
