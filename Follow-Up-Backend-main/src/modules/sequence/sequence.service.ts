import prisma from "../../shared/prisma";
import AppError from "../../shared/errors/AppError";
import { syncLeadStatusFromActiveSequences } from "../lead/lead.service";
import {
  CreateSequenceInput,
  UpdateSequenceInput,
} from "./sequence.validation";
import { SettingsService } from "../settings/settings.service";
import { generateContent } from "../../shared/services/ai.service";
import { type AIProvider, STEP_TYPE_LIST } from "../../shared/constants";
import { buildPrompt, parseAIResponse } from "../../shared/services/prompt-builder";
import { SEQUENCE_STEP_STATUS } from "../../shared/sequence-step";
import { SEQUENCE_STATUS } from "../../shared/constants";

const createSequence = async (userId: string, payload: CreateSequenceInput) => {
  const lead = await prisma.lead.findFirst({
    where: { id: payload.leadId, userId },
  });

  if (!lead) {
    throw new AppError(404, "Lead not found");
  }

  const activeSequence = await prisma.sequence.findFirst({
    where: { leadId: payload.leadId, userId, status: SEQUENCE_STATUS.ACTIVE },
  });

  if (activeSequence) {
    throw new AppError(
      409,
      "This lead already has an active sequence. Pause or cancel it first."
    );
  }

  let promptTemplateId = payload.promptTemplateId || null;

  if (!promptTemplateId && lead.followUpStage) {
    const template = await prisma.promptTemplate.findFirst({
      where: { userId, followUpStage: lead.followUpStage },
    });
    if (template) {
      promptTemplateId = template.id;
    }
  }

  return prisma.sequence.create({
    data: {
      userId,
      leadId: payload.leadId,
      promptTemplateId,
      name: payload.name,
      totalSteps: payload.totalSteps,
      situation: payload.situation ?? null,
      goal: payload.goal ?? null,
      tone: payload.tone ?? null,
      intensity: payload.intensity ?? null,
      channels: payload.channels ?? [],
      intervalDays: payload.intervalDays ?? null,
    },
    include: {
      lead: { select: { name: true, email: true, followUpStage: true } },
      promptTemplate: { select: { id: true, name: true, followUpStage: true } },
    },
  });
};

const stepTypeSentCounts = (
  steps: { stepType: string; status: string }[]
) => {
  const sent = SEQUENCE_STEP_STATUS.SENT;
  const failed = SEQUENCE_STEP_STATUS.FAILED;
  const calling = SEQUENCE_STEP_STATUS.CALLING;
  let emailSteps = 0;
  let smsSteps = 0;
  let whatsappSteps = 0;
  let callSteps = 0;
  let emailSent = 0;
  let smsSent = 0;
  let whatsappSent = 0;
  let callSent = 0;

  for (const s of steps) {
    if (s.stepType === "EMAIL") {
      emailSteps++;
      if (s.status === sent || s.status == failed) emailSent++;
    } else if (s.stepType === "SMS") {
      smsSteps++;
      if (s.status === sent || s.status == failed) smsSent++;
    } else if (s.stepType === "WHATSAPP") {
      whatsappSteps++;
      if (s.status === sent || s.status == failed) whatsappSent++;
    } else if (s.stepType === "CALL") {
      callSteps++;
      if (s.status === sent || s.status == failed || s.status === calling) callSent++;
    }
  }

  return { emailSteps, smsSteps, whatsappSteps, callSteps, emailSent, smsSent, whatsappSent, callSent };
};

const getSequences = async (userId: string, status?: string) => {
  const where: Record<string, unknown> = { userId };
  if (status) {
    where.status = status;
  }

  const rows = await prisma.sequence.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      lead: { select: { name: true, email: true, company: true, followUpStage: true } },
      promptTemplate: { select: { id: true, name: true, followUpStage: true } },
      _count: { select: { steps: true } },
      steps: { select: { stepType: true, status: true } },
    },
  });

  return rows.map(
    ({ steps: stepRows, _count, ...sequence }) => ({
      ...sequence,
      _count: {
        ..._count,
        ...stepTypeSentCounts(stepRows),
      },
    })
  );
};

const getSequenceById = async (userId: string, sequenceId: string) => {
  const sequence = await prisma.sequence.findFirst({
    where: { id: sequenceId, userId },
    include: {
      lead: { select: { name: true, email: true, company: true, followUpStage: true } },
      promptTemplate: { select: { id: true, name: true, followUpStage: true } },
      steps: { orderBy: { stepOrder: "asc" } },
    },
  });

  if (!sequence) {
    throw new AppError(404, "Sequence not found");
  }

  return sequence;
};

const SEQUENCE_INCLUDE = {
  lead: { select: { name: true, email: true, followUpStage: true } },
  promptTemplate: { select: { id: true, name: true, followUpStage: true } },
  steps: { orderBy: { stepOrder: "asc" as const } },
};

const recoverSkippedSteps = async (sequenceId: string) => {
  const skippedSteps = await prisma.sequenceStep.findMany({
    where: { sequenceId, status: SEQUENCE_STEP_STATUS.SKIPPED },
    select: { id: true, content: true },
  });

  if (skippedSteps.length === 0) return;

  const withContent = skippedSteps
    .filter((s) => s.content)
    .map((s) => s.id);

  const withoutContent = skippedSteps
    .filter((s) => !s.content)
    .map((s) => s.id);

  if (withContent.length > 0) {
    await prisma.sequenceStep.updateMany({
      where: { id: { in: withContent } },
      data: { status: SEQUENCE_STEP_STATUS.DRAFT },
    });
  }

  if (withoutContent.length > 0) {
    await prisma.sequenceStep.updateMany({
      where: { id: { in: withoutContent } },
      data: { status: SEQUENCE_STEP_STATUS.PENDING },
    });
  }
};

const transitionToActive = async (
  sequenceId: string,
  sequence: Awaited<ReturnType<typeof getSequenceById>>
) => {
  const otherActive = await prisma.sequence.findFirst({
    where: {
      leadId: sequence.leadId,
      userId: sequence.userId,
      status: SEQUENCE_STATUS.ACTIVE,
      id: { not: sequenceId },
    },
  });

  if (otherActive) {
    throw new AppError(
      409,
      "This lead already has another active sequence. Pause or cancel it first."
    );
  }

  const stepCount = await prisma.sequenceStep.count({
    where: { sequenceId },
  });

  if (stepCount !== sequence.totalSteps) {
    throw new AppError(
      400,
      `All ${sequence.totalSteps} steps must be created before activation (currently ${stepCount})`
    );
  }

  await recoverSkippedSteps(sequenceId);

  const pendingSteps = await prisma.sequenceStep.count({
    where: { sequenceId, status: SEQUENCE_STEP_STATUS.PENDING },
  });

  if (pendingSteps > 0) {
    throw new AppError(
      400,
      `${pendingSteps} step(s) have no content. Generate content for all steps before activation.`
    );
  }

  const pastUnsent = await prisma.sequenceStep.findMany({
    where: {
      sequenceId,
      scheduledAt: { lte: new Date() },
      status: {
        notIn: [
          SEQUENCE_STEP_STATUS.SENT,
          SEQUENCE_STEP_STATUS.FAILED,
        ],
      },
    },
    select: { stepOrder: true },
  });

  if (pastUnsent.length > 0) {
    const orders = pastUnsent.map((s) => s.stepOrder).join(", ");
    throw new AppError(
      400,
      `Unsent step(s) ${orders} have past scheduled dates. Update them before activation.`
    );
  }

  return prisma.$transaction(async (tx) => {
    await tx.sequenceStep.updateMany({
      where: { sequenceId, status: SEQUENCE_STEP_STATUS.DRAFT },
      data: { status: SEQUENCE_STEP_STATUS.SCHEDULED },
    });

    const updated = await tx.sequence.update({
      where: { id: sequenceId },
      data: { status: SEQUENCE_STATUS.ACTIVE },
      include: SEQUENCE_INCLUDE,
    });

    await syncLeadStatusFromActiveSequences(sequence.leadId, tx);

    return updated;
  });
};

const transitionToDraft = async (
  sequenceId: string,
  sequence: Awaited<ReturnType<typeof getSequenceById>>
) => {
  return prisma.$transaction(async (tx) => {
    await tx.sequenceStep.updateMany({
      where: {
        sequenceId,
        status: {
          in: [
            SEQUENCE_STEP_STATUS.SCHEDULED,
            SEQUENCE_STEP_STATUS.SENDING,
            SEQUENCE_STEP_STATUS.SKIPPED,
            SEQUENCE_STEP_STATUS.CALLING,
          ],
        },
      },
      data: { status: SEQUENCE_STEP_STATUS.DRAFT },
    });

    const updated = await tx.sequence.update({
      where: { id: sequenceId },
      data: { status: SEQUENCE_STATUS.DRAFT },
      include: SEQUENCE_INCLUDE,
    });

    await syncLeadStatusFromActiveSequences(sequence.leadId, tx);

    return updated;
  });
};

const transitionToCancelled = async (
  sequenceId: string,
  sequence: Awaited<ReturnType<typeof getSequenceById>>
) => {
  return prisma.$transaction(async (tx) => {
    await tx.sequenceStep.updateMany({
      where: {
        sequenceId,
        status: {
          in: [
            SEQUENCE_STEP_STATUS.PENDING,
            SEQUENCE_STEP_STATUS.DRAFT,
            SEQUENCE_STEP_STATUS.SCHEDULED,
            SEQUENCE_STEP_STATUS.SENDING,
            SEQUENCE_STEP_STATUS.CALLING,
          ],
        },
      },
      data: { status: SEQUENCE_STEP_STATUS.SKIPPED },
    });

    const updated = await tx.sequence.update({
      where: { id: sequenceId },
      data: { status: SEQUENCE_STATUS.CANCELLED },
      include: SEQUENCE_INCLUDE,
    });

    await syncLeadStatusFromActiveSequences(sequence.leadId, tx);

    return updated;
  });
};

const transitionSimple = async (
  sequenceId: string,
  sequence: Awaited<ReturnType<typeof getSequenceById>>,
  newStatus: string
) => {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.sequence.update({
      where: { id: sequenceId },
      data: { status: newStatus },
      include: SEQUENCE_INCLUDE,
    });

    await syncLeadStatusFromActiveSequences(sequence.leadId, tx);

    return updated;
  });
};

const changeSequenceStatus = async (
  sequenceId: string,
  sequence: Awaited<ReturnType<typeof getSequenceById>>,
  newStatus: string
) => {
  if (sequence.status === newStatus) {
    throw new AppError(400, `Sequence is already "${newStatus}"`);
  }

  switch (newStatus) {
    case SEQUENCE_STATUS.ACTIVE:
      return transitionToActive(sequenceId, sequence);
    case SEQUENCE_STATUS.DRAFT:
      return transitionToDraft(sequenceId, sequence);
    case SEQUENCE_STATUS.CANCELLED:
      return transitionToCancelled(sequenceId, sequence);
    case SEQUENCE_STATUS.PAUSED:
    case SEQUENCE_STATUS.COMPLETED:
      return transitionSimple(sequenceId, sequence, newStatus);
    default:
      throw new AppError(400, `Invalid status: "${newStatus}"`);
  }
};

const updateSequence = async (
  userId: string,
  sequenceId: string,
  payload: UpdateSequenceInput
) => {
  const sequence = await getSequenceById(userId, sequenceId);

  if (payload.status) {
    return changeSequenceStatus(sequenceId, sequence, payload.status);
  }
  return prisma.sequence.update({
    where: { id: sequenceId },
    data: payload,
    include: {
      lead: { select: { name: true, email: true, followUpStage: true } },
      promptTemplate: { select: { id: true, name: true, followUpStage: true } },
    },
  });
};

const deleteSequence = async (userId: string, sequenceId: string) => {
  const sequence = await getSequenceById(userId, sequenceId);

  if (sequence.status === SEQUENCE_STATUS.ACTIVE) {
    throw new AppError(
      400,
      "Cannot delete an active sequence. Pause or cancel it first."
    );
  }

  const leadId = sequence.leadId;

  await prisma.sequence.delete({
    where: { id: sequenceId },
  });

  await syncLeadStatusFromActiveSequences(leadId);

  return null;
};

const PLAN_EXTRACTION_PROMPT = (promptText: string, totalSteps: number) => `
Analyze the following follow-up template and return a JSON object with exactly 2 keys:
- "stepTypesPattern": the repeating cycle of step types from the template (e.g. ["EMAIL", "SMS"] or ["EMAIL", "SMS", "WHATSAPP"]). Each value must be one of: ${STEP_TYPE_LIST.join(", ")}. List ONLY one full cycle in order — do NOT repeat entries to match step count.
- "intervalDays": a positive integer for days between consecutive steps.

The sequence has ${totalSteps} total steps. The application will repeat stepTypesPattern cyclically until there are ${totalSteps} steps (e.g. pattern ["EMAIL","SMS"] with ${totalSteps} steps → EMAIL, SMS, EMAIL, SMS, …).

Template:
${promptText}

Return ONLY raw JSON. No explanation, no markdown, no code block.
`.trim();

/** Repeat pattern cyclically until length === totalSteps. */
const expandStepTypesToTotal = (
  pattern: string[],
  totalSteps: number
): string[] => {
  const result: string[] = [];
  for (let i = 0; i < totalSteps; i++) {
    result.push(pattern[i % pattern.length]);
  }
  return result;
};

const normalizeStepType = (
  value: unknown,
  validTypes: Set<string>
): string => {
  const normalized = String(value).toUpperCase().trim();
  if (!validTypes.has(normalized)) {
    throw new AppError(
      502,
      `AI returned invalid step type "${value}". Allowed: ${STEP_TYPE_LIST.join(", ")}`
    );
  }
  return normalized;
};

const extractPlanFromAI = async (
  provider: string,
  apiKey: string,
  model: string | null | undefined,
  promptText: string,
  totalSteps: number
): Promise<{ stepTypes: string[]; intervalDays: number }> => {
  const prompt = PLAN_EXTRACTION_PROMPT(promptText, totalSteps);

  const aiResponse = await generateContent(
    {
      provider: provider as AIProvider,
      apiKey,
      model: model || undefined,
    },
    prompt
  );

  const raw = aiResponse.content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new AppError(
      502,
      "AI returned an invalid plan. Please try again or adjust your prompt template."
    );
  }

  const record = parsed as Record<string, unknown>;

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof record.intervalDays !== "number"
  ) {
    throw new AppError(
      502,
      "AI plan response is missing required fields (stepTypesPattern, intervalDays)."
    );
  }

  const rawPattern = record.stepTypesPattern ?? record.stepTypes;
  if (!Array.isArray(rawPattern) || rawPattern.length === 0) {
    throw new AppError(
      502,
      "AI plan response must include a non-empty stepTypesPattern array."
    );
  }

  const validTypes = new Set<string>(STEP_TYPE_LIST);
  const cycle = rawPattern.map((t) => normalizeStepType(t, validTypes));

  const stepTypes =
    cycle.length === totalSteps
      ? cycle
      : expandStepTypesToTotal(cycle, totalSteps);


  const intervalDays = Math.round(record.intervalDays as number);
  if (intervalDays < 1) {
    throw new AppError(502, "AI returned an invalid intervalDays (must be >= 1).");
  }

  return { stepTypes, intervalDays };
};

const generateSteps = async (userId: string, sequenceId: string) => {
  // 1. Load sequence with all relations
  const sequence = await prisma.sequence.findFirst({
    where: { id: sequenceId, userId },
    include: {
      lead: true,
      promptTemplate: true,
      steps: { orderBy: { stepOrder: "asc" } },
    },
  });


  if (!sequence) throw new AppError(404, "Sequence not found");
  if (sequence.status !== SEQUENCE_STATUS.DRAFT) {
    throw new AppError(400, "Steps can only be generated for draft sequences");
  }

  // Configurator may supply channels/cadence directly (no template needed).
  const configuredChannels = (sequence.channels ?? []).filter((c) =>
    (STEP_TYPE_LIST as string[]).includes(c)
  );
  const hasConfiguredChannels = configuredChannels.length > 0;

  if (!sequence.promptTemplate && !hasConfiguredChannels) {
    throw new AppError(
      400,
      "No prompt template or channels configured. Assign a prompt template or pick channels first."
    );
  }

  // 2. Load AI settings. AI is OPTIONAL when channels are configured: the step
  //    structure (types + schedule) is built from the configurator, and content
  //    is generated best-effort. Steps without content stay "pending" so the
  //    user can write them manually before activating.
  const aiSettings = await prisma.userSettings.findUnique({
    where: { userId },
    select: {
      aiProvider: true,
      aiModel: true,
      senderName: true,
      senderPosition: true,
      senderCompany: true,
      bookingLink: true,
      serviceDescription: true,
    },
  });
  const aiApiKey = await SettingsService.getDecryptedField(userId, "aiApiKey");
  const aiConfigured = !!(aiSettings?.aiProvider && aiApiKey);
  const senderProfile = {
    name: aiSettings?.senderName,
    position: aiSettings?.senderPosition,
    company: aiSettings?.senderCompany,
    bookingLink: aiSettings?.bookingLink,
    serviceDescription: aiSettings?.serviceDescription,
  };

  // Template-only flow (no channels) needs AI to derive the channel plan.
  if (!aiConfigured && !hasConfiguredChannels) {
    throw new AppError(
      400,
      "AI provider and API key not configured. Please set them in Settings."
    );
  }

  // 3. Determine step types + interval days.
  //    Prefer the configurator's explicit channels/cadence; otherwise extract a
  //    plan from the prompt template via AI.
  let stepTypes: string[];
  let intervalDays: number;
  if (hasConfiguredChannels) {
    stepTypes = expandStepTypesToTotal(configuredChannels, sequence.totalSteps);
    intervalDays =
      sequence.intervalDays && sequence.intervalDays >= 1
        ? sequence.intervalDays
        : 2;
  } else {
    const plan = await extractPlanFromAI(
      aiSettings!.aiProvider!,
      aiApiKey!,
      aiSettings!.aiModel,
      sequence.promptTemplate!.promptText,
      sequence.totalSteps
    );
    stepTypes = plan.stepTypes;
    intervalDays = plan.intervalDays;
  }


  // 4. Determine which steps are missing
  const existingOrders = new Set(sequence.steps.map((s) => s.stepOrder));
  const missingOrders = Array.from(
    { length: sequence.totalSteps },
    (_, i) => i + 1
  ).filter((order) => !existingOrders.has(order));


  // 5. Calculate startDate for new steps
  //    If existing steps present, base off last one; otherwise now + 6h
  let baseDate: Date;
  if (sequence.steps.length > 0) {
    const lastStep = sequence.steps[sequence.steps.length - 1];
    baseDate = new Date(lastStep.scheduledAt);
  } else {
    baseDate = new Date();
    baseDate.setHours(baseDate.getHours() + 6);
  }


  // 6. Create missing steps
  if (missingOrders.length > 0) {
    const newSteps = missingOrders.map((order) => {
      const scheduledAt = new Date(baseDate);
      // offset from base by how many positions away this order is from the last existing step
      const offset = sequence.steps.length > 0
        ? order - sequence.steps[sequence.steps.length - 1].stepOrder
        : order - 1;
      scheduledAt.setDate(scheduledAt.getDate() + offset * intervalDays);

      return {
        sequenceId,
        stepOrder: order,
        stepType: stepTypes[order - 1],
        scheduledAt,
      };
    });
    await prisma.sequenceStep.createMany({ data: newSteps });
  }

  // 7. Reload all steps after creation
  const allSteps = await prisma.sequenceStep.findMany({
    where: { sequenceId },
    orderBy: { stepOrder: "asc" },
  });

  // 8. Generate content for all pending steps sequentially
  const results: { stepOrder: number; status: string; error?: string }[] = [];

  for (const step of allSteps) {
    if (step.status !== SEQUENCE_STEP_STATUS.PENDING) {
      results.push({
        stepOrder: step.stepOrder,
        status: SEQUENCE_STEP_STATUS.SKIPPED,
      });
      continue;
    }

    if (!aiConfigured) {
      // Structure created, but no AI to write content. Leave the step pending so
      // the user can fill it in manually (Edit) before activating.
      results.push({
        stepOrder: step.stepOrder,
        status: SEQUENCE_STEP_STATUS.PENDING,
        error: "AI not configured — add an AI key in Settings or edit the step manually.",
      });
      continue;
    }

    try {
      const previousSteps = await prisma.sequenceStep.findMany({
        where: {
          sequenceId,
          stepOrder: { lt: step.stepOrder },
          status: { not: SEQUENCE_STEP_STATUS.PENDING },
        },
        orderBy: { stepOrder: "asc" },
        select: { stepOrder: true, stepType: true, subject: true, content: true },
      });

      const transcripts = await prisma.leadTranscript.findMany({
        where: { leadId: sequence.leadId, userId },
        orderBy: { meetingDate: "desc" },
        select: { transcript: true },
        take: 3,
      });

      const transcriptText =
        transcripts.length > 0
          ? transcripts.map((t) => t.transcript).join("\n\n---\n\n")
          : null;


      const prompt = buildPrompt({
        promptText: sequence.promptTemplate?.promptText ?? "",
        sequenceName: sequence.name,
        stepContext: {
          stepOrder: step.stepOrder,
          totalSteps: sequence.totalSteps,
          stepType: step.stepType,
        },
        previousSteps,
        lead: {
          name: sequence.lead.name,
          email: sequence.lead.email,
          phone: sequence.lead.phone,
          company: sequence.lead.company,
          location: sequence.lead.location,
          followUpStage: sequence.lead.followUpStage,
          notes: sequence.lead.notes,
        },
        transcript: transcriptText,
        strategy: {
          situation: sequence.situation,
          goal: sequence.goal,
          tone: sequence.tone,
          intensity: sequence.intensity,
        },
        sender: senderProfile,
      });

      const aiResponse = await generateContent(
        {
          provider: aiSettings!.aiProvider as AIProvider,
          apiKey: aiApiKey!,
          model: aiSettings!.aiModel || undefined,
        },
        prompt
      );


      const parsedContent = parseAIResponse(aiResponse.content, step.stepType);


      await prisma.sequenceStep.update({
        where: { id: step.id },
        data: {
          subject: parsedContent.subject,
          content: parsedContent.content,
          status: SEQUENCE_STEP_STATUS.DRAFT,
        },
      });

      results.push({ stepOrder: step.stepOrder, status: "generated" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({
        stepOrder: step.stepOrder,
        status: SEQUENCE_STEP_STATUS.FAILED,
        error: message,
      });
    }
  }

  // 9. Return updated sequence with steps
  const updatedSequence = await prisma.sequence.findFirst({
    where: { id: sequenceId },
    include: {
      lead: { select: { name: true, email: true, followUpStage: true } },
      promptTemplate: { select: { id: true, name: true, followUpStage: true } },
      steps: { orderBy: { stepOrder: "asc" } },
    },
  });

  return {
    sequence: updatedSequence,
    generationResults: results,
  };
};

export const SequenceService = {
  createSequence,
  getSequences,
  getSequenceById,
  updateSequence,
  deleteSequence,
  generateSteps,
};
