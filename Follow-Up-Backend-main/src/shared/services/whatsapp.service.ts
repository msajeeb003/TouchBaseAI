import prisma from "../prisma";
import { SettingsService } from "../../modules/settings/settings.service";
import config from "../../config";
import { toE164 } from "../utils/phone";

interface WhatsAppConfig {
  accountSid: string;
  authToken: string;
  whatsappNumber: string;
}

type TwilioMessageBody = {
  sid?: string;
  status?: string;
  error_code?: number | string | null;
  error_message?: string | null;
};

export type SendWhatsAppResult = {
  sid: string;
  status: string;
  /** webhook: final status via StatusCallback; immediate: no callback URL configured */
  mode: "webhook" | "immediate";
};

const getStatusCallbackUrl = (): string | null => {
  if (!config.public_base_url) {
    return null;
  }
  return `${config.public_base_url}/api/v1/webhooks/twilio/whatsapp-status`;
};

const getWhatsAppConfig = async (userId: string): Promise<WhatsAppConfig> => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { twilioAccountSid: true, twilioWhatsappNumber: true },
  });

  if (!settings?.twilioAccountSid) {
    throw new Error("Twilio Account SID not configured");
  }

  if (!settings.twilioWhatsappNumber) {
    throw new Error(
      "Twilio WhatsApp number not configured. Set it in Settings."
    );
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
    whatsappNumber: settings.twilioWhatsappNumber,
  };
};

const parseTwilioMessageBody = (raw: string): TwilioMessageBody => {
  try {
    return JSON.parse(raw) as TwilioMessageBody;
  } catch {
    throw new Error(`Twilio WhatsApp: invalid JSON response: ${raw}`);
  }
};

const assertNoTwilioError = (
  data: TwilioMessageBody,
  phone: string,
  whatsappNumber: string
): void => {
  const errorCode =
    data.error_code != null && data.error_code !== ""
      ? Number(data.error_code)
      : 0;

  if (errorCode) {
    if (errorCode === 63015) {
      throw new Error(
        `Twilio sandbox 63015: ${phone} has not joined your WhatsApp sandbox. ` +
          `From that phone, send your sandbox "join <keyword>" in WhatsApp to ${whatsappNumber}, then retry.`
      );
    }
    throw new Error(
      `Twilio WhatsApp error ${errorCode}: ${data.error_message ?? "unknown"}`
    );
  }

  const status = data.status?.toLowerCase();
  if (status === "failed" || status === "undelivered") {
    throw new Error(
      `Twilio WhatsApp delivery ${status}: ${data.error_message ?? "no detail"}`
    );
  }
};

export const sendWhatsApp = async (
  userId: string,
  phone: string,
  text: string
): Promise<SendWhatsAppResult> => {
  const to = toE164(phone);
  if (!to) {
    throw new Error(`Invalid phone number: "${phone}"`);
  }

  const twilioConfig = await getWhatsAppConfig(userId);

  const url = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.accountSid}/Messages.json`;
  const credentials = btoa(
    `${twilioConfig.accountSid}:${twilioConfig.authToken}`
  );

  const params = new URLSearchParams({
    To: `whatsapp:${to}`,
    From: `whatsapp:${twilioConfig.whatsappNumber}`,
    Body: text,
  });

  const statusCallback = getStatusCallbackUrl();
  if (statusCallback) {
    params.set("StatusCallback", statusCallback);
  } else {
    console.warn(
      "[WhatsApp] PUBLIC_BASE_URL not set — delivery status will not be tracked via webhook"
    );
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: params,
  });

  const raw = await response.text();

  if (!response.ok) {
    throw new Error(`Twilio WhatsApp API error (${response.status}): ${raw}`);
  }

  const data = parseTwilioMessageBody(raw);
  assertNoTwilioError(data, to, twilioConfig.whatsappNumber);

  if (!data.sid) {
    throw new Error("Twilio WhatsApp: missing MessageSid in response");
  }

  return {
    sid: data.sid,
    status: data.status ?? "queued",
    mode: statusCallback ? "webhook" : "immediate",
  };
};
