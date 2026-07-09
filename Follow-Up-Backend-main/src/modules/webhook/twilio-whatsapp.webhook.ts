import prisma from "../../shared/prisma";
import { SEQUENCE_STEP_STATUS } from "../../shared/sequence-step";
import { syncLeadStatusFromActiveSequences } from "../lead/lead.service";
import { twilioErrorHint } from "../../shared/services/twilio-errors";

const FINAL_SUCCESS = new Set(["sent", "delivered", "read"]);
const FINAL_FAILURE = new Set(["failed", "undelivered"]);

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

    // console.log(`[Twilio Webhook] Sequence ${sequenceId} completed`);
  }
};

export const processTwilioWhatsAppStatus = async (
  body: Record<string, string>
): Promise<void> => {
  const messageSid = body.MessageSid;
  const messageStatus = (body.MessageStatus || "").toLowerCase();
  const errorCode = Number.parseInt(body.ErrorCode || "0", 10) || 0;
  const errorMessage = body.ErrorMessage || "";

  if (!messageSid) {
    console.warn("[Twilio Webhook] Missing MessageSid");
    return;
  }

  const step = await prisma.sequenceStep.findUnique({
    where: { externalMessageId: messageSid },
    select: { id: true, status: true, sequenceId: true },
  });

  if (!step) {
    console.warn(`[Twilio Webhook] No step for MessageSid ${messageSid}`);
    return;
  }

  if (
    step.status === SEQUENCE_STEP_STATUS.SENT ||
    step.status === SEQUENCE_STEP_STATUS.FAILED
  ) {
    
    return;
  }

  if (FINAL_FAILURE.has(messageStatus) || errorCode > 0) {
    const log =
      errorCode > 0
        ? `Failed (${errorCode}): ${errorMessage || messageStatus}${twilioErrorHint(errorCode)}`
        : `Failed: ${messageStatus}${errorMessage ? ` — ${errorMessage}` : ""}`;

    await prisma.sequenceStep.update({
      where: { id: step.id },
      data: {
        status: SEQUENCE_STEP_STATUS.FAILED,
        sendLog: log,
      },
    });

    await checkSequenceCompletion(step.sequenceId);
    return;
  }

  if (FINAL_SUCCESS.has(messageStatus)) {
    const log =
      messageStatus === "read"
        ? "Read on WhatsApp"
        : messageStatus === "delivered"
          ? `Delivered on WhatsApp`
          : "Sent on WhatsApp";

    await prisma.sequenceStep.update({
      where: { id: step.id },
      data: {
        status: SEQUENCE_STEP_STATUS.SENT,
        sentAt: new Date(),
        sendLog: log,
      },
    });

    // console.log(`[Twilio Webhook] Step ${step.id}: ${log}`);
    await checkSequenceCompletion(step.sequenceId);
    return;
  }

  await prisma.sequenceStep.update({
    where: { id: step.id },
    data: {
      sendLog: `Twilio status: ${messageStatus || "unknown"}`,
    },
  });

  // console.log(
  //   `[Twilio Webhook] Step ${step.id}: intermediate status ${messageStatus}`
  // );
};
