-- AlterTable
ALTER TABLE "sequence_steps" ADD COLUMN "externalMessageId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "sequence_steps_externalMessageId_key" ON "sequence_steps"("externalMessageId");
