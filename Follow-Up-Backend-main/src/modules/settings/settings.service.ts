import prisma from "../../shared/prisma";
import { encrypt, decrypt, maskSecret } from "../../shared/utils/encryption";
import { UpdateSettingsInput } from "./settings.validation";

const SENSITIVE_FIELDS = [
  "aiApiKey",
  "fathomApiKey",
  "smtpPassword",
  "textmagicApiKey",
  "twilioAuthToken",
  "retellApiKey",
] as const;

type SensitiveField = (typeof SENSITIVE_FIELDS)[number];

const isSensitiveField = (key: string): key is SensitiveField => {
  return SENSITIVE_FIELDS.includes(key as SensitiveField);
};

const encryptFields = (
  data: UpdateSettingsInput
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;

    if (isSensitiveField(key) && typeof value === "string") {
      result[key] = encrypt(value);
    } else {
      result[key] = value;
    }
  }

  return result;
};

const decryptAndMask = (
  settings: Record<string, unknown>
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(settings)) {
    if (isSensitiveField(key) && typeof value === "string") {
      try {
        const decrypted = decrypt(value);
        result[key] = maskSecret(decrypted);
      } catch {
        result[key] = null;
      }
    } else {
      result[key] = value;
    }
  }

  return result;
};

const SETTINGS_SELECT = {
  id: true,
  userId: true,
  aiProvider: true,
  aiApiKey: true,
  aiModel: true,
  fathomApiKey: true,
  smtpHost: true,
  smtpPort: true,
  smtpUsername: true,
  smtpPassword: true,
  smtpFromName: true,
  smsProvider: true,
  textmagicUsername: true,
  textmagicApiKey: true,
  twilioAccountSid: true,
  twilioAuthToken: true,
  twilioPhoneNumber: true,
  twilioWhatsappNumber: true,
  retellApiKey: true,
  retellAgentId: true,
  retellCallerNumber: true,
  createdAt: true,
  updatedAt: true,
};

const getSettings = async (userId: string) => {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: SETTINGS_SELECT,
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: { userId },
      select: SETTINGS_SELECT,
    });
  }

  return decryptAndMask(settings as unknown as Record<string, unknown>);
};

const updateSettings = async (
  userId: string,
  payload: UpdateSettingsInput
) => {
  const encryptedData = encryptFields(payload);

  const settings = await prisma.userSettings.upsert({
    where: { userId },
    update: encryptedData,
    create: { userId, ...encryptedData },
    select: SETTINGS_SELECT,
  });

  return decryptAndMask(settings as unknown as Record<string, unknown>);
};

const getDecryptedField = async (
  userId: string,
  field: SensitiveField
): Promise<string | null> => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { [field]: true },
  });

  if (!settings) return null;

  const value = (settings as Record<string, unknown>)[field];
  if (typeof value !== "string") return null;

  try {
    return decrypt(value);
  } catch {
    return null;
  }
};

export const SettingsService = {
  getSettings,
  updateSettings,
  getDecryptedField,
};
