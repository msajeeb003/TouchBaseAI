-- AlterTable
ALTER TABLE "leads" ALTER COLUMN "company" DROP NOT NULL;
ALTER TABLE "leads" ALTER COLUMN "location" DROP NOT NULL;

-- Normalize empty strings to NULL
UPDATE "leads" SET "company" = NULL WHERE "company" = '';
UPDATE "leads" SET "location" = NULL WHERE "location" = '';
