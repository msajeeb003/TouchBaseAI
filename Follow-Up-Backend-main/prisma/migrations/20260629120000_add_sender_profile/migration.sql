-- Sender profile fields on user_settings (used by AI when no prompt template is selected)
ALTER TABLE "user_settings" ADD COLUMN "senderName" TEXT;
ALTER TABLE "user_settings" ADD COLUMN "senderPosition" TEXT;
ALTER TABLE "user_settings" ADD COLUMN "senderCompany" TEXT;
ALTER TABLE "user_settings" ADD COLUMN "bookingLink" TEXT;
ALTER TABLE "user_settings" ADD COLUMN "serviceDescription" TEXT;
