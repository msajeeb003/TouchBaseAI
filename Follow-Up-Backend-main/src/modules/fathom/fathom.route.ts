import { Router } from "express";
import auth from "../../shared/middleware/auth";
import { FathomController } from "./fathom.controller";

const router = Router();

router.get("/meetings", auth, FathomController.getMeetings);
router.get(
  "/meetings/:recordingId/transcript",
  auth,
  FathomController.getTranscript
);
router.get(
  "/meetings/:recordingId/summary",
  auth,
  FathomController.getSummary
);

export const FathomRoutes = router;
