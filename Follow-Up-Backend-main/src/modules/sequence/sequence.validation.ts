import { z } from "zod";
import { SEQUENCE_STATUS_LIST } from "../../shared/constants";

export const createSequenceSchema = z.object({
  body: z.object({
    leadId: z
      .string({ required_error: "Lead ID is required" })
      .uuid("Invalid Lead ID"),
    promptTemplateId: z
      .string()
      .uuid("Invalid Prompt Template ID")
      .optional(),
    name: z
      .string({ required_error: "Name is required" })
      .min(1, "Name cannot be empty")
      .max(150, "Name must be 150 characters or less"),
    totalSteps: z
      .number({ required_error: "Total steps is required" })
      .int("Total steps must be a whole number")
      .min(1, "Minimum 1 step")
      .max(20, "Maximum 20 steps"),
  }),
});

export const updateSequenceSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(150).optional(),
    status: z
      .enum(SEQUENCE_STATUS_LIST as [string, ...string[]], {
        message: `Status must be one of: ${SEQUENCE_STATUS_LIST.join(", ")}`,
      })
      .optional(),
  }),
});

export type CreateSequenceInput = z.infer<typeof createSequenceSchema>["body"];
export type UpdateSequenceInput = z.infer<typeof updateSequenceSchema>["body"];
