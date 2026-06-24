import type { CreateLeadFormValues } from "@/schema/leads/createLead.schema";
import type { CreateLeadRequestBody, UpdateLeadRequestBody } from "@/types/leads";

/** Trim string; empty or whitespace-only becomes `null` (API: clear optional field). */
export const toNullableOptionalString = (value: string | undefined | null): string | null => {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

type LeadFormPayloadOptions = {
  /** Normalized phone with country code, when applicable. */
  phone?: string;
};

export function buildCreateLeadPayload(
  values: CreateLeadFormValues,
  options?: LeadFormPayloadOptions,
): CreateLeadRequestBody {
  const body: CreateLeadRequestBody = {
    name: values.name.trim(),
  };

  const email = toNullableOptionalString(values.email);
  if (email) body.email = email;

  const phone = options?.phone?.trim();
  if (phone) body.phone = phone;

  const company = toNullableOptionalString(values.company);
  if (company) body.company = company;

  const location = toNullableOptionalString(values.location);
  if (location) body.location = location;

  const followUpStage = toNullableOptionalString(values.followUpStage);
  if (followUpStage) body.followUpStage = followUpStage;

  const notes = toNullableOptionalString(values.notes);
  if (notes) body.notes = notes;

  return body;
}

/** Update sends `null` for cleared optional fields. */
export function buildUpdateLeadPayload(
  values: CreateLeadFormValues,
  options?: LeadFormPayloadOptions,
): UpdateLeadRequestBody {
  const phone =
    options?.phone !== undefined
      ? toNullableOptionalString(options.phone)
      : toNullableOptionalString(values.phone);

  return {
    name: values.name.trim(),
    email: toNullableOptionalString(values.email),
    phone,
    company: toNullableOptionalString(values.company),
    location: toNullableOptionalString(values.location),
    followUpStage: toNullableOptionalString(values.followUpStage),
    notes: toNullableOptionalString(values.notes),
  };
}
