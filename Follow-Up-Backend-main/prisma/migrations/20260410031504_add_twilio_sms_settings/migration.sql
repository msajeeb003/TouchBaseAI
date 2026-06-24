-- AlterTable
ALTER TABLE "user_settings" ADD COLUMN     "smsProvider" TEXT,
ADD COLUMN     "twilioAccountSid" TEXT,
ADD COLUMN     "twilioAuthToken" TEXT,
ADD COLUMN     "twilioPhoneNumber" TEXT;
