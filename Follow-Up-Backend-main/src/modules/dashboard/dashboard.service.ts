import prisma from "../../shared/prisma";
import { SEQUENCE_STEP_STATUS } from "../../shared/sequence-step";

interface DashboardQuery {
  days?: number;
  upcomingDays?: number;
}

const getDashboard = async (userId: string, query: DashboardQuery = {}) => {
  const days = query.days || 30;
  const upcomingDays = query.upcomingDays || 7;

  const sinceDate = new Date();
  sinceDate.setDate(sinceDate.getDate() - days);

  const untilDate = new Date();
  untilDate.setDate(untilDate.getDate() + upcomingDays);

  const [
    totalLeads,
    totalEmailsSent,
    totalSmsSent,
    totalWhatsAppSent,
    totalCallsMade,
    activeSequences,
    totalTranscripts,
    leadsByStage,
    sequencesByStatus,
    sentSteps,
    deliveryRaw,
    leadsCreated,
    upcomingSteps,
  ] = await Promise.all([
    // --- Summary cards ---
    prisma.lead.count({ where: { userId } }),

    prisma.sequenceStep.count({
      where: {
        sequence: { userId },
        stepType: "EMAIL",
        status: SEQUENCE_STEP_STATUS.SENT,
      },
    }),

    prisma.sequenceStep.count({
      where: {
        sequence: { userId },
        stepType: "SMS",
        status: SEQUENCE_STEP_STATUS.SENT,
      },
    }),

    prisma.sequenceStep.count({
      where: {
        sequence: { userId },
        stepType: "WHATSAPP",
        status: SEQUENCE_STEP_STATUS.SENT,
      },
    }),

    prisma.sequenceStep.count({
      where: {
        sequence: { userId },
        stepType: "CALL",
        status: SEQUENCE_STEP_STATUS.SENT,
      },
    }),

    prisma.sequence.count({
      where: { userId, status: "active" },
    }),

    prisma.leadTranscript.count({ where: { userId } }),

    // --- Leads by followUpStage ---
    prisma.lead.groupBy({
      by: ["followUpStage"],
      where: { userId },
      _count: { id: true },
    }),

    // --- Sequences by status ---
    prisma.sequence.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    }),

    // --- Sent trend (last N days) ---
    prisma.sequenceStep.findMany({
      where: {
        sequence: { userId },
        status: SEQUENCE_STEP_STATUS.SENT,
        sentAt: { gte: sinceDate },
      },
      select: { sentAt: true, stepType: true },
    }),

    // --- Delivery stats (sent vs failed by type) ---
    prisma.sequenceStep.groupBy({
      by: ["stepType", "status"],
      where: {
        sequence: { userId },
        status: {
          in: [SEQUENCE_STEP_STATUS.SENT, SEQUENCE_STEP_STATUS.FAILED],
        },
      },
      _count: { id: true },
    }),

    // --- Leads created over time (last N days) ---
    prisma.lead.findMany({
      where: {
        userId,
        createdAt: { gte: sinceDate },
      },
      select: { createdAt: true },
    }),

    // --- Upcoming scheduled steps ---
    prisma.sequenceStep.findMany({
      where: {
        sequence: { userId },
        status: SEQUENCE_STEP_STATUS.SCHEDULED,
        scheduledAt: { gte: new Date(), lte: untilDate },
      },
      select: {
        id: true,
        stepOrder: true,
        stepType: true,
        subject: true,
        scheduledAt: true,
        sequence: {
          select: {
            name: true,
            lead: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { scheduledAt: "asc" },
      take: 20,
    }),
  ]);


  return {
    summary: {
      totalLeads,
      totalEmailsSent,
      totalSmsSent,
      totalWhatsAppSent,
      totalCallsMade,
      activeSequences,
      totalTranscripts,
    },

    leadsByStage: leadsByStage.map((row) => ({
      stage: row.followUpStage,
      count: row._count.id,
    })),

    sequencesByStatus: sequencesByStatus.map((row) => ({
      status: row.status,
      count: row._count.id,
    })),

    sentTrend: buildDailyTrend(sentSteps, days),

    deliveryStats: buildDeliveryStats(deliveryRaw),

    leadsOverTime: buildDailyCount(leadsCreated, days),

    upcomingSteps: upcomingSteps.map((step) => ({
      id: step.id,
      stepOrder: step.stepOrder,
      stepType: step.stepType,
      subject: step.subject,
      scheduledAt: step.scheduledAt,
      sequenceName: step.sequence.name,
      leadName: step.sequence.lead.name,
      leadEmail: step.sequence.lead.email,
    })),
  };
};

function buildDailyTrend(
  steps: { sentAt: Date | null; stepType: string }[],
  days: number
) {
  const map = new Map<string, { emails: number; sms: number; whatsapp: number; calls: number }>();

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { emails: 0, sms: 0, whatsapp: 0, calls: 0 });
  }

  for (const step of steps) {
    if (!step.sentAt) continue;
    const key = step.sentAt.toISOString().slice(0, 10);
    const bucket = map.get(key);
    if (!bucket) continue;

    if (step.stepType === "EMAIL") bucket.emails++;
    else if (step.stepType === "SMS") bucket.sms++;
    else if (step.stepType === "WHATSAPP") bucket.whatsapp++;
    else if (step.stepType === "CALL") bucket.calls++;
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}

function buildDeliveryStats(
  raw: { stepType: string; status: string; _count: { id: number } }[]
) {
  const map = new Map<string, { sent: number; failed: number }>();

  for (const row of raw) {
    if (!map.has(row.stepType)) {
      map.set(row.stepType, { sent: 0, failed: 0 });
    }
    const bucket = map.get(row.stepType)!;
    if (row.status === SEQUENCE_STEP_STATUS.SENT) bucket.sent = row._count.id;
    if (row.status === SEQUENCE_STEP_STATUS.FAILED)
      bucket.failed = row._count.id;
  }

  return Array.from(map.entries()).map(([type, stats]) => ({
    type,
    ...stats,
  }));
}

function buildDailyCount(
  items: { createdAt: Date }[],
  days: number
) {
  const map = new Map<string, number>();

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    map.set(d.toISOString().slice(0, 10), 0);
  }

  for (const item of items) {
    const key = item.createdAt.toISOString().slice(0, 10);
    if (map.has(key)) {
      map.set(key, map.get(key)! + 1);
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

export const DashboardService = { getDashboard };
