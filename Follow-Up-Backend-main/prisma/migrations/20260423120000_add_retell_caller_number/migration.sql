-- AlterTable (IF NOT EXISTS: safe if run manually before `migrate deploy`)
ALTER TABLE "user_settings" ADD COLUMN IF NOT EXISTS "retellCallerNumber" TEXT;
