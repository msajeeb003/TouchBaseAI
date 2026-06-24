import prisma from "../../shared/prisma";
import AppError from "../../shared/errors/AppError";
import {
  CreatePromptTemplateInput,
  UpdatePromptTemplateInput,
  GeneratePromptTextInput,
} from "./prompt-template.validation";
import { SettingsService } from "../settings/settings.service";
import { generateContent } from "../../shared/services/ai.service";
import {
  type AIProvider,
  type StepType,
  STEP_TYPE_LIST,
} from "../../shared/constants";

const createTemplate = async (
  userId: string,
  payload: CreatePromptTemplateInput
) => {
  return prisma.promptTemplate.create({
    data: {
      userId,
      name: payload.name,
      followUpStage: payload.followUpStage,
      promptText: payload.promptText,
    },
  });
};

const getTemplates = async (userId: string) => {
  return prisma.promptTemplate.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      followUpStage: true,
      promptText: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const getTemplateById = async (userId: string, templateId: string) => {
  const template = await prisma.promptTemplate.findFirst({
    where: { id: templateId, userId },
  });

  if (!template) {
    throw new AppError(404, "Prompt template not found");
  }

  return template;
};

const getTemplateByStage = async (userId: string, followUpStage: string) => {
  const template = await prisma.promptTemplate.findFirst({
    where: { userId, followUpStage },
  });

  if (!template) {
    throw new AppError(404, `No prompt template found for stage: ${followUpStage}`);
  }

  return template;
};

const updateTemplate = async (
  userId: string,
  templateId: string,
  payload: UpdatePromptTemplateInput
) => {
  await getTemplateById(userId, templateId);

  return prisma.promptTemplate.update({
    where: { id: templateId },
    data: payload,
  });
};

const deleteTemplate = async (userId: string, templateId: string) => {
  await getTemplateById(userId, templateId);

  return prisma.promptTemplate.delete({
    where: { id: templateId },
  });
};

const AVAILABLE_VARIABLES = [
  "{{lead.name}}",
  "{{lead.email}}",
  "{{lead.phone}}",
  "{{lead.company}}",
  "{{lead.location}}",
  "{{lead.followUpStage}}",
  "{{lead.notes}}",
  "{{sequence.name}}",
];

const LINK_STEP_TYPES: StepType[] = ["EMAIL", "SMS", "WHATSAPP"];

/** Full cycle as entered (normalized case, keeps duplicates and order). */
const formatFullStepPattern = (pattern: StepType[]): string =>
  pattern.map((t) => String(t).toUpperCase().trim()).join(", ");

/** Unique channels in first-seen order — for OUTPUT FORMAT / STYLE only. */
const uniqueChannelsInOrder = (pattern: StepType[]): StepType[] => {
  const seen = new Set<StepType>();
  const result: StepType[] = [];
  for (const t of pattern) {
    const normalized = String(t).toUpperCase().trim() as StepType;
    if (!STEP_TYPE_LIST.includes(normalized) || seen.has(normalized)) continue;
    seen.add(normalized);
    result.push(normalized);
  }
  return result;
};

const buildCanonicalSequencePlanSection = (
  fullStepPattern: string,
  interval: number
): string => `## SEQUENCE PLAN (for scheduling — read carefully)

- StepTypes pattern: ${fullStepPattern} (repeat cyclically to match total step count when a sequence is generated).
- IntervalDays: ${interval} (days between consecutive steps).

(The app may also pass exact step type and order in "--- STEP CONTEXT ---". Always obey that block for the current message.)`;

/** Overwrite AI-written SEQUENCE PLAN so the step pattern matches user input exactly. */
const injectSequencePlanSection = (
  template: string,
  fullStepPattern: string,
  interval: number
): string => {
  const canonical = buildCanonicalSequencePlanSection(
    fullStepPattern,
    interval
  );

  const sectionRegex =
    /## SEQUENCE PLAN[\s\S]*?(?=\n---\s*\n|\n## [A-Z])/m;

  if (sectionRegex.test(template)) {
    return template.replace(sectionRegex, canonical);
  }

  const firstSectionBreak = template.indexOf("\n---\n");
  if (firstSectionBreak !== -1) {
    return (
      template.slice(0, firstSectionBreak) +
      "\n\n" +
      canonical +
      template.slice(firstSectionBreak)
    );
  }

  return `${template}\n\n${canonical}`;
};

const STEP_OUTPUT_FORMAT: Record<
  StepType,
  (opts: { hasCtaLink: boolean }) => string
> = {
  EMAIL: ({ hasCtaLink }) => `### If current step is EMAIL

1. **Line 1 MUST be exactly:** \`SUBJECT: <short, human subject line>\`
2. **Line 2 MUST be blank.**
3. **From line 3:** email body with greeting, body, sign-off.
4. In the **first or second paragraph**, include a **brief project recap in one short paragraph** when a transcript is available.
5. ${
    hasCtaLink
      ? "Include the CTA link once in the body."
      : "Use a reply-based CTA (e.g., \"Reply to this email\"). Do NOT include any URL."
  }
6. Early steps: warmer / reconnection. Later steps: gentle, low-pressure urgency (still consultative).`,

  SMS: ({ hasCtaLink }) => `### If current step is SMS

- **No subject line.**
- **2–4 short sentences max.** ${
    hasCtaLink
      ? "One clear CTA with the provided link."
      : "One clear reply-based CTA. No URL."
  }
- Same strategic goals as email, but much tighter.`,

  WHATSAPP: ({ hasCtaLink }) => `### If current step is WHATSAPP

- **No subject line.**
- **3–6 short sentences.** Conversational tone; light formatting (*bold*, _italic_) allowed.
- ${
    hasCtaLink
      ? "Include the CTA link once."
      : "Use a reply-based CTA. No URL."
  }`,

  CALL: () => `### If current step is CALL

- **No subject line.**
- **5–8 concise bullet points** as talking points for a live follow-up phone call.
- Include discussion points, questions for the lead, and value propositions.
- Do not use email subject/body format.`,
};

const STEP_STYLE_REFERENCE: Record<
  StepType,
  (opts: { hasCtaLink: boolean }) => string
> = {
  EMAIL: ({ hasCtaLink }) => {
    const cta = hasCtaLink
      ? "Grab a time here: https://example.com/book"
      : "Reply if you'd like to continue the conversation.";
    return `EMAIL (tone only):
Subject: Following up on our conversation

Hi {{lead.name}},

[Short personalized opener based on context.]

[Value proposition and next step.]

${cta}

Best,
[Sender]`;
  },

  SMS: ({ hasCtaLink }) => {
    const cta = hasCtaLink
      ? " Book here: https://example.com/book"
      : " Reply if you're interested.";
    return `SMS (tone only):
Hey {{lead.name}} — [brief context]. [One clear next step].${cta}`;
  },

  WHATSAPP: ({ hasCtaLink }) => {
    const cta = hasCtaLink
      ? " Link: https://example.com/book"
      : " Let me know if you'd like to chat.";
    return `WHATSAPP (tone only):
Hi {{lead.name}}! [Friendly opener]. [Short value line].${cta}`;
  },

  CALL: () => `CALL (talking points only):
- Open: reference {{lead.name}} and why you're calling
- Recap their goal or pain from context
- Offer next step (meeting, PRD session, demo)
- Handle objection: timing / budget
- Close: agree on a concrete follow-up action`,

};

const buildOutputFormatSection = (
  types: StepType[],
  hasCtaLink: boolean
): string =>
  types
    .map((t) => STEP_OUTPUT_FORMAT[t]({ hasCtaLink }))
    .join("\n\n");

const buildStyleReferencesSection = (
  types: StepType[],
  hasCtaLink: boolean
): string =>
  types
    .map((t) => STEP_STYLE_REFERENCE[t]({ hasCtaLink }))
    .join("\n\n");

const buildExampleTemplate = (
  fullStepPattern: string,
  interval: number,
  channels: StepType[],
  hasCtaLink: boolean
): string => {
  const channelsLabel = channels.join(", ");
  const outputSection = buildOutputFormatSection(channels, hasCtaLink);
  const styleSection = buildStyleReferencesSection(channels, hasCtaLink);
  const sequencePlan = buildCanonicalSequencePlanSection(
    fullStepPattern,
    interval
  );

  return `You are a Virtual Assistant representing the sender described in this template.

A meeting transcript (when available) may be appended below under "--- TRANSCRIPT ---".

Your task is to generate ONE message for the CURRENT STEP ONLY, using the step context appended below (step number, channel type from the sequence plan, position in sequence).

---

${sequencePlan}

---

## GOALS

- [Derived from the user's scenario and sequence goal when the template is generated.]

---

## PERSONALIZATION & LINKS

- Address the lead by name using {{lead.name}}.
- Company / context: {{lead.company}}, {{lead.location}}, stage: {{lead.followUpStage}}, notes: {{lead.notes}} (omit empty parts).

---

## OUTPUT FORMAT (STRICT — required for the system)

${outputSection}

---

## STYLE REFERENCES (do not copy verbatim — adapt to transcript and step position)

${styleSection}`;
};

const buildOutputFormatRulesList = (types: StepType[]): string =>
  types
    .map((t) => {
      switch (t) {
        case "EMAIL":
          return "   - For EMAIL: Line 1 must be \"SUBJECT: <subject>\", Line 2 blank, then body";
        case "SMS":
          return "   - For SMS: No subject line, 2-4 sentences max";
        case "WHATSAPP":
          return "   - For WHATSAPP: No subject line, 3-6 sentences, conversational tone";
        case "CALL":
          return "   - For CALL: No subject line, 5-8 bullet talking points only";
        default:
          return "";
      }
    })
    .filter(Boolean)
    .join("\n");

const buildGenerationPromptSectionList = (
  types: StepType[],
  hasCtaLink: boolean
): string => {
  const lines: string[] = [];

  for (const t of types) {
    switch (t) {
      case "EMAIL":
        lines.push(
          `   - EMAIL: Line 1 "SUBJECT: ...", Line 2 blank, body from Line 3`,
          hasCtaLink
            ? "     Include the CTA link once in the body."
            : "     Use a reply-based CTA. Do NOT include any URL."
        );
        break;
      case "SMS":
        lines.push(
          "   - SMS: No subject line",
          hasCtaLink
            ? "     2-4 sentences max with the CTA link once."
            : "     2-4 sentences max with a reply-based CTA. No URL."
        );
        break;
      case "WHATSAPP":
        lines.push(
          "   - WHATSAPP: No subject line, 3-6 sentences, conversational tone, light formatting (*bold*, _italic_) allowed",
          hasCtaLink
            ? "     Include the CTA link once."
            : "     Reply-based CTA only. No URL."
        );
        break;
      case "CALL":
        lines.push(
          "   - CALL: No subject line, 5-8 bullet talking points for a live sales follow-up call (not an email body)"
        );
        break;
    }
  }

  return lines.join("\n");
};

const buildCtaInstruction = (
  types: StepType[],
  hasCtaLink: boolean,
  ctaLink?: string
): string => {
  const linkTypes = types.filter((t) => LINK_STEP_TYPES.includes(t));
  const hasCall = types.includes("CALL");

  if (hasCtaLink && ctaLink) {
    const linkChannels =
      linkTypes.length > 0 ? linkTypes.join(", ") : "N/A";
    let text = `- Booking CTA: ${ctaLink}\n- Include this CTA link once in: ${linkChannels}.`;
    if (hasCall) {
      text +=
        "\n- For CALL steps: mention the next step verbally; do not read a long URL aloud.";
    }
    return text;
  }

  let text =
    '- No CTA link was provided. Use reply-based CTAs (e.g., "Reply to this email", "Let me know if you\'d like to chat"). Do NOT invent any URL.';
  if (hasCall) {
    text += "\n- For CALL steps: agree on a verbal next step only.";
  }
  return text;
};

const buildGenerationPrompt = (input: GeneratePromptTextInput): string => {
  const pattern = input.stepTypesPattern as StepType[];
  const fullStepPattern = formatFullStepPattern(pattern);
  const channelsInPattern = uniqueChannelsInOrder(pattern);
  const interval = input.intervalDays ?? 3;
  const tone = input.toneStyle ?? "Professional but warm and conversational";

  const hasCtaLink = !!input.ctaLink;
  const hasCompanyName = !!input.companyName;

  const ctaInstruction = buildCtaInstruction(
    channelsInPattern,
    hasCtaLink,
    input.ctaLink
  );

  const companyInstruction = hasCompanyName
    ? `Company Name: ${input.companyName}`
    : `Company Name: Not provided. Reference the sender by name only. Do NOT invent a company name.`;

  const channelsList = channelsInPattern.join(", ");
  const exampleTemplate = buildExampleTemplate(
    fullStepPattern,
    interval,
    channelsInPattern,
    hasCtaLink
  );
  const outputFormatRules = buildOutputFormatRulesList(channelsInPattern);
  const generationSection5 = buildGenerationPromptSectionList(
    channelsInPattern,
    hasCtaLink
  );
  const styleChannelsLabel = channelsInPattern.join(", ");

  return `You are an expert prompt engineer. Your task is to generate a PROMPT TEMPLATE (a meta-prompt) that will later be used to instruct an AI to write follow-up messages for leads.

CRITICAL RULES:
1. You are NOT writing actual follow-up messages. You are writing a TEMPLATE (instructions) that tells AI how to generate those messages later.
2. The template MUST use these placeholder variables (double curly braces) — do NOT replace them with real values:
   ${AVAILABLE_VARIABLES.join(", ")}
3. The template MUST follow the exact structural format shown in the example below.
4. The OUTPUT FORMAT section is MANDATORY and must include ONLY these channels (one block each): ${channelsList}.
${outputFormatRules}
5. Do NOT include OUTPUT FORMAT or STYLE REFERENCES for channels not in this list: ${channelsList}.
6. SEQUENCE PLAN — use this EXACT text verbatim (do not deduplicate, truncate, reorder, or drop any entry):
${buildCanonicalSequencePlanSection(fullStepPattern, interval)}
7. The template must instruct AI to generate ONE message for the CURRENT STEP ONLY.
8. Include STYLE REFERENCES with examples ONLY for: ${styleChannelsLabel} (using {{lead.name}} and other variables).
9. Do NOT invent or hallucinate any URL or company name that was not provided by the user.
10. Do NOT change the StepTypes pattern from the user's input: ${fullStepPattern}

---

USER'S INPUTS:

${companyInstruction}
Sender Name: ${input.senderName}
${hasCtaLink ? `CTA Link: ${input.ctaLink}` : "CTA Link: Not provided"}

Follow-up Scenario:
${input.followUpScenario}

Service/Product Description:
${input.serviceDescription}

Sequence Goal:
${input.sequenceGoal}

Tone & Style: ${tone}

Step Types Pattern (full cycle — preserve order and duplicates): ${fullStepPattern}
Interval Days: ${interval}
${input.additionalNotes ? `\nAdditional Notes:\n${input.additionalNotes}` : ""}

---

EXAMPLE TEMPLATE (follow this structure; OUTPUT FORMAT / STYLE only for channels: ${channelsList}):

${exampleTemplate}

---

NOW generate a complete prompt template based on the user's inputs above. Follow the same section structure:
1. Opening context (who the AI is writing for, scenario)
2. SEQUENCE PLAN — copy the exact block from rule 6 above
3. GOALS (derived from the user's scenario and sequence goal)
4. PERSONALIZATION & LINKS section must include:
   ${ctaInstruction}
   - Sign emails as: ${input.senderName}
   - Use {{variables}} for lead personalization
5. OUTPUT FORMAT (STRICT) — include ONLY these channels, no others:
${generationSection5}
6. STYLE REFERENCES — include examples ONLY for: ${styleChannelsLabel}${!hasCtaLink ? " (no URLs in examples)" : ""}

Output ONLY the template text. No explanations, no markdown code fences.`;
};

const generatePromptText = async (
  userId: string,
  input: GeneratePromptTextInput
): Promise<{ promptText: string }> => {
  const aiSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: { aiProvider: true, aiModel: true },
  });
  const aiApiKey = await SettingsService.getDecryptedField(userId, "aiApiKey");

  if (!aiSettings?.aiProvider || !aiApiKey) {
    throw new AppError(
      400,
      "AI provider and API key not configured. Please set them in Settings."
    );
  }

  const pattern = input.stepTypesPattern as StepType[];
  const fullStepPattern = formatFullStepPattern(pattern);
  const interval = input.intervalDays ?? 3;

  const prompt = buildGenerationPrompt(input);

  const aiResponse = await generateContent(
    {
      provider: aiSettings.aiProvider as AIProvider,
      apiKey: aiApiKey,
      model: aiSettings.aiModel || undefined,
    },
    prompt
  );

  let promptText = aiResponse.content
    .replace(/^```(?:markdown|text)?\n?/i, "")
    .replace(/\n?```$/i, "")
    .trim();

  promptText = injectSequencePlanSection(
    promptText,
    fullStepPattern,
    interval
  );

  return { promptText };
};

export const PromptTemplateService = {
  createTemplate,
  getTemplates,
  getTemplateById,
  getTemplateByStage,
  updateTemplate,
  deleteTemplate,
  generatePromptText,
};
