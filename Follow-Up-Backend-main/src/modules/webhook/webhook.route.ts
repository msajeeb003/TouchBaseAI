import { Router } from "express";
import { WebhookController } from "./webhook.controller";

const router = Router();

router.post("/retell", WebhookController.handleRetellWebhook);
router.post(
  "/twilio/whatsapp-status",
  WebhookController.handleTwilioWhatsAppStatus
);

export const WebhookRoutes = router;
