import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { DashboardController } from "./dashboard.controller";
import { getDashboardSchema } from "./dashboard.validation";

const router = Router();

router.get(
  "/",
  auth,
  validateRequest(getDashboardSchema),
  DashboardController.getDashboard
);

export const DashboardRoutes = router;
