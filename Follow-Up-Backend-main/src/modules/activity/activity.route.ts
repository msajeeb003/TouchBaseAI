import { Router } from "express";
import auth from "../../shared/middleware/auth";
import { ActivityController } from "./activity.controller";

const router = Router();

router.get("/calls", auth, ActivityController.getCalls);
router.get("/messages", auth, ActivityController.getMessages);

export const ActivityRoutes = router;
