import { z } from "zod";

export const updateStepFormSchema = z.object({
  subject: z.string(),
  content: z.string(),
  scheduledAt: z.string(),
});

export type UpdateStepFormValues = z.infer<typeof updateStepFormSchema>;
