import prisma from "../prisma";
import { SettingsService } from "../../modules/settings/settings.service";

// ── TextMagic ───────────────────────────────────────────────────────

interface TextMagicConfig {
  username: string;
  apiKey: string;
}

const getTextMagicConfig = async (
  userId: string
): Promise<TextMagicConfig> => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { textmagicUsername: true },
  });

  if (!settings?.textmagicUsername) {
    throw new Error("TextMagic username not configured");
  }

  const apiKey = await SettingsService.getDecryptedField(
    userId,
    "textmagicApiKey"
  );

  if (!apiKey) {
    throw new Error("TextMagic API key not configured");
  }

  return { username: settings.textmagicUsername, apiKey };
};

const sendTextMagicSms = async (
  config: TextMagicConfig,
  phone: string,
  text: string
): Promise<void> => {
  const response = await fetch(
    "https://rest.textmagic.com/api/v2/messages",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-TM-Username": config.username,
        "X-TM-Key": config.apiKey,
      },
      body: JSON.stringify({ text, phones: phone }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`TextMagic API error (${response.status}): ${error}`);
  }
};

// ── Twilio ───────────────────────────────────────────────────────────

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

const getTwilioConfig = async (userId: string): Promise<TwilioConfig> => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { twilioAccountSid: true, twilioPhoneNumber: true },
  });

  if (!settings?.twilioAccountSid) {
    throw new Error("Twilio Account SID not configured");
  }

  if (!settings.twilioPhoneNumber) {
    throw new Error("Twilio phone number not configured");
  }

  const authToken = await SettingsService.getDecryptedField(
    userId,
    "twilioAuthToken"
  );

  if (!authToken) {
    throw new Error("Twilio Auth Token not configured");
  }

  return {
    accountSid: settings.twilioAccountSid,
    authToken,
    phoneNumber: settings.twilioPhoneNumber,
  };
};

const sendTwilioSms = async (
  config: TwilioConfig,
  phone: string,
  text: string
): Promise<void> => {
  const url = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;

  const credentials = btoa(`${config.accountSid}:${config.authToken}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      To: phone,
      From: config.phoneNumber,
      Body: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Twilio API error (${response.status}): ${error}`);
  }
};

// ── Public API ───────────────────────────────────────────────────────

export const sendSms = async (
  userId: string,
  phone: string,
  text: string
): Promise<void> => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { smsProvider: true },
  });

  const provider = settings?.smsProvider;

  if (!provider) {
    throw new Error("SMS provider not configured. Set it in Settings.");
  }

  if (provider === "textmagic") {
    const config = await getTextMagicConfig(userId);
    return sendTextMagicSms(config, phone, text);
  }

  if (provider === "twilio") {
    const config = await getTwilioConfig(userId);
    return sendTwilioSms(config, phone, text);
  }

  throw new Error(`Unknown SMS provider: "${provider}"`);
};
