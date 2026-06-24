import { Router } from "express";
import auth from "../../shared/middleware/auth";
import validateRequest from "../../shared/middleware/validateRequest";
import { PromptTemplateController } from "./prompt-template.controller";
import {
  createPromptTemplateSchema,
  updatePromptTemplateSchema,
  generatePromptTextSchema,
} from "./prompt-template.validation";

const router = Router();

router.post(
  "/",
  auth,
  validateRequest(createPromptTemplateSchema),
  PromptTemplateController.createTemplate
);

router.post(
  "/generate-prompt-text",
  auth,
  validateRequest(generatePromptTextSchema),
  PromptTemplateController.generatePromptText
);

router.get("/", auth, PromptTemplateController.getTemplates);

router.get("/:id", auth, PromptTemplateController.getTemplateById);

router.patch(
  "/:id",
  auth,
  validateRequest(updatePromptTemplateSchema),
  PromptTemplateController.updateTemplate
);

router.delete("/:id", auth, PromptTemplateController.deleteTemplate);

export const PromptTemplateRoutes = router;
