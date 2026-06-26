import { z } from "zod";
import { STEP_TYPE_LIST } from "../../shared/constants";

const stepTypeEnum = z.enum(
  STEP_TYPE_LIST as [string, ...string[]],
  {
    required_error: "Step type is required",
    message: `Step type must be one of: ${STEP_TYPE_LIST.join(", ")}`,
  }
);

export const createStepSchema = z.object({
  body: z.object({
    stepOrder: z
      .number({ required_error: "Step order is required" })
      .int("Step order must be a whole number")
      .min(1, "Step order must be at least 1"),
    stepType: stepTypeEnum,
    scheduledAt: z
      .string({ required_error: "Scheduled date is required" })
      .datetime("Invalid date format"),
  }),
});

export const updateStepSchema = z.object({
  body: z.object({
    stepType: stepTypeEnum.optional(),
    subject: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    scheduledAt: z.string().datetime("Invalid date format").optional(),
  }),
});

export const reorderStepsSchema = z.object({
  body: z.object({
    orderedStepIds: z
      .array(z.string().uuid("Invalid step id"))
      .min(1, "orderedStepIds cannot be empty"),
  }),
});

export type CreateStepInput = z.infer<typeof createStepSchema>["body"];
export type UpdateStepInput = z.infer<typeof updateStepSchema>["body"];
export type ReorderStepsInput = z.infer<typeof reorderStepsSchema>["body"];
