import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { SettingsController } from "./settings.controller";
import { updateSettingsSchema } from "./settings.validation";

const router = Router();

router.get("/", auth, SettingsController.getSettings);

router.patch(
  "/",
  auth,
  validateRequest(updateSettingsSchema),
  SettingsController.updateSettings
);

export const SettingsRoutes = router;
