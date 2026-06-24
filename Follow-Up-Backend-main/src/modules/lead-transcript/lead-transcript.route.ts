import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { LeadTranscriptController } from "./lead-transcript.controller";
import {
  createTranscriptSchema,
  updateTranscriptSchema,
  fathomTranscriptSchema,
} from "./lead-transcript.validation";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth,
  validateRequest(createTranscriptSchema),
  LeadTranscriptController.createTranscript
);

router.post(
  "/from-fathom",
  auth,
  validateRequest(fathomTranscriptSchema),
  LeadTranscriptController.importFromFathom
);

router.get("/", auth, LeadTranscriptController.getTranscripts);

router.get("/:id", auth, LeadTranscriptController.getTranscriptById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateTranscriptSchema),
  LeadTranscriptController.updateTranscript
);

router.delete("/:id", auth, LeadTranscriptController.deleteTranscript);

export const LeadTranscriptRoutes = router;
