/// <reference types="node" />
import { defineConfig } from "drizzle-kit";
import "dotenv/config";
import { getDatabaseUrl } from "./server/_core/databaseUrl";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: getDatabaseUrl(process.env.DATABASE_URL, process.env.DATABASE_POOLER_REGION),
  },
  migrations: {
    schema: "public",
    table: "drizzle_migrations",
  },
});