import { Loader2, Phone, PhoneCall, PlayCircle, AlertTriangle } from "lucide-react";
import { useGetCallsQuery } from "@/store/features/activity/activityApi";
import type { CallItem } from "@/types/activity";

function formatDuration(seconds: number | null): string {
  if (!seconds && seconds !== 0) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function statusBadge(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("complete") || s.includes("ended") || s.includes("success"))
    return "bg-green-50 text-green-700 border-green-200";
  if (s.includes("fail") || s.includes("error") || s.includes("no-answer"))
    return "bg-red-50 text-red-700 border-red-200";
  if (s.includes("progress") || s.includes("ongoing") || s.includes("ring"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-slate-50 text-slate-600 border-slate-200";
}

export default function CallsPage() {
  const { data, isLoading, isError } = useGetCallsQuery();
  const calls: CallItem[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="inline-flex items-center gap-2 text-3xl font-semibold text-slate-900">
          <Phone className="h-7 w-7 text-indigo-600" />
          Calls
        </h2>
        <p className="mt-1 text-sm text-slate-500">AI voice calls placed across your sequences.</p>
      </div>

      {isLoading ? (
        <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            <span>Loading calls...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-red-200 bg-red-50 p-6 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5" />
          We could not load your calls right now. Please try again in a moment.
        </div>
      ) : calls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50">
            <PhoneCall className="h-5 w-5 text-indigo-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No calls yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Calls appear here once a sequence with an AI Call step runs. Configure Retell AI in Settings to enable calling.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Sequence</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Recording</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {calls.map((c) => (
                <tr key={c.id} className="transition hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{c.leadName ?? "—"}</div>
                    <div className="text-xs text-slate-500">{c.leadEmail ?? ""}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.sequenceName ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge(c.callStatus)}`}>
                      {c.callStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-slate-600">{formatDuration(c.duration)}</td>
                  <td className="px-4 py-3 text-slate-600">{c.toNumber ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {c.recordingUrl ? (
                      <a
                        href={c.recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
                      >
                        <PlayCircle className="h-4 w-4" /> Play
                      </a>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
