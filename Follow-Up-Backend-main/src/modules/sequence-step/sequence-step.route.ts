import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { SequenceStepController } from "./sequence-step.controller";
import {
  createStepSchema,
  updateStepSchema,
  reorderStepsSchema,
} from "./sequence-step.validation";

const router = Router({ mergeParams: true });

router.post(
  "/",
  auth,
  validateRequest(createStepSchema),
  SequenceStepController.createStep
);

router.get("/", auth, SequenceStepController.getSteps);

router.post(
  "/regenerate-all",
  auth,
  SequenceStepController.regenerateAllStepsContent
);

// Must be registered before "/:stepId" so "reorder" isn't treated as a step id.
router.patch(
  "/reorder",
  auth,
  validateRequest(reorderStepsSchema),
  SequenceStepController.reorderSteps
);

router.delete("/delete-all", auth, SequenceStepController.deleteAllSteps);

router.get("/:stepId", auth, SequenceStepController.getStepById);

router.patch(
  "/:stepId",
  auth,
  validateRequest(updateStepSchema),
  SequenceStepController.updateStep
);

router.delete("/:stepId", auth, SequenceStepController.deleteStep);

router.post("/:stepId/generate", auth, SequenceStepController.generateStepContent);

router.post("/:stepId/retry", auth, SequenceStepController.retryStep);

export const SequenceStepRoutes = router;
