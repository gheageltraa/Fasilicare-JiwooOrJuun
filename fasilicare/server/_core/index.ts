import "dotenv/config";
import express from "express";
import type { Request as ExRequest, Response as ExResponse, Application as ExApp, NextFunction as ExNext } from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerLocalAuthRoutes } from "./localAuth.js";
import { registerStorageProxy } from "./storageProxy.js";
import { appRouter } from "../routers.js";
import { createContext } from "./context.js";
import { setupVite } from "./vite.js";

export const app = express();

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

export async function createApp(appInstance = app, server = createServer(appInstance)) {
  // Configure body parser with larger size limit for file uploads
  appInstance.use(express.json({ limit: "50mb" }));
  appInstance.use(express.urlencoded({ limit: "50mb", extended: true }));
  appInstance.get("/api/health", (_req: ExRequest, res: ExResponse) => res.json({ status: "ok" }));
  registerStorageProxy(appInstance);
  registerLocalAuthRoutes(appInstance);
  // tRPC API
  appInstance.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // Vercel serves the frontend separately; only local development needs Vite.
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    await setupVite(appInstance, server);
  }

  return appInstance;
}

async function startServer() {
  const server = createServer(app);
  await createApp(app, server);
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  startServer().catch(console.error);
}

export default app;
