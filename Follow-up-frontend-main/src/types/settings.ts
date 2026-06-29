export const AI_PROVIDER = {
  OPENAI: "openai",
  GEMINI: "gemini",
  CLAUDE: "claude",
} as const;

export type AiProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];
export type SmsProvider = "textmagic" | "twilio";

export interface SettingsItem {
  id: string;
  userId: string;
  aiProvider: AiProvider | null;
  aiApiKey: string | null;
  aiModel: string | null;
  fathomApiKey: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUsername: string | null;
  smtpPassword: string | null;
  smtpFromName: string | null;
  smsProvider: SmsProvider | null;
  textmagicUsername: string | null;
  textmagicApiKey: string | null;
  twilioAccountSid: string | null;
  twilioAuthToken: string | null;
  twilioPhoneNumber: string | null;
  twilioWhatsappNumber: string | null;
  retellApiKey: string | null;
  retellAgentId: string | null;
  retellCallerNumber: string | null;
  senderName: string | null;
  senderPosition: string | null;
  senderCompany: string | null;
  bookingLink: string | null;
  serviceDescription: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}

export interface UpdateSettingsRequestBody {
  aiProvider?: AiProvider | null;
  aiApiKey?: string | null;
  aiModel?: string | null;
  fathomApiKey?: string | null;
  smtpHost?: string | null;
  smtpPort?: number | null;
  smtpUsername?: string | null;
  smtpPassword?: string | null;
  smtpFromName?: string | null;
  smsProvider?: SmsProvider | null;
  textmagicUsername?: string | null;
  textmagicApiKey?: string | null;
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
  twilioPhoneNumber?: string | null;
  twilioWhatsappNumber?: string | null;
  retellApiKey?: string | null;
  retellAgentId?: string | null;
  retellCallerNumber?: string | null;
  senderName?: string | null;
  senderPosition?: string | null;
  senderCompany?: string | null;
  bookingLink?: string | null;
  serviceDescription?: string | null;
}

export interface UpdateSettingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SettingsItem;
}
