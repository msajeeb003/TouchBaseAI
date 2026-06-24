import {
  FileText,
  Layers3,
  MailCheck,
  MessageCircle,
  MessageSquareText,
  PhoneCall,
  Users2,
} from "lucide-react";
import DashboardSummaryCard from "@/components/dashboard/DashboardSummaryCard";
import type { DashboardSummary } from "@/types/dashboard";

const summaryCards = [
  {
    key: "totalLeads",
    title: "Total Leads",
    description: "All leads in your workspace",
    icon: Users2,
    iconClassName: "bg-blue-100 text-blue-700",
    valueClassName: "text-slate-900",
  },
  {
    key: "totalEmailsSent",
    title: "Emails Sent",
    description: "Delivered from sequences",
    icon: MailCheck,
    iconClassName: "bg-emerald-100 text-emerald-700",
    valueClassName: "text-slate-900",
  },
  {
    key: "totalSmsSent",
    title: "SMS Sent",
    description: "Sent to your leads",
    icon: MessageSquareText,
    iconClassName: "bg-violet-100 text-violet-700",
    valueClassName: "text-slate-900",
  },
  {
    key: "totalWhatsAppSent",
    title: "WhatsApp Sent",
    description: "Sent to WhatsApp leads",
    icon: MessageCircle,
    iconClassName: "bg-emerald-100 text-emerald-700",
    valueClassName: "text-slate-900",
  },
  {
    key: "totalCallsMade",
    title: "Calls Made",
    description: "AI voice calls completed",
    icon: PhoneCall,
    iconClassName: "bg-amber-100 text-amber-800",
    valueClassName: "text-slate-900",
  },
  {
    key: "activeSequences",
    title: "Active Sequences",
    description: "Currently running follow-ups",
    icon: Layers3,
    iconClassName: "bg-orange-100 text-orange-800",
    valueClassName: "text-slate-900",
  },
  {
    key: "totalTranscripts",
    title: "Total Transcripts",
    description: "Imported from meetings",
    icon: FileText,
    iconClassName: "bg-indigo-100 text-indigo-700",
    valueClassName: "text-slate-900",
  },
] as const;

interface DashboardSummarySectionProps {
  summary: DashboardSummary;
}

export default function DashboardSummarySection({
  summary,
}: DashboardSummarySectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:grid-cols-4 xl:grid-cols-7">
      {summaryCards.map((item, index) => (
        <DashboardSummaryCard
          key={item.key}
          title={item.title}
          value={summary[item.key]}
          description={item.description}
          icon={item.icon}
          iconClassName={item.iconClassName}
          valueClassName={item.valueClassName}
          index={index}
        />
      ))}
    </div>
  );
}
