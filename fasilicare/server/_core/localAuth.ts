import type { Express, Request, Response } from "express";
import { z } from "zod";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { createLocalUser, getUserByLogin, verifyPassword } from "../db";

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().trim().min(3).max(64).regex(/^[a-zA-Z0-9_.-]+$/),
  password: z.string().min(8).max(128),
});
const loginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

function sendError(res: Response, status: number, message: string) {
  res.status(status).json({ error: message });
}

export function registerLocalAuthRoutes(app: Express) {
  app.post("/api/register", async (req: Request, res: Response) => {
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

  app.post("/api/login", async (req: Request, res: Response) => {
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
