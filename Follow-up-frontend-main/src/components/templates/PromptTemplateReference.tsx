import type { ReactNode } from "react";
import { Lightbulb, Braces, FileText } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";

export const PROMPT_TEMPLATE_VARIABLE_ROWS = [
  { variable: "{{lead.name}}", dbField: "Lead.name", exampleValue: "Rahim Ahmed" },
  { variable: "{{lead.email}}", dbField: "Lead.email", exampleValue: "rahim@acme.com" },
  { variable: "{{lead.phone}}", dbField: "Lead.phone", exampleValue: "+8801700000000" },
  { variable: "{{lead.company}}", dbField: "Lead.company", exampleValue: "Acme Corp" },
  { variable: "{{lead.location}}", dbField: "Lead.location", exampleValue: "Dhaka, Bangladesh" },
  {
    variable: "{{lead.followUpStage}}",
    dbField: "Lead.followUpStage",
    exampleValue: "Interested",
  },
  {
    variable: "{{lead.notes}}",
    dbField: "Lead.notes",
    exampleValue: "Met at DhakaTech 2024",
  },
  { variable: "{{sequence.name}}", dbField: "Sequence.name", exampleValue: "Q1 Outreach" },
] as const;

export const PROMPT_TEMPLATE_EXAMPLE = `You are a Virtual Assistant for Artech Digital, an AI development agency run by Artur Abdullin.

The client booked a call but didn't show up. A meeting transcript (when available) is appended below under "--- TRANSCRIPT ---".

Your task is to generate ONE message for the CURRENT STEP ONLY, using the step context appended below (step number, type EMAIL vs SMS, position in sequence).

---

## SEQUENCE PLAN (for scheduling — read carefully)

The follow-up sequence alternates channels and uses a fixed gap between steps. When interpreting this template for planning:
- StepTypes pattern: SMS, EMAIL, SMS, EMAIL, SMS, EMAIL (repeat or truncate to match total step count).
- IntervalDays: 3 (days between consecutive steps).

(The app may also pass exact step type and order in "--- STEP CONTEXT ---". Always obey that block for the current message.)

---

## GOALS

- Acknowledge politely that they missed the call — no blame; friendly and understanding.
- Re-engage by referencing their goals, idea, or problem from the transcript (when present).
- Encourage booking a PRD (Product Requirement Document) session. Explain clearly:
  - Structured ~30-minute strategy call to define project roadmap.
  - The PRD covers: functional & non-functional requirements, technical architecture, API integrations, feature scope, deliverables, timeline, and budget.
  - Useful even if they don't hire you — it's a blueprint for future work.
- Tone: professional, warm, consultative — trusted expert, not pushy salesperson.

---

## PERSONALIZATION & LINKS

- Address the lead by name using {{lead.name}} (natural language; you may use only the first word as a first name if it reads well).
- Company / context: {{lead.company}}, {{lead.location}}, stage: {{lead.followUpStage}}, notes: {{lead.notes}} (use only what helps; omit empty parts).
- Booking CTA: https://calendly.com/artech-digital/30min-call
- Sign emails as: Artur Abdullin (or “Best, Artur”).

---

## OUTPUT FORMAT (STRICT — required for the system)

### If current step is EMAIL

1. **Line 1 MUST be exactly:** \`SUBJECT: <short, human subject line>\`
2. **Line 2 MUST be blank.**
3. **From line 3:** email body with greeting, body, sign-off.
4. In the **first or second paragraph** of the body, include a **brief project recap in one short paragraph** (what they want, problem, direction) inferred from the transcript — this replaces a separate "summary section" so parsing stays correct.
5. Include the Calendly link once in the body.
6. Early steps: warmer / reconnection. Later steps: same tone but **gentle, low-pressure urgency** (still consultative).

### If current step is SMS

- **No subject line.**
- **2–4 short sentences max.** One clear CTA with the same Calendly link.
- Same strategic goals as email, but much tighter.

---

## STYLE REFERENCES (do not copy verbatim — adapt to transcript and step position)

EMAIL (tone only):
Subject: Missed you on our call — let's map your product properly

Hi {{lead.name}},

We didn't connect on our scheduled call — totally fine, these things happen. From what you shared about [specific thread from transcript], I'd still love to help you get clarity.

If you're open to it, let's do a PRD session: a focused call where we outline architecture, integrations, scope, deliverables, timeline, and budget. You keep the document as a blueprint either way.

Grab a time here: https://calendly.com/artech-digital/30min-call

Best,
Artur Abdullin

SMS (tone only):
Hey {{lead.name}} — Artur from Artech Digital. We missed you on our call; no worries. Want to lock a quick PRD session? You'll get a full roadmap doc either way. Book here: https://calendly.com/artech-digital/30min-call`;

function IdeaSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold tracking-wide text-emerald-600">
        ## {title}
      </h3>
      <div className="text-sm leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

export default function PromptTemplateReference() {
  const handleCopyVariable = async (variable: string) => {
    try {
      await navigator.clipboard.writeText(variable);
      showSuccess(`Copied ${variable}`);
    } catch {
      showError("Failed to copy variable");
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50/60 p-1 shadow-sm">
      <Tabs defaultValue="idea" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-lg bg-slate-100/90 p-1">
          <TabsTrigger
            value="idea"
            className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Lightbulb className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Prompt idea</span>
          </TabsTrigger>
          <TabsTrigger
            value="variables"
            className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Braces className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Variables</span>
          </TabsTrigger>
          <TabsTrigger
            value="example"
            className="gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Example</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="idea" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <div className="space-y-5">
            <IdeaSection title="SEQUENCE PLAN">
              <p>Steps: SMS, Email, SMS, Email, SMS, Email</p>
              <p>IntervalDays: 3</p>
            </IdeaSection>

            <IdeaSection title="WHO YOU ARE WRITING FOR">
              <p>
                You are writing a professional follow-up sequence for {"{{lead.name}}"} from{" "}
                {"{{lead.company}}"}.
              </p>
              <p>Location: {"{{lead.location}}"}</p>
              <p>Current Stage: {"{{lead.followUpStage}}"}</p>
              <p>Notes: {"{{lead.notes}}"}</p>
            </IdeaSection>

            <IdeaSection title="WHAT WE OFFER">
              <p>[Write a description of your product or service here]</p>
              <p>
                Example: We provide AI-powered recruitment automation that reduces hiring time by 60%.
              </p>
            </IdeaSection>

            <IdeaSection title="GOAL OF THIS SEQUENCE">
              <p>[Write the goal of this sequence here]</p>
              <p>
                Example: Book a 15-minute discovery call with {"{{lead.name}}"} to demonstrate our
                platform.
              </p>
            </IdeaSection>

            <IdeaSection title="TONE & STYLE">
              <ul className="list-inside list-disc space-y-1">
                <li>Professional but warm and conversational</li>
                <li>Never pushy or salesy</li>
                <li>Personalize using the lead&apos;s name and company where natural</li>
                <li>Each message should feel like it comes from a real person, not a robot</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="SMS GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>Maximum 160 characters</li>
                <li>Casual, direct, one clear action</li>
                <li>No links unless absolutely necessary</li>
                <li>
                  Example format: &quot;Hi {"{{lead.name}}"}, [1 sentence value prop]. Worth a quick
                  chat? Reply YES.&quot;
                </li>
              </ul>
            </IdeaSection>

            <IdeaSection title="EMAIL GUIDELINES">
              <ul className="list-inside list-disc space-y-1">
                <li>Subject: Short (5-7 words), curiosity-driven, personalized</li>
                <li>Opening: Reference something specific (company, stage, or notes)</li>
                <li>Body: 3-4 sentences max — one idea only</li>
                <li>Closing: One soft call-to-action (reply, book a call, etc.)</li>
                <li>Signature: Keep it simple</li>
              </ul>
            </IdeaSection>

            <IdeaSection title="IMPORTANT RULES">
              <ul className="list-inside list-disc space-y-1">
                <li>Do NOT repeat the same angle in consecutive messages</li>
                <li>Each step should build naturally on the previous ones</li>
                <li>SMS steps should be much shorter than email steps</li>
                <li>Never mention competitors</li>
                <li>Always end with a clear but low-pressure next step</li>
              </ul>
            </IdeaSection>
          </div>
        </TabsContent>

        <TabsContent value="variables" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <p className="mb-1 text-sm font-medium text-foreground">Template variables</p>
          <p className="mb-3 text-xs text-muted-foreground">
            Click a variable to copy it. Values match your database fields.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="w-[1%] whitespace-nowrap">Variable</TableHead>
                  <TableHead>DB Field</TableHead>
                  <TableHead>Example Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROMPT_TEMPLATE_VARIABLE_ROWS.map((row) => (
                  <TableRow key={row.variable} className="border-border">
                    <TableCell className="align-middle">
                      <button
                        type="button"
                        onClick={() => void handleCopyVariable(row.variable)}
                        title={`Copy ${row.variable}`}
                        className="rounded-md border border-input bg-muted px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {row.variable}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">{row.dbField}</TableCell>
                    <TableCell className="align-middle">
                      <span className="inline-block rounded-md border border-input bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                        {row.exampleValue}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="example" className="mt-0 rounded-b-lg px-4 pb-4 pt-3">
          <p className="mb-2 text-sm font-medium text-slate-800">Sample prompt (for inspiration)</p>
          <pre className="max-h-[min(420px,55vh)] overflow-y-auto whitespace-pre-wrap rounded-lg border border-slate-200 bg-white/90 p-3 text-xs leading-relaxed text-slate-600 shadow-inner">
            {PROMPT_TEMPLATE_EXAMPLE}
          </pre>
        </TabsContent>
      </Tabs>
    </div>
  );
}
