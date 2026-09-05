ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "username" varchar(64);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;
CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" ("username");