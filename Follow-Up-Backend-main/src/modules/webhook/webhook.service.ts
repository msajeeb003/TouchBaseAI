import prisma from "../../shared/prisma";
import { SEQUENCE_STEP_STATUS } from "../../shared/sequence-step";
import { syncLeadStatusFromActiveSequences } from "../lead/lead.service";

interface RetellCallPayload {
  call_id: string;
  call_status: string;
  disconnection_reason?: string;
  start_timestamp?: number;
  end_timestamp?: number;
  transcript?: string;
  recording_url?: string;
  from_number?: string;
  to_number?: string;
  metadata?: {
    stepId?: string;
    sequenceId?: string;
    userId?: string;
  };
}

const SUCCESSFUL_DISCONNECTIONS = new Set([
  "agent_hangup",
  "user_hangup",
  "call_transfer",
]);

const processCallEnded = async (call: RetellCallPayload) => {
  const stepId = call.metadata?.stepId;
  const userId = call.metadata?.userId;

  if (!stepId || !userId) {
    console.error("[Webhook] Missing stepId or userId in metadata");
    return;
  }

  const duration =
    call.start_timestamp && call.end_timestamp
      ? Math.round((call.end_timestamp - call.start_timestamp) / 1000)
      : null;

  const isSuccessful = SUCCESSFUL_DISCONNECTIONS.has(
    call.disconnection_reason || ""
  );

  await prisma.callLog.upsert({
    where: { retellCallId: call.call_id },
    update: {
      callStatus: call.disconnection_reason || call.call_status,
      duration,
      recordingUrl: call.recording_url || null,
      transcript: call.transcript || null,
      disconnectionReason: call.disconnection_reason || null,
    },
    create: {
      stepId,
      userId,
      retellCallId: call.call_id,
      callStatus: call.disconnection_reason || call.call_status,
      duration,
      recordingUrl: call.recording_url || null,
      transcript: call.transcript || null,
      disconnectionReason: call.disconnection_reason || null,
      fromNumber: call.from_number || null,
      toNumber: call.to_number || null,
    },
  });

  const stepStatus = isSuccessful
    ? SEQUENCE_STEP_STATUS.SENT
    : SEQUENCE_STEP_STATUS.FAILED;

  const logMessage = isSuccessful
    ? `Call completed (${duration || 0}s) — ${call.disconnection_reason}`
    : `Call failed — ${call.disconnection_reason || "unknown reason"}`;

  await prisma.sequenceStep.update({
    where: { id: stepId },
    data: {
      status: stepStatus,
      sentAt: isSuccessful ? new Date() : undefined,
      sendLog: logMessage,
    },
  });

  // console.log(`[Webhook] Step ${stepId}: ${logMessage}`);

  const sequenceId = call.metadata?.sequenceId;
  if (sequenceId) {
    await checkSequenceCompletion(sequenceId);
  }
};

const checkSequenceCompletion = async (sequenceId: string) => {
  const remaining = await prisma.sequenceStep.count({
    where: {
      sequenceId,
      status: {
        in: [
          SEQUENCE_STEP_STATUS.SCHEDULED,
          SEQUENCE_STEP_STATUS.SENDING,
          SEQUENCE_STEP_STATUS.CALLING,
        ],
      },
    },
  });

  if (remaining === 0) {
    const seq = await prisma.sequence.findUnique({
      where: { id: sequenceId },
      select: { leadId: true },
    });

    await prisma.sequence.update({
      where: { id: sequenceId },
      data: { status: "completed" },
    });

    if (seq) {
      await syncLeadStatusFromActiveSequences(seq.leadId);
    }

    // console.log(`[Webhook] Sequence ${sequenceId} completed`);
  }
};

export const WebhookService = { processCallEnded };
