import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { SequenceController } from "./sequence.controller";
import {
  createSequenceSchema,
  updateSequenceSchema,
} from "./sequence.validation";
import { SequenceStepRoutes } from "../sequence-step/sequence-step.route";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createSequenceSchema),
  SequenceController.createSequence
);

router.get("/", auth, SequenceController.getSequences);

router.get("/:id", auth, SequenceController.getSequenceById);

router.patch(
  "/:id",
  auth,
  validateRequest(updateSequenceSchema),
  SequenceController.updateSequence
);

router.delete("/:id", auth, SequenceController.deleteSequence);

router.post("/:id/generate-steps", auth, SequenceController.generateSteps);

router.use("/:sequenceId/steps", SequenceStepRoutes);

export const SequenceRoutes = router;
