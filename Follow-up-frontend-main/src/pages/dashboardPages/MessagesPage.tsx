import { Loader2, MessageSquare, Mail, MessageCircle, AlertTriangle, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useGetMessagesQuery } from "@/store/features/activity/activityApi";
import type { MessageItem } from "@/types/activity";

const CHANNEL: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  EMAIL: { label: "Email", icon: Mail, color: "text-blue-600" },
  SMS: { label: "SMS", icon: MessageSquare, color: "text-violet-600" },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, color: "text-green-600" },
};

function statusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s === "sent") return "bg-green-50 text-green-700 border-green-200";
  if (s === "failed") return "bg-red-50 text-red-700 border-red-200";
  if (s === "scheduled") return "bg-indigo-50 text-indigo-700 border-indigo-200";
  if (s === "sending") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function MessagesPage() {
  const { data, isLoading, isError } = useGetMessagesQuery();
  const messages: MessageItem[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-3xl font-semibold text-slate-900">
          <MessageSquare className="h-7 w-7 text-indigo-600" />
          Messages
        </h2>
        <p className="mt-1 text-sm text-slate-500">Email, SMS, and WhatsApp messages across your sequences.</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading messages...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5" />
          We could not load your messages right now. Please try again in a moment.
        </div>
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <Inbox className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No messages yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Messages appear here once a sequence generates and sends email, SMS, or WhatsApp steps.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const ch = CHANNEL[m.stepType] ?? { label: m.stepType, icon: MessageSquare, color: "text-slate-500" };
            const Icon = ch.icon;
            return (
              <div key={m.id} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:shadow-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${ch.color}`}>
                    <Icon className="h-4 w-4" />
                    {ch.label}
                  </span>
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(m.status)}`}>
                    {m.status}
                  </span>
                  <span className="text-sm text-slate-500">· {m.leadName}</span>
                  <span className="ml-auto text-xs text-slate-400">
                    {m.sentAt
                      ? `Sent ${new Date(m.sentAt).toLocaleString()}`
                      : `Scheduled ${new Date(m.scheduledAt).toLocaleString()}`}
                  </span>
                </div>
                {m.subject && <p className="mt-2 text-sm font-medium text-slate-800">Subject: {m.subject}</p>}
                {m.content && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{m.content}</p>}
                <p className="mt-2 text-xs text-slate-400">Sequence: {m.sequenceName}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
