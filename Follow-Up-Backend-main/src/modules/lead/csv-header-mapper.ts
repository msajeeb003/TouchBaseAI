import { z } from "zod";
import prisma from "../../shared/prisma";
import AppError from "../../shared/errors/AppError";
import { generateContent } from "../../shared/services/ai.service";
import { SettingsService } from "../settings/settings.service";
import type { AIProvider } from "../../shared/constants";

export const LEAD_CSV_FIELDS = [
  "name",
  "email",
  "phone",
  "notes",
  "company",
  "location",
  "status",
  "followUpStage",
] as const;

export type LeadCsvField = (typeof LEAD_CSV_FIELDS)[number];

/** CSV headers we never map (system / export metadata). */
const IGNORED_HEADER_KEYS = new Set([
  "id",
  "userid",
  "createdat",
  "updatedat",
  "created at",
  "updated at",
]);

const MAX_COLUMNS = 50;
const MAX_SAMPLE_ROWS = 3;

const aiMappingSchema = z.object({
  mapping: z.record(z.string(), z.enum(LEAD_CSV_FIELDS)),
});

export type LeadCsvColumnMapping = Record<string, LeadCsvField>;

const normalizeHeaderKey = (header: string): string =>
  header.trim().toLowerCase().replace(/\s+/g, " ");

const isIgnoredHeader = (header: string): boolean =>
  IGNORED_HEADER_KEYS.has(normalizeHeaderKey(header));

/* -------------------------------------------------------------------------- */
/*  Deterministic header mapping (runs first, no AI required)                  */
/* -------------------------------------------------------------------------- */

const FIELD_SYNONYMS: Record<LeadCsvField, string[]> = {
  name: ["name", "full name", "fullname", "lead name", "contact name", "contact", "person", "client name", "customer name", "first name"],
  email: ["email", "e mail", "email address", "mail", "contact email", "work email", "email id", "e mail address"],
  phone: ["phone", "phone number", "phone no", "mobile", "mobile number", "mobile no", "cell", "cell phone", "contact number", "tel", "telephone", "whatsapp", "whatsapp number"],
  company: ["company", "company name", "organization", "organisation", "business", "business name", "org", "employer"],
  location: ["location", "city", "country", "address", "region", "state"],
  notes: ["notes", "note", "comments", "comment", "remarks", "description"],
  status: ["status", "lead status"],
  followUpStage: ["follow up stage", "followup stage", "stage", "pipeline", "pipeline stage", "follow up", "followup"],
};

/** Fuzzy keyword fallbacks. Order matters (company before name avoids
 *  "Company Name" -> name). */
const FUZZY_RULES: [LeadCsvField, RegExp][] = [
  ["email", /\be[\s-]?mail\b/],
  ["phone", /\b(phone|mobile|whatsapp|telephone|cell)\b/],
  ["company", /\b(company|organi[sz]ation|business|employer)\b/],
  ["name", /\bname\b/],
  ["location", /\b(location|city|country|address|region|state)\b/],
  ["followUpStage", /\b(stage|pipeline)\b/],
  ["status", /\bstatus\b/],
  ["notes", /\b(note|comment|remark|description)\b/],
];

const normHeader = (h: string): string =>
  h.trim().toLowerCase().replace(/[_\-.]+/g, " ").replace(/\s+/g, " ");

/** Map CSV headers to lead fields by recognising common column names. */
const deterministicMapping = (headers: string[]): LeadCsvColumnMapping => {
  const result: LeadCsvColumnMapping = {};
  const usedFields = new Set<LeadCsvField>();

  // Pass 1: exact synonym match.
  for (const header of headers) {
    if (isIgnoredHeader(header) || result[header]) continue;
    const n = normHeader(header);
    for (const field of LEAD_CSV_FIELDS) {
      if (usedFields.has(field)) continue;
      if (FIELD_SYNONYMS[field].includes(n)) {
        result[header] = field;
        usedFields.add(field);
        break;
      }
    }
  }

  // Pass 2: fuzzy keyword match for fields still unmapped.
  for (const [field, re] of FUZZY_RULES) {
    if (usedFields.has(field)) continue;
    for (const header of headers) {
      if (result[header] || isIgnoredHeader(header)) continue;
      if (re.test(normHeader(header))) {
        result[header] = field;
        usedFields.add(field);
        break;
      }
    }
  }

  return result;
};

/** Add mappings from `secondary` for columns/fields not already covered. */
const mergeMappings = (
  primary: LeadCsvColumnMapping,
  secondary: LeadCsvColumnMapping,
  headers: string[]
): LeadCsvColumnMapping => {
  const result: LeadCsvColumnMapping = { ...primary };
  const usedFields = new Set<LeadCsvField>(Object.values(primary));
  const usedHeaders = new Set<string>(Object.keys(primary));

  for (const header of headers) {
    if (usedHeaders.has(header) || isIgnoredHeader(header)) continue;
    const field = secondary[header];
    if (!field || usedFields.has(field)) continue;
    result[header] = field;
    usedFields.add(field);
    usedHeaders.add(header);
  }

  return result;
};

const extractJsonPayload = (text: string): unknown => {
  const trimmed = text.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```$/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;
  return JSON.parse(jsonText);
};

const buildMappingPrompt = (
  headers: string[],
  sampleRows: Record<string, string>[]
): string => {
  const samplesJson = JSON.stringify(sampleRows, null, 2);

  return `You map CSV column headers to CRM lead fields for data import.
Return ONLY valid JSON. Do not invent or modify row data.
Each CSV column maps to at most one lead field. Unmapped columns are omitted.

Map these CSV column headers to lead fields.

Allowed lead fields (use exactly these values): ${LEAD_CSV_FIELDS.join(", ")}

Rules:
- Return JSON: { "mapping": { "<exact CSV header>": "<lead field>", ... } }
- Keys must match CSV headers exactly as provided (case-sensitive).
- Map at least one column to "name" if a name-like column exists.
- Map email/phone columns when present (users need one for follow-up).
- "followUpStage" = pipeline/stage columns (e.g. "Follow Up Stage", "Stage").
- "status" = lead status only (e.g. "Status", "Lead Status"), not pipeline stage.
- Do NOT map columns: id, userId, createdAt, updatedAt.
- Omit columns you cannot confidently map.

CSV headers:
${JSON.stringify(headers)}

Sample rows (first ${sampleRows.length}):
${samplesJson}`;
};

const sanitizeMapping = (
  raw: Record<string, LeadCsvField>,
  headers: string[],
  requireName = true
): LeadCsvColumnMapping => {
  const usedFields = new Set<LeadCsvField>();
  const result: LeadCsvColumnMapping = {};

  for (const header of headers) {
    const target = raw[header];
    if (!target || isIgnoredHeader(header)) continue;
    if (usedFields.has(target)) continue;

    result[header] = target;
    usedFields.add(target);
  }

  // Also accept mappings keyed with minor whitespace drift
  for (const [csvKey, target] of Object.entries(raw)) {
    if (usedFields.has(target) || isIgnoredHeader(csvKey)) continue;

    const match = headers.find((h) => h === csvKey);
    if (match && !result[match]) {
      result[match] = target;
      usedFields.add(target);
      continue;
    }

    const trimmedMatch = headers.find(
      (h) => h.trim() === csvKey.trim() && !result[h]
    );
    if (trimmedMatch) {
      result[trimmedMatch] = target;
      usedFields.add(target);
    }
  }

  if (requireName && !Object.values(result).includes("name")) {
    throw new AppError(
      400,
      "Could not map a CSV column to lead name. Ensure your file has a name column."
    );
  }

  return result;
};

const parseMappingResponse = (content: string): LeadCsvColumnMapping => {
  let parsed: unknown;
  try {
    parsed = extractJsonPayload(content);
  } catch {
    throw new AppError(502, "AI returned invalid JSON for column mapping");
  }

  const validated = aiMappingSchema.safeParse(parsed);
  if (!validated.success) {
    throw new AppError(502, "AI column mapping did not match the expected format");
  }

  return validated.data.mapping;
};

const requestMappingFromAi = async (
  headers: string[],
  sampleRows: Record<string, string>[],
  userId: string
): Promise<LeadCsvColumnMapping> => {
  const aiSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiProvider: true, aiModel: true },
  });
  const aiApiKey = await SettingsService.getDecryptedField(userId, "aiApiKey");

  if (!aiSettings?.aiProvider || !aiApiKey) {
    throw new AppError(
      400,
      "AI provider and API key not configured. Please set them in Settings to import CSV."
    );
  }

  const prompt = buildMappingPrompt(headers, sampleRows);
  const provider = aiSettings.aiProvider as AIProvider;

  const run = async (retryNote?: string) => {
    const { content } = await generateContent(
      {
        provider,
        apiKey: aiApiKey,
        model: aiSettings.aiModel ?? undefined,
      },
      retryNote ? `${prompt}\n\n${retryNote}` : prompt,
      { temperature: 0 }
    );
    return parseMappingResponse(content);
  };

  try {
    const raw = await run();
    return sanitizeMapping(raw, headers, false);
  } catch (firstError) {
    if (firstError instanceof AppError && firstError.statusCode !== 502) {
      throw firstError;
    }

    try {
      const raw = await run(
        "Your previous response was invalid. Reply with JSON only: { \"mapping\": { ... } }"
      );
      return sanitizeMapping(raw, headers, false);
    } catch {
      if (firstError instanceof AppError) throw firstError;
      throw new AppError(502, "Failed to map CSV columns using AI");
    }
  }
};

/** Apply header→field mapping to one parsed CSV row. */
export const applyColumnMapping = (
  rawRow: Record<string, string>,
  mapping: LeadCsvColumnMapping
): Partial<Record<LeadCsvField, string>> => {
  const row: Partial<Record<LeadCsvField, string>> = {};

  for (const [csvHeader, field] of Object.entries(mapping)) {
    const value = rawRow[csvHeader];
    if (value === undefined || value === null) continue;
    const trimmed = String(value).trim();
    if (trimmed) row[field] = trimmed;
  }

  return row;
};

export const resolveLeadCsvColumnMapping = async (
  userId: string,
  records: Record<string, string>[]
): Promise<LeadCsvColumnMapping> => {
  const headers = Object.keys(records[0] ?? {});
  if (headers.length === 0) {
    throw new AppError(400, "CSV has no column headers");
  }

  if (headers.length > MAX_COLUMNS) {
    throw new AppError(
      400,
      `CSV has too many columns (max ${MAX_COLUMNS}). Remove extra columns and try again.`
    );
  }

  // 1) Deterministic synonym mapping — reliable and needs no AI key.
  const deterministic = deterministicMapping(headers);
  let detFields = new Set(Object.values(deterministic));
  const hasContact = detFields.has("email") || detFields.has("phone");

  // Name fallback: if we have a contact channel but no recognised name column,
  // use the first unmapped column (lead CSVs almost always lead with the name).
  if (!detFields.has("name") && hasContact) {
    const usedHeaders = new Set(Object.keys(deterministic));
    const candidate = headers.find(
      (h) => !usedHeaders.has(h) && !isIgnoredHeader(h)
    );
    if (candidate) {
      deterministic[candidate] = "name";
      detFields = new Set(Object.values(deterministic));
    }
  }

  // Good enough on its own when we have a name + at least one contact channel.
  if (detFields.has("name") && hasContact) {
    return deterministic;
  }

  // 2) Try AI to fill the gaps (e.g. an unusual name column). Never fail just
  //    because AI isn't configured — fall back to the deterministic mapping.
  let aiMapping: LeadCsvColumnMapping | null = null;
  try {
    const sampleRows = records.slice(0, MAX_SAMPLE_ROWS).map((row) => {
      const sample: Record<string, string> = {};
      for (const h of headers) sample[h] = row[h] ?? "";
      return sample;
    });
    aiMapping = await requestMappingFromAi(headers, sampleRows, userId);
  } catch {
    aiMapping = null;
  }

  const merged = aiMapping
    ? mergeMappings(deterministic, aiMapping, headers)
    : deterministic;

  if (!Object.values(merged).includes("name")) {
    throw new AppError(
      400,
      "Could not find a name column. Make sure the first row of your CSV has column headers (e.g. Name, Email, Phone)."
    );
  }

  return merged;
};
