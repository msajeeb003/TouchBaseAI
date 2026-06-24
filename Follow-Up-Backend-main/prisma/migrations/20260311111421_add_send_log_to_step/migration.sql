-- AlterTable
ALTER TABLE "sequence_steps" ADD COLUMN     "sendLog" TEXT;

-- AlterTable
ALTER TABLE "sequences" ALTER COLUMN "totalSteps" DROP DEFAULT;
