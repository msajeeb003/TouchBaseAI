import { z } from "zod";

const nationalDigits = (val: string) => val.replace(/\D/g, "").length;
const emailSchema = z.string().email("Enter a valid email");

/**
 * @param getMinNationalDigits - Min digits for the national number (no country prefix). Use a ref-backed getter in the form when this depends on selected country ISO.
 */
export function createLeadFormSchema(getMinNationalDigits: () => number = () => 8) {
  return z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .optional()
      .refine((val) => !val || emailSchema.safeParse(val).success, "Enter a valid email"),
    phone: z
      .string()
      .optional()
      .refine((val) => !val || nationalDigits(val) >= getMinNationalDigits(), () => {
        const min = getMinNationalDigits();
        return {
          message: `Phone must be at least ${min} digit${min === 1 ? "" : "s"} (national number, no country code)`,
        };
      }),
    company: z.string().optional(),
    location: z.string().optional(),
    followUpStage: z.string().optional(),
    notes: z.string().optional(),
  });
}

export type CreateLeadFormValues = z.infer<ReturnType<typeof createLeadFormSchema>>;
