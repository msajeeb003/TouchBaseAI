import { useState } from "react";
import {
  Workflow,
  Loader2,
  AlertTriangle,
  Pause,
  Play,
  Send,
  Trash2,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useGetSequencesQuery,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceItem, SequenceStatus } from "@/types/sequences";
import { showError, showSuccess } from "@/utils/toast";

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-50 text-green-700 border-green-200",
  paused: "bg-amber-50 text-amber-700 border-amber-200",
  draft: "bg-slate-50 text-slate-600 border-slate-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-600 border-red-200",
};

const CHANNELS: { steps: keyof NonNullable<SequenceItem["_count"]>; icon: LucideIcon; color: string }[] = [
  { steps: "emailSteps", icon: Mail, color: "text-blue-500" },
  { steps: "smsSteps", icon: MessageSquare, color: "text-violet-500" },
  { steps: "whatsappSteps", icon: MessageCircle, color: "text-green-500" },
  { steps: "callSteps", icon: Phone, color: "text-amber-500" },
];

function apiError(err: unknown, fallback: string): string {
  return (err as { data?: { message?: string } })?.data?.message || fallback;
}

export default function DashboardSequencesSection() {
  const { data, isLoading, isError } = useGetSequencesQuery();
  const sequences = data?.data ?? [];
  const [updateSequence] = useUpdateSequenceMutation();
  const [deleteSequence] = useDeleteSequenceMutation();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const activeCount = sequences.filter((s) => s.status === "active").length;

  const setStatus = async (seq: SequenceItem, status: SequenceStatus) => {
    setBusyId(seq.id);
    try {
      await updateSequence({ id: seq.id, body: { status } }).unwrap();
      showSuccess(status === "active" ? "Sequence activated." : `Sequence ${status}.`);
    } catch (err) {
      showError(apiError(err, "Failed to update sequence."));
    } finally {
      setBusyId(null);
    }
  };

  const doDelete = async (seq: SequenceItem) => {
    setConfirmId(null);
    setBusyId(seq.id);
    try {
      // An active sequence can't be deleted directly — cancel it first.
      if (seq.status === "active") {
        await updateSequence({ id: seq.id, body: { status: "cancelled" } }).unwrap();
      }
      await deleteSequence(seq.id).unwrap();
      showSuccess("Sequence deleted.");
    } catch (err) {
      showError(apiError(err, "Failed to delete sequence."));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
          <Workflow className="h-5 w-5 text-indigo-600" />
          Sequences
        </h3>
        {activeCount > 0 && (
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            {activeCount} active
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 px-5 py-8 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Loading sequences...
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 px-5 py-8 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5" />
          Could not load sequences. Please try again.
        </div>
      ) : sequences.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-slate-900">No sequences yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            Create one from the <span className="font-medium">Sequences</span> page — once activated it'll appear here so you can pause or delete it.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Lead / Sequence</th>
                <th className="px-3 py-3 font-medium">Channels</th>
                <th className="px-3 py-3 font-medium">Progress</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {sequences.map((seq) => {
                const c = seq._count;
                const sent =
                  (c?.emailSent ?? 0) + (c?.smsSent ?? 0) + (c?.whatsappSent ?? 0) + (c?.callSent ?? 0);
                const busy = busyId === seq.id;
                return (
                  <tr key={seq.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-900">{seq.lead?.name ?? "—"}</div>
                      <div className="text-xs text-slate-500">{seq.name}</div>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {CHANNELS.filter((ch) => (c?.[ch.steps] ?? 0) > 0).map((ch) => {
                          const Icon = ch.icon;
                          return (
                            <span key={ch.steps} className="inline-flex items-center gap-0.5 text-xs text-slate-500">
                              <Icon className={`h-3.5 w-3.5 ${ch.color}`} />
                              {c?.[ch.steps]}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">
                      {sent}/{seq.totalSteps} sent
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[seq.status] ?? STATUS_STYLE.draft}`}>
                        {seq.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {confirmId === seq.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-slate-500">Delete?</span>
                          <button
                            onClick={() => doDelete(seq)}
                            className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-md px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          {seq.status === "active" && (
                            <button
                              onClick={() => setStatus(seq, "paused")}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-white px-2.5 py-1.5 text-xs font-medium text-amber-700 transition hover:bg-amber-50 disabled:opacity-50"
                            >
                              <Pause className="h-3.5 w-3.5" /> Pause
                            </button>
                          )}
                          {seq.status === "paused" && (
                            <button
                              onClick={() => setStatus(seq, "active")}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
                            >
                              <Play className="h-3.5 w-3.5" /> Resume
                            </button>
                          )}
                          {seq.status === "draft" && (
                            <button
                              onClick={() => setStatus(seq, "active")}
                              disabled={busy}
                              className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-white px-2.5 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" /> Activate
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmId(seq.id)}
                            disabled={busy}
                            className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
