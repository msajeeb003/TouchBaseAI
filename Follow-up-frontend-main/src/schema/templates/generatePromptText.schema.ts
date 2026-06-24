import { z } from "zod";
import { STEP_TYPE_VALUES } from "@/constants/stepType";

const stepTypeSchema = z.enum(STEP_TYPE_VALUES, {
  errorMap: () => ({
    message: `Step type must be one of: ${STEP_TYPE_VALUES.join(", ")}`,
  }),
});

export const generatePromptTextSchema = z.object({
  followUpScenario: z.string().min(1, "Follow-up scenario is required"),
  serviceDescription: z.string().min(1, "Service description is required"),
  sequenceGoal: z.string().min(1, "Sequence goal is required"),
  senderName: z.string().min(1, "Sender name is required"),
  ctaLink: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url("CTA link must be a valid URL").optional(),
  ),
  companyName: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().min(1, "Company name is required").optional(),
  ),
  stepTypesPattern: z
    .array(stepTypeSchema)
    .min(1, "Add at least one step type")
    .max(12, "Maximum 12 step types are allowed"),
  intervalDays: z.coerce.number().int().min(1, "Interval must be at least 1 day"),
  toneStyle: z.string().min(1, "Tone style is required"),
  additionalNotes: z.string().optional(),
});

export type GeneratePromptTextFormValues = z.infer<typeof generatePromptTextSchema>;
