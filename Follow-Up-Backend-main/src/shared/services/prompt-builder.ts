interface StepContext {
  stepOrder: number;
  totalSteps: number;
  stepType: string;
}

interface PreviousStep {
  stepOrder: number;
  stepType: string;
  subject: string | null;
  content: string | null;
}

interface LeadInfo {
  name: string;
  email: string | null;
  phone?: string | null;
  company: string | null;
  location?: string | null;
  followUpStage: string | null;
  notes?: string | null;
}

interface SequenceStrategy {
  situation?: string | null;
  goal?: string | null;
  tone?: string | null;
  intensity?: string | null;
}

interface SenderProfile {
  name?: string | null;
  position?: string | null;
  company?: string | null;
  bookingLink?: string | null;
  serviceDescription?: string | null;
}

interface BuildPromptParams {
  promptText: string;
  sequenceName?: string;
  stepContext: StepContext;
  previousSteps: PreviousStep[];
  lead: LeadInfo;
  transcript: string | null;
  /** Optional configurator inputs from the "Create Follow-up Sequence" UI. */
  strategy?: SequenceStrategy;
  /** Sender profile from Settings — who is sending, used to sign off + add CTAs. */
  sender?: SenderProfile;
}

const formatSender = (sender?: SenderProfile): string => {
  if (!sender) return "";
  const lines: string[] = [];
  if (sender.name) lines.push(`Sender name: ${sender.name}`);
  if (sender.position) lines.push(`Sender role/position: ${sender.position}`);
  if (sender.company) lines.push(`Sender company: ${sender.company}`);
  if (sender.serviceDescription)
    lines.push(`What the sender offers: ${sender.serviceDescription}`);
  if (sender.bookingLink)
    lines.push(`Booking link (include it when proposing a call): ${sender.bookingLink}`);
  if (lines.length === 0) return "";
  return `\n\n--- SENDER ---\n${lines.join(
    "\n"
  )}\nSign off as this sender and, when suggesting a call or meeting, include the booking link exactly as given (for voice/SMS, say you'll send the link).`;
};

// Per-situation instructions the AI reads to tailor content. Keyed by the
// configurator's situation id (No-show, Post-call follow-up, etc.).
const SITUATION_GUIDANCE: Record<string, string> = {
  "no-show":
    "The lead booked a meeting but did not attend. Acknowledge it kindly and without guilt-tripping, assume good intent (things come up), and make rescheduling effortless — offer two specific time options.",
  "post-call":
    "You recently had a call or meeting with the lead. Reference that conversation naturally, recap the agreed next step, and keep momentum moving toward it.",
  proposal:
    "You sent the lead a proposal. Confirm they received it, invite questions, pre-empt likely objections, and create gentle urgency to reach a decision.",
  "no-reply":
    "The lead has gone quiet after previous outreach. Re-engage from a fresh angle or with new value, keep it short, and make replying effortless.",
  "re-engage":
    "The lead went cold a while ago. Reconnect warmly, remind them of the value you provide, and keep the ask low-pressure.",
  custom:
    "Follow the situation described by the user and craft an appropriate, genuinely helpful follow-up.",
};

// Per-goal instructions keyed by the configurator's goal id.
const GOAL_GUIDANCE: Record<string, string> = {
  "book-call":
    "Goal: get a specific call booked. Propose concrete times and an easy way to confirm.",
  "get-reply": "Goal: get any reply at all. Ask one simple, low-friction question.",
  "close-proposal":
    "Goal: move the proposal to a yes/no decision. Reinforce value and reduce perceived risk.",
  qualify: "Goal: qualify the lead. Tactfully probe fit, timeline, and budget.",
  other: "Goal: pursue the outcome the user set for this sequence.",
};

// Voice & formatting rules applied to every lead-facing message (email, SMS,
// WhatsApp). These channels are plain text, so any Markdown the model emits
// (**bold**, - bullets, [text](url) links) shows up as raw symbols. This block
// forces clean, human-sounding plain text so the lead can't tell it's AI.
const WRITING_STYLE = `\n\n--- WRITING STYLE (MUST FOLLOW) ---
Write like a real, thoughtful person — never in a way that reveals this was written by AI.
- Output PLAIN TEXT only. Never use Markdown or formatting symbols: no asterisks (* or **), underscores (_), backticks, or heading marks (#).
- Do NOT use bullet points or dashes to start lines. Write in short, natural sentences and small paragraphs instead.
- Avoid em-dashes (—); use commas or periods.
- Write links as a plain URL on their own line with a short label, e.g. "Book a call here: https://example.com/abc". Never use [text](url) link syntax.
- Do NOT add label headings like "What we covered:", "Why this matters:", or "Next step:". Let the message flow naturally.
- Do not use emoji or decorative symbols of any kind (no 👉, ✅, 🔥). Keep it clean and professional.
- Keep it warm, specific and concise, and avoid stiff, generic AI phrasing. Sound like a helpful human who knows this lead.`;

const describe = (
  map: Record<string, string>,
  key?: string | null
): string | null => {
  if (!key) return null;
  return map[key] ?? key;
};

const formatStrategy = (strategy?: SequenceStrategy): string => {
  if (!strategy) return "";
  const lines: string[] = [];
  const situation = describe(SITUATION_GUIDANCE, strategy.situation);
  const goal = describe(GOAL_GUIDANCE, strategy.goal);
  if (situation) lines.push(`Situation — ${situation}`);
  if (goal) lines.push(goal);
  if (strategy.tone) lines.push(`Tone of voice: ${strategy.tone}`);
  if (strategy.intensity)
    lines.push(
      `Intensity: ${strategy.intensity} (light = soft & patient, standard = balanced, aggressive = direct & urgent).`
    );
  if (lines.length === 0) return "";
  return `\n\n--- STRATEGY ---\n${lines.join(
    "\n"
  )}\nWrite the message in the specified tone and intensity, tailored to the situation, and optimized to achieve the goal.`;
};

const resolveVariables = (text: string, lead: LeadInfo, sequenceName?: string): string => {
  return text
    .replace(/\{\{lead\.name\}\}/gi, lead.name || "")
    .replace(/\{\{lead\.email\}\}/gi, lead.email || "(not provided)")
    .replace(/\{\{lead\.phone\}\}/gi, lead.phone || "(not provided)")
    .replace(/\{\{lead\.company\}\}/gi, lead.company || "")
    .replace(/\{\{lead\.location\}\}/gi, lead.location || "(not provided)")
    .replace(/\{\{lead\.followUpStage\}\}/gi, lead.followUpStage || "")
    .replace(/\{\{lead\.notes\}\}/gi, lead.notes || "")
    .replace(/\{\{sequence\.name\}\}/gi, sequenceName || "");
};

const getPositionHint = (stepOrder: number, totalSteps: number): string => {
  if (stepOrder === 1) return "First message — warm, friendly, introductory.";
  if (stepOrder === totalSteps)
    return "Final message — create gentle urgency, last chance feel.";

  const ratio = stepOrder / totalSteps;
  if (ratio <= 0.4) return "Early in sequence — build rapport and value.";
  if (ratio <= 0.7) return "Mid-sequence — reinforce value, add light urgency.";
  return "Late in sequence — stronger urgency, clear call-to-action.";
};

const formatPreviousSteps = (steps: PreviousStep[]): string => {
  if (steps.length === 0) return "";

  const lines = steps.map((s) => {
    let text = `Step ${s.stepOrder} (${s.stepType}):`;
    if (s.subject) text += `\nSubject: ${s.subject}`;
    if (s.content) text += `\n${s.content}`;
    return text;
  });

  return `\n--- PREVIOUSLY SENT MESSAGES ---\n${lines.join("\n\n")}`;
};

export const buildPrompt = (params: BuildPromptParams): string => {
  const { promptText, sequenceName, stepContext, previousSteps, lead, transcript, strategy, sender } =
    params;

  const positionHint = getPositionHint(
    stepContext.stepOrder,
    stepContext.totalSteps
  );

  // Replace {{variables}} in the promptText with actual lead/sequence data.
  // When no template is linked (configurator-only flow), fall back to a base brief.
  const baseText =
    promptText.trim() ||
    "You are an expert sales follow-up assistant. Write a personalized follow-up message to the lead below on behalf of the sender.";
  let prompt = resolveVariables(baseText, lead, sequenceName);

  prompt += formatStrategy(strategy);
  prompt += formatSender(sender);

  prompt += `\n\n--- STEP CONTEXT ---`;
  prompt += `\nStep: ${stepContext.stepOrder} of ${stepContext.totalSteps}`;
  prompt += `\nMessage type: ${stepContext.stepType}`;
  prompt += `\nPosition: ${positionHint}`;

  // Plain-text channels get the human writing-style rules. CALL is exempt: it
  // returns a structured brief for the voice agent (section headers + bullets),
  // not a lead-facing message.
  if (stepContext.stepType !== "CALL") {
    prompt += WRITING_STYLE;
  }

  if (stepContext.stepType === "EMAIL") {
    prompt += `\n\nIMPORTANT: Start your response with "SUBJECT: " on the first line, followed by the email body in plain text — a few short, natural paragraphs. No Markdown, no ** or bullet symbols, and write any link as a plain URL.`;
  } else if (stepContext.stepType === "WHATSAPP") {
    prompt += `\n\nIMPORTANT: Generate only the WhatsApp message text — plain, warm and conversational (3-6 short sentences). No subject line, no Markdown, no asterisks or underscores; write any link as a plain URL.`;
  } else if (stepContext.stepType === "CALL") {
    prompt += `\n\nIMPORTANT: Generate structured call context for an AI voice agent. The template above describes who you represent (sender name and company)—use that for GREETING and SENDER. No subject line. Spoken lines must be natural plain speech — no asterisks, Markdown, or emoji. For voice: do not read long URLs aloud; if a meeting link exists, say you will text or email it after the call. Use this exact section headers:

GREETING: The first thing the agent says when the call connects—1–2 short spoken sentences, use the lead's name, match this step's situation (e.g. missed call vs first touch vs final follow-up). Must sound natural on a phone.
SENDER: One line—caller name and company exactly as implied by the template above (e.g. "Artur Abdullin, Artech Digital").
OBJECTIVE: One sentence—goal of this call
BACKGROUND: 2–4 sentences—lead context, prior messages, meeting notes from transcript if any
KEY POINTS: 3–5 bullet lines—what to convey during the conversation
QUESTIONS: 2–3 bullet lines—what to ask the lead
CLOSING: One sentence—how to end or what next step to propose`;
  } else {
    prompt += `\n\nIMPORTANT: Generate only the SMS text — plain and concise (2-4 sentences max). No subject line, no Markdown or symbols. If a link is essential, include it as a plain URL.`;
  }

  const prevText = formatPreviousSteps(previousSteps);
  if (prevText) prompt += `\n${prevText}`;

  prompt += `\n\n--- LEAD INFO ---`;
  prompt += `\nName: ${lead.name}`;
  prompt += `\nEmail: ${lead.email ?? "(not provided)"}`;
  if (lead.phone) prompt += `\nPhone: ${lead.phone}`;
  prompt += `\nCompany: ${lead.company}`;
  if (lead.location) prompt += `\nLocation: ${lead.location}`;
  if (lead.followUpStage) prompt += `\nFollow-up Stage: ${lead.followUpStage}`;
  if (lead.notes) prompt += `\nNotes: ${lead.notes}`;

  if (transcript) {
    prompt += `\n\n--- TRANSCRIPT ---\n${transcript}`;
  }

  return prompt;
};

// Safety net: strip Markdown/symbols the model may still emit, so plain-text
// channels never show raw **, [text](url), leading bullets, etc. Not applied to
// CALL (its output is a structured brief, not a lead-facing message).
export const stripMarkdown = (text: string): string =>
  text
    // [label](https://url) -> "label: https://url" (keep the link usable)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, "$1: $2")
    // other [label](target) -> "label (target)"
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    // **bold** / __bold__ -> bold
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    // *italic* / _italic_ (standalone, not mid-word) -> italic
    .replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=[\s).,!?]|$)/g, "$1$2")
    .replace(/(^|[\s(])_(?!\s)([^_\n]+?)_(?=[\s).,!?]|$)/g, "$1$2")
    // `code` -> code
    .replace(/`([^`]+)`/g, "$1")
    // leading "#" headings -> drop the marks
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, "")
    // leading "- ", "* ", "• " bullets -> drop the marker, keep the line
    .replace(/^[ \t]*[-*•][ \t]+/gm, "")
    // decorative emoji / pictographs / arrows anywhere -> drop (keeps it professional)
    .replace(
      /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}\u{FE00}-\u{FE0F}\u{200D}]/gu,
      ""
    )
    // spaced em/en dash -> comma (keeps ranges like 2–3 intact)
    .replace(/ +[—–] +/g, ", ")
    // tidy up whitespace left behind
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ +([.,!?;:])/g, "$1")
    .replace(/^[ \t]+/gm, "")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

export const parseAIResponse = (
  response: string,
  stepType: string
): { subject: string | null; content: string } => {
  if (stepType === "CALL") {
    return { subject: null, content: response.trim() };
  }

  if (stepType === "SMS" || stepType === "WHATSAPP") {
    return { subject: null, content: stripMarkdown(response.trim()) };
  }

  const lines = response.trim().split("\n");
  const firstLine = lines[0] || "";

  if (firstLine.toUpperCase().startsWith("SUBJECT:")) {
    const subject = stripMarkdown(firstLine.replace(/^SUBJECT:\s*/i, "").trim());
    const content = stripMarkdown(lines.slice(1).join("\n").trim());
    return { subject, content: content || stripMarkdown(response.trim()) };
  }

  return { subject: null, content: stripMarkdown(response.trim()) };
};
