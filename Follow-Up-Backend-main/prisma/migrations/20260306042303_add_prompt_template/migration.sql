-- CreateTable
CREATE TABLE "prompt_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "followUpStage" TEXT NOT NULL,
    "promptText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_templates_userId_idx" ON "prompt_templates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_templates_userId_followUpStage_key" ON "prompt_templates"("userId", "followUpStage");

-- AddForeignKey
ALTER TABLE "prompt_templates" ADD CONSTRAINT "prompt_templates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
