/*
  Warnings:

  - You are about to drop the column `rawText` on the `lead_transcripts` table. All the data in the column will be lost.
  - Added the required column `transcript` to the `lead_transcripts` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lead_transcripts" DROP COLUMN "rawText",
ADD COLUMN     "transcript" TEXT NOT NULL;
