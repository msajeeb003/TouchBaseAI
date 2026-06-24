import { Router } from "express";
import { AuthRoutes } from "../../modules/auth/auth.route";
import { SettingsRoutes } from "../../modules/settings/settings.route";
import { FathomRoutes } from "../../modules/fathom/fathom.route";
import { LeadRoutes } from "../../modules/lead/lead.route";
import { PromptTemplateRoutes } from "../../modules/prompt-template/prompt-template.route";
import { SequenceRoutes } from "../../modules/sequence/sequence.route";
import { DashboardRoutes } from "../../modules/dashboard/dashboard.route";
import { WebhookRoutes } from "../../modules/webhook/webhook.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/settings", SettingsRoutes);
router.use("/fathom", FathomRoutes);
router.use("/leads", LeadRoutes);
router.use("/prompt-templates", PromptTemplateRoutes);
router.use("/sequences", SequenceRoutes);
router.use("/dashboard", DashboardRoutes);
router.use("/webhooks", WebhookRoutes);

export default router;
