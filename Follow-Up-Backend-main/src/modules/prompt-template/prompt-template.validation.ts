import { z } from "zod";
import { STEP_TYPE_LIST } from "../../shared/constants";

export const createPromptTemplateSchema = z.object({
  body: z.object({
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(100, "Name must be 100 characters or less"),
    followUpStage: z
      .string({ required_error: "Follow-up stage is required" })
      .min(1, "Follow-up stage cannot be empty")
      .max(50, "Follow-up stage must be 50 characters or less"),
    promptText: z
      .string({ required_error: "Prompt text is required" })
      .min(10, "Prompt text must be at least 10 characters"),
  }),
});

export const updatePromptTemplateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    followUpStage: z.string().min(1).max(50).optional(),
    promptText: z.string().min(10).optional(),
  }),
});

const stepTypeItem = z.enum(STEP_TYPE_LIST as [string, ...string[]]);

export const generatePromptTextSchema = z.object({
  body: z.object({
    followUpScenario: z
      .string({ required_error: "Follow-up scenario is required" })
      .min(10, "Follow-up scenario must be at least 10 characters"),
    serviceDescription: z
      .string({ required_error: "Service description is required" })
      .min(10, "Service description must be at least 10 characters"),
    sequenceGoal: z
      .string({ required_error: "Sequence goal is required" })
      .min(10, "Sequence goal must be at least 10 characters"),
    senderName: z
      .string({ required_error: "Sender name is required" })
      .min(1, "Sender name cannot be empty")
      .max(100),
    ctaLink: z
      .string()
      .url("CTA link must be a valid URL")
      .optional(),
    companyName: z
      .string()
      .min(1, "Company name cannot be empty")
      .max(100)
      .optional(),
    stepTypesPattern: z
      .array(stepTypeItem)
      .min(1, "At least one step type is required")
      .max(20),
    intervalDays: z.number().int().min(1).max(90).optional(),
    toneStyle: z.string().max(500).optional(),
    additionalNotes: z.string().max(2000).optional(),
  }),
});

export type CreatePromptTemplateInput = z.infer<typeof createPromptTemplateSchema>["body"];
export type UpdatePromptTemplateInput = z.infer<typeof updatePromptTemplateSchema>["body"];
export type GeneratePromptTextInput = z.infer<typeof generatePromptTextSchema>["body"];
