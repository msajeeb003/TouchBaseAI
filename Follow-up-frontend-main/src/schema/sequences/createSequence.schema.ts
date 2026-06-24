import { z } from "zod";

export const createSequenceFormSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  name: z.string().min(1, "Sequence name is required"),
  totalSteps: z.coerce.number().int().min(1, "Total steps must be at least 1"),
  promptTemplateId: z.string().min(1, "Prompt template is required"),
});

export type CreateSequenceFormValues = z.infer<typeof createSequenceFormSchema>;
