import { z } from "zod";
import { AI_PROVIDER } from "@/types/settings";

const optionalText = z.string().optional();
const optionalAiProvider = z
  .enum(["", AI_PROVIDER.OPENAI, AI_PROVIDER.GEMINI, AI_PROVIDER.CLAUDE])
  .optional();
const optionalAiModel = z.string().optional();
const optionalSmsProvider = z.enum(["", "textmagic", "twilio"]).optional();

const optionalPort = z.preprocess((value) => {
  if (value === "" || value === null || typeof value === "undefined") {
    return undefined;
  }

  if (typeof value === "number") {
    return Number.isNaN(value) ? undefined : value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? value : parsed;
}, z.number().int().min(1, "SMTP port must be between 1 and 65535").max(65535, "SMTP port must be between 1 and 65535").optional());

export const updateSettingsSchema = z.object({
  body: z.object({
    aiProvider: optionalAiProvider,
    aiApiKey: optionalText,
    aiModel: optionalAiModel,

    fathomApiKey: optionalText,

    smtpHost: optionalText,
    smtpPort: optionalPort,
    smtpUsername: optionalText,
    smtpPassword: optionalText,
    smtpFromName: optionalText,

    smsProvider: optionalSmsProvider,
    textmagicUsername: optionalText,
    textmagicApiKey: optionalText,
    twilioAccountSid: optionalText,
    twilioAuthToken: optionalText,
    twilioPhoneNumber: optionalText,
    twilioWhatsappNumber: optionalText,

    retellApiKey: z.string().nullable().optional(),
    retellAgentId: z.string().nullable().optional(),
    retellCallerNumber: z.string().nullable().optional(),
  }),
});

export const settingsFormSchema = updateSettingsSchema.shape.body;
export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
