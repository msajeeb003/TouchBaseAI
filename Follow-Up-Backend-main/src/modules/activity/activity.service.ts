import prisma from "../../shared/prisma";

/** Recent AI calls (Retell call logs) for the user, with lead/sequence context. */
const getCalls = async (userId: string) => {
  const calls = await prisma.callLog.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      step: {
        select: {
          stepOrder: true,
          sequence: {
            select: {
              name: true,
              lead: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });

  return calls.map((c) => ({
    id: c.id,
    retellCallId: c.retellCallId,
    callStatus: c.callStatus,
    duration: c.duration,
    recordingUrl: c.recordingUrl,
    transcript: c.transcript,
    disconnectionReason: c.disconnectionReason,
    fromNumber: c.fromNumber,
    toNumber: c.toNumber,
    createdAt: c.createdAt,
    sequenceName: c.step?.sequence?.name ?? null,
    leadName: c.step?.sequence?.lead?.name ?? null,
    leadEmail: c.step?.sequence?.lead?.email ?? null,
  }));
};

/** Recent outbound messages (email/SMS/WhatsApp sequence steps) for the user. */
const getMessages = async (userId: string) => {
  const steps = await prisma.sequenceStep.findMany({
    where: {
      sequence: { userId },
      stepType: { in: ["EMAIL", "SMS", "WHATSAPP"] },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      stepType: true,
      subject: true,
      content: true,
      status: true,
      scheduledAt: true,
      sentAt: true,
      externalMessageId: true,
      sequence: {
        select: {
          name: true,
          lead: { select: { name: true, email: true, phone: true } },
        },
      },
    },
  });

  return steps.map((s) => ({
    id: s.id,
    stepType: s.stepType,
    subject: s.subject,
    content: s.content,
    status: s.status,
    scheduledAt: s.scheduledAt,
    sentAt: s.sentAt,
    externalMessageId: s.externalMessageId,
    sequenceName: s.sequence.name,
    leadName: s.sequence.lead.name,
    leadEmail: s.sequence.lead.email,
    leadPhone: s.sequence.lead.phone,
  }));
};

export const ActivityService = { getCalls, getMessages };
