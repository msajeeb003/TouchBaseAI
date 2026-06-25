import { Router } from "express";
import { AuthRoutes } from "../../modules/auth/auth.route";
import { SettingsRoutes } from "../../modules/settings/settings.route";
import { FathomRoutes } from "../../modules/fathom/fathom.route";
import { LeadRoutes } from "../../modules/lead/lead.route";
import { PromptTemplateRoutes } from "../../modules/prompt-template/prompt-template.route";
import { SequenceRoutes } from "../../modules/sequence/sequence.route";
import { DashboardRoutes } from "../../modules/dashboard/dashboard.route";
import { WebhookRoutes } from "../../modules/webhook/webhook.route";
import { ActivityRoutes } from "../../modules/activity/activity.route";
import { processDueSteps } from "../../shared/services/send-processor";

const router = Router();

// Cron endpoint — invoked by Vercel Cron (serverless replacement for node-cron).
// Runs one batch of the send processor. Protected by CRON_SECRET when set.
router.get("/cron/process", async (req, res) => {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  await processDueSteps();
  return res.json({ success: true, ranAt: new Date().toISOString() });
});

router.use("/auth", AuthRoutes);
router.use("/settings", SettingsRoutes);
router.use("/fathom", FathomRoutes);
router.use("/leads", LeadRoutes);
router.use("/prompt-templates", PromptTemplateRoutes);
router.use("/sequences", SequenceRoutes);
router.use("/dashboard", DashboardRoutes);
router.use("/activity", ActivityRoutes);
router.use("/webhooks", WebhookRoutes);

export default router;
