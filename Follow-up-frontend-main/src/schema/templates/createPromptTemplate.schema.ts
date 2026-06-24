import { z } from "zod";

export const createPromptTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  followUpStage: z.string().min(1, "Follow-up stage is required"),
  promptText: z.string().min(1, "Prompt text is required"),
});

export type CreatePromptTemplateFormValues = z.infer<typeof createPromptTemplateSchema>;
