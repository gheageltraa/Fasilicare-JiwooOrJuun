# FasiliCare implementation notes

## Runtime and authentication constraint

FasiliCare is delivered inside the managed full-stack runtime initialized for this project. That runtime provides a single supplied OAuth entrypoint and session contract through the existing server authentication layer. It is not a standalone Next.js 14 App Router workspace and it does not expose a configurable NextAuth.js Google provider without migrating the application away from the managed runtime.

The product surface therefore presents a Google-only sign-in experience and implements the requested lead-email role rules, authenticated reporting, admin triage, technician workflows, and role-aware navigation using the supplied session mechanism. The backend remains protected by the runtime’s authenticated tRPC context rather than browser-only guards.

## Standalone NextAuth migration path

If standalone NextAuth.js is mandatory for competition submission, migrate the project to a Next.js 14 App Router workspace, add `next-auth` with `GoogleProvider`, persist the Prisma models from the competition schema, and move the current typed procedures into route handlers under `src/app/api`. The current UI copy, data model vocabulary, role rules, and workflow states are intentionally structured to make that migration direct.

## Data integrity

The delivered database uses the managed template’s Drizzle/MySQL-compatible connection contract rather than the pasted Prisma/PostgreSQL contract. Locations, tickets, and upvotes are persisted with unique upvote enforcement and foreign-key constraints. The seed entrypoint is `drizzle/seed.ts`.
