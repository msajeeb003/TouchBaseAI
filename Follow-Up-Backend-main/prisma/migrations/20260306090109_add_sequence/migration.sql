-- CreateTable
CREATE TABLE "sequences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "promptTemplateId" TEXT,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sequences_userId_idx" ON "sequences"("userId");

-- CreateIndex
CREATE INDEX "sequences_leadId_idx" ON "sequences"("leadId");

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sequences" ADD CONSTRAINT "sequences_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "prompt_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
