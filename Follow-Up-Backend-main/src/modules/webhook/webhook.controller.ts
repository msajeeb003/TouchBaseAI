import { Request, Response } from "express";
import catchAsync from "../../shared/utils/catchAsync";
import { WebhookService } from "./webhook.service";
import { processTwilioWhatsAppStatus } from "./twilio-whatsapp.webhook";

const handleRetellWebhook = catchAsync(
  async (req: Request, res: Response) => {
    const { event, call } = req.body;

    if (event === "call_ended" && call) {
      await WebhookService.processCallEnded(call);
    }

    res.status(200).json({ received: true });
  }
);

/** Twilio StatusCallback — application/x-www-form-urlencoded */
const handleTwilioWhatsAppStatus = catchAsync(
  async (req: Request, res: Response) => {
    const body = req.body as Record<string, string>;

    try {
      await processTwilioWhatsAppStatus(body);
    } catch (error) {
      console.error("[Twilio Webhook] Handler error:", error);
    }

    res.status(200).send("");
  }
);

export const WebhookController = {
  handleRetellWebhook,
  handleTwilioWhatsAppStatus,
};
