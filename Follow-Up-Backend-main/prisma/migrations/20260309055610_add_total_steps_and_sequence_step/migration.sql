/*
  Warnings:

  - Added the required column `totalSteps` to the `sequences` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "sequences" ADD COLUMN     "totalSteps" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "sequence_steps" (
    "id" TEXT NOT NULL,
    "sequenceId" TEXT NOT NULL,
    "stepOrder" INTEGER NOT NULL,
    "stepType" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequence_steps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sequence_steps_sequenceId_idx" ON "sequence_steps"("sequenceId");

-- CreateIndex
CREATE UNIQUE INDEX "sequence_steps_sequenceId_stepOrder_key" ON "sequence_steps"("sequenceId", "stepOrder");

-- AddForeignKey
ALTER TABLE "sequence_steps" ADD CONSTRAINT "sequence_steps_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "sequences"("id") ON DELETE CASCADE ON UPDATE CASCADE;
