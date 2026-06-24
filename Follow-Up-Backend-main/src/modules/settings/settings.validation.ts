import { z } from "zod";
import { AI_PROVIDER_LIST } from "../../shared/constants";

export const updateSettingsSchema = z.object({
  body: z.object({
    aiProvider: z
      .enum(AI_PROVIDER_LIST as [string, ...string[]], {
        message: `AI provider must be one of: ${AI_PROVIDER_LIST.join(", ")}`,
      })
      .nullable()
      .optional(),
    aiApiKey: z.string().nullable().optional(),
    aiModel: z.string().nullable().optional(),

    fathomApiKey: z.string().nullable().optional(),

    smtpHost: z.string().nullable().optional(),
    smtpPort: z.number().int().min(1).max(65535).nullable().optional(),
    smtpUsername: z.string().email("Invalid SMTP email").nullable().optional(),
    smtpPassword: z.string().nullable().optional(),
    smtpFromName: z.string().nullable().optional(),

    smsProvider: z
      .enum(["textmagic", "twilio"], {
        message: "SMS provider must be one of: textmagic, twilio",
      })
      .nullable()
      .optional(),

    textmagicUsername: z.string().nullable().optional(),
    textmagicApiKey: z.string().nullable().optional(),

    twilioAccountSid: z.string().nullable().optional(),
    twilioAuthToken: z.string().nullable().optional(),
    twilioPhoneNumber: z.string().nullable().optional(),
    twilioWhatsappNumber: z.string().nullable().optional(),

    retellApiKey: z.string().nullable().optional(),
    retellAgentId: z.string().nullable().optional(),
    retellCallerNumber: z.string().nullable().optional(),
  }),
});

export type UpdateSettingsInput = z.infer<
  typeof updateSettingsSchema
>["body"];
