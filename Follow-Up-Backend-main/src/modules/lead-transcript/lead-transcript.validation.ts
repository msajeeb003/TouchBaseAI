import { z } from "zod";

export const createTranscriptSchema = z.object({
  body: z.object({
    source: z
      .string({ required_error: "Source is required" })
      .min(1),
    meetingTitle: z
      .string({ required_error: "Meeting title is required" })
      .min(1),
    meetingDate: z
      .string({ required_error: "Meeting date is required" })
      .datetime("Invalid date format"),
    transcript: z
      .string({ required_error: "Transcript text is required" })
      .min(1),
  }),
});

export const updateTranscriptSchema = z.object({
  body: z.object({
    source: z.string().min(1).optional(),
    meetingTitle: z.string().min(1).optional(),
    meetingDate: z.string().datetime("Invalid date format").optional(),
    transcript: z.string().min(1).optional(),
  }),
});

export const fathomTranscriptSchema = z.object({
  body: z.object({
    recordingId: z.number({ required_error: "Recording ID is required" }),
    meetingTitle: z
      .string({ required_error: "Meeting title is required" })
      .min(1),
    meetingDate: z
      .string({ required_error: "Meeting date is required" })
      .datetime("Invalid date format"),
  }),
});

export type CreateTranscriptInput = z.infer<typeof createTranscriptSchema>["body"];
export type UpdateTranscriptInput = z.infer<typeof updateTranscriptSchema>["body"];
export type FathomTranscriptInput = z.infer<typeof fathomTranscriptSchema>["body"];
