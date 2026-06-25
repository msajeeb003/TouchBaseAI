-- Add configurator fields to sequences (situation/goal/tone/intensity/channels/intervalDays)
ALTER TABLE "sequences" ADD COLUMN "situation" TEXT;
ALTER TABLE "sequences" ADD COLUMN "goal" TEXT;
ALTER TABLE "sequences" ADD COLUMN "tone" TEXT;
ALTER TABLE "sequences" ADD COLUMN "intensity" TEXT;
ALTER TABLE "sequences" ADD COLUMN "channels" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "sequences" ADD COLUMN "intervalDays" INTEGER;
