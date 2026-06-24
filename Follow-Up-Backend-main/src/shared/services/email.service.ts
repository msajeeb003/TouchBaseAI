import nodemailer from "nodemailer";
import { SettingsService } from "../../modules/settings/settings.service";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  fromName: string;
}

const getSmtpConfig = async (userId: string): Promise<SmtpConfig> => {
  const settings = await import("../../shared/prisma").then((m) =>
    m.default.userSettings.findUnique({
      where: { userId },
      select: {
        smtpHost: true,
        smtpPort: true,
        smtpUsername: true,
        smtpFromName: true,
      },
    })
  );

  if (!settings?.smtpHost || !settings.smtpPort || !settings.smtpUsername) {
    throw new Error("SMTP settings not configured");
  }

  const password = await SettingsService.getDecryptedField(
    userId,
    "smtpPassword"
  );

  if (!password) {
    throw new Error("SMTP password not configured");
  }

  return {
    host: settings.smtpHost,
    port: settings.smtpPort,
    username: settings.smtpUsername,
    password,
    fromName: settings.smtpFromName || settings.smtpUsername,
  };
};

export const sendEmail = async (
  userId: string,
  options: EmailOptions
): Promise<void> => {
  const config = await getSmtpConfig(userId);
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.username,
      pass: config.password,
    },
  });

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.username}>`,
    to: options.to,
    subject: options.subject || "(No Subject)",
    text: options.text,
  });
};
