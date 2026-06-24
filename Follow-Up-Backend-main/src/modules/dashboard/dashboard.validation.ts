import { z } from "zod";

export const getDashboardSchema = z.object({
  query: z.object({
    days: z.coerce.number().int().min(1).max(365).optional(),
    upcomingDays: z.coerce.number().int().min(1).max(30).optional(),
  }),
});

export type GetDashboardQuery = z.infer<typeof getDashboardSchema>["query"];
