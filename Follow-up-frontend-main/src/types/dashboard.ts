import type { StepType } from "@/constants/stepType";

export interface DashboardSummary {
  totalLeads: number;
  totalEmailsSent: number;
  totalSmsSent: number;
  totalWhatsAppSent: number;
  /** AI / Retell voice calls completed via sequences */
  totalCallsMade: number;
  activeSequences: number;
  totalTranscripts: number;
}

export interface DashboardLeadsByStageItem {
  stage: string;
  count: number;
}

export interface DashboardSequencesByStatusItem {
  status: string;
  count: number;
}

export interface DashboardSentTrendItem {
  date: string;
  emails: number;
  sms: number;
  whatsapp: number;
  calls: number;
}

export interface DashboardDeliveryStatsItem {
  /** Channel — same values as sequence step types (EMAIL, SMS, WHATSAPP, CALL). */
  type: StepType;
  sent: number;
  failed: number;
}

export interface DashboardLeadsOverTimeItem {
  date: string;
  count: number;
}

export interface DashboardUpcomingStepItem {
  id: string;
  stepOrder: number;
  stepType: string;
  subject: string | null;
  scheduledAt: string;
  sequenceName: string;
  leadName: string;
  leadEmail: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  leadsByStage: DashboardLeadsByStageItem[];
  sequencesByStatus: DashboardSequencesByStatusItem[];
  sentTrend: DashboardSentTrendItem[];
  deliveryStats: DashboardDeliveryStatsItem[];
  leadsOverTime: DashboardLeadsOverTimeItem[];
  upcomingSteps: DashboardUpcomingStepItem[];
}

export interface GetDashboardResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardData;
}
