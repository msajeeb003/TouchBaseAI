-- Default new leads to "Not Active"
ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'Not Active';

-- Leads with an active sequence should show as Active
UPDATE "leads" AS l
SET "status" = 'Active'
WHERE EXISTS (
  SELECT 1 FROM "sequences" AS s
  WHERE s."leadId" = l."id" AND s."status" = 'active'
);

-- Legacy default "Processing" -> "Not Active" when no longer used as business status
UPDATE "leads"
SET "status" = 'Not Active'
WHERE "status" = 'Processing';
