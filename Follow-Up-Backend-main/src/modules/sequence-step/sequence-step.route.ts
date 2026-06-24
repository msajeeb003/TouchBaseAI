import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { SequenceStepController } from "./sequence-step.controller";
import {
  createStepSchema,
  updateStepSchema,
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

export const SequenceStepRoutes = router;
