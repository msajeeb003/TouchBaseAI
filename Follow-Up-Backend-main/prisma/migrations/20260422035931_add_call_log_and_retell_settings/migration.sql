-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "retellAgentId" TEXT,
ADD COLUMN     "retellApiKey" TEXT;

-- CreateTable
CREATE TABLE "call_logs" (
    "id" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "retellCallId" TEXT NOT NULL,
    "callStatus" TEXT NOT NULL,
    "duration" INTEGER,
    "recordingUrl" TEXT,
    "transcript" TEXT,
    "disconnectionReason" TEXT,
    "fromNumber" TEXT,
    "toNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "call_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "call_logs_retellCallId_key" ON "call_logs"("retellCallId");

-- CreateIndex
CREATE INDEX "call_logs_stepId_idx" ON "call_logs"("stepId");

-- CreateIndex
CREATE INDEX "call_logs_userId_idx" ON "call_logs"("userId");

-- CreateIndex
CREATE INDEX "call_logs_retellCallId_idx" ON "call_logs"("retellCallId");

-- AddForeignKey
ALTER TABLE "call_logs" ADD CONSTRAINT "call_logs_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "sequence_steps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
