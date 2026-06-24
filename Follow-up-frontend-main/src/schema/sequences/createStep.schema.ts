import { z } from "zod";
import { STEP_TYPE_VALUES } from "@/constants/stepType";

export const createStepFormSchema = z.object({
  stepOrder: z.coerce.number().int().min(1, "Step order must be at least 1"),
  stepType: z.enum(STEP_TYPE_VALUES, {
    message: "Step type is required",
  }),
  scheduledAt: z.string().min(1, "Scheduled time is required"),
});

export type CreateStepFormValues = z.infer<typeof createStepFormSchema>;
