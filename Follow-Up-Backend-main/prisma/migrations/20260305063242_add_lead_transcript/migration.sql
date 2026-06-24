-- CreateTable
CREATE TABLE "lead_transcripts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "meetingTitle" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3) NOT NULL,
    "rawText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_transcripts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_transcripts_leadId_idx" ON "lead_transcripts"("leadId");

-- CreateIndex
CREATE INDEX "lead_transcripts_userId_idx" ON "lead_transcripts"("userId");

-- AddForeignKey
ALTER TABLE "lead_transcripts" ADD CONSTRAINT "lead_transcripts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lead_transcripts" ADD CONSTRAINT "lead_transcripts_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
