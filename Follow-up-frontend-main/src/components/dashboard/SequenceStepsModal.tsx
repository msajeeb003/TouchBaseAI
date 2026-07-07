import { useEffect, useState } from "react";
import { Loader2, AlertTriangle, X, Mail, MessageSquare, MessageCircle, Phone, RotateCcw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useGetSequenceStepsQuery,
  useUpdateSequenceStepMutation,
  useRetrySequenceStepMutation,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceItem, SequenceStepItem } from "@/types/sequences";
import { showError, showSuccess } from "@/utils/toast";

const STEP_META: Record<string, { label: string; icon: LucideIcon; chip: string; text: string }> = {
  EMAIL: { label: "Email", icon: Mail, chip: "bg-blue-50 text-blue-600", text: "text-blue-600" },
  SMS: { label: "SMS", icon: MessageSquare, chip: "bg-violet-100 text-violet-600", text: "text-violet-600" },
  WHATSAPP: { label: "WhatsApp", icon: MessageCircle, chip: "bg-green-50 text-green-600", text: "text-green-600" },
  CALL: { label: "AI Call", icon: Phone, chip: "bg-amber-50 text-amber-500", text: "text-amber-600" },
};

// Steps already sent (or in flight) are shown read-only — editing wouldn't un-send them.
const SENT_LIKE = ["sent", "sending", "delivered", "read", "calling", "completed"];

const stepTiming = (s: SequenceStepItem): string => {
  if (s.sentAt) return "Sent";
  const days = Math.round((new Date(s.scheduledAt).getTime() - Date.now()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "Sends soon";
  return `In ${days} day${days === 1 ? "" : "s"}`;
};

function apiError(err: unknown, fallback: string): string {
  return (err as { data?: { message?: string } })?.data?.message || fallback;
}

/** Preview + edit the message content of every step in a sequence. */
export default function SequenceStepsModal({ seq, onClose }: { seq: SequenceItem; onClose: () => void }) {
  const { data, isLoading, isError } = useGetSequenceStepsQuery(seq.id);
  const steps = data?.data ?? [];
  const [updateStep] = useUpdateSequenceStepMutation();
  const [retryStep] = useRetrySequenceStepMutation();
  const [drafts, setDrafts] = useState<Record<string, { subject: string; content: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const retry = async (s: SequenceStepItem) => {
    setRetryingId(s.id);
    try {
      await retryStep({ sequenceId: seq.id, stepId: s.id }).unwrap();
      showSuccess("Step re-queued — it will send again shortly (while the sequence is active).");
    } catch (err) {
      showError(apiError(err, "Failed to retry step."));
    } finally {
      setRetryingId(null);
    }
  };

  // Seed a draft for each step once loaded, without clobbering in-progress edits.
  useEffect(() => {
    const list = data?.data ?? [];
    if (list.length === 0) return;
    setDrafts((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const s of list) {
        if (!(s.id in next)) {
          next[s.id] = { subject: s.subject ?? "", content: s.content ?? "" };
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [data]);

  const save = async (s: SequenceStepItem) => {
    const d = drafts[s.id];
    if (!d) return;
    // The API rejects null/empty fields, so only send what's set.
    const body: { subject?: string; content?: string } = {};
    if (s.stepType === "EMAIL" && d.subject.trim()) body.subject = d.subject.trim();
    if (d.content.trim()) body.content = d.content.trim();
    if (!body.content && !body.subject) {
      showError("Add some content before saving.");
      return;
    }
    setSavingId(s.id);
    try {
      await updateStep({ sequenceId: seq.id, stepId: s.id, body }).unwrap();
      showSuccess("Step content saved.");
    } catch (err) {
      showError(apiError(err, "Failed to save step."));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-slate-900">
              {seq.lead?.name ?? "Lead"} — content to send
            </h3>
            <p className="truncate text-xs text-slate-500">{seq.name}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading steps…
            </div>
          ) : isError ? (
            <div className="flex items-center gap-2 py-6 text-sm text-red-600">
              <AlertTriangle className="h-4 w-4" /> Could not load steps.
            </div>
          ) : steps.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">
              This sequence has no steps yet.
            </p>
          ) : (
            steps.map((s) => {
              const meta = STEP_META[s.stepType] ?? STEP_META.SMS;
              const Icon = meta.icon;
              const draft = drafts[s.id] ?? { subject: s.subject ?? "", content: s.content ?? "" };
              const readOnly = SENT_LIKE.includes(s.status?.toLowerCase());
              return (
                <div key={s.id} className="rounded-xl border border-slate-200 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${meta.chip}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className={`text-sm font-semibold ${meta.text}`}>{meta.label}</span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                        {stepTiming(s)}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${s.status === "failed" ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500"}`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {s.status === "failed" && (
                        <button
                          onClick={() => retry(s)}
                          disabled={retryingId === s.id}
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:opacity-60"
                        >
                          {retryingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          Retry
                        </button>
                      )}
                      {!readOnly && (
                        <button
                          onClick={() => save(s)}
                          disabled={savingId === s.id}
                          className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
                        >
                          {savingId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                          Save
                        </button>
                      )}
                    </div>
                  </div>

                  {s.stepType === "EMAIL" && (
                    <input
                      value={draft.subject}
                      readOnly={readOnly}
                      onChange={(e) =>
                        setDrafts((p) => ({ ...p, [s.id]: { ...draft, subject: e.target.value } }))
                      }
                      placeholder="Subject"
                      className="mb-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition read-only:bg-slate-50 read-only:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />
                  )}
                  <textarea
                    value={draft.content}
                    readOnly={readOnly}
                    onChange={(e) =>
                      setDrafts((p) => ({ ...p, [s.id]: { ...draft, content: e.target.value } }))
                    }
                    rows={s.stepType === "SMS" ? 3 : 6}
                    placeholder={s.content ? "" : "Not generated yet — type the message or generate the sequence."}
                    className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none transition read-only:bg-slate-50 read-only:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {readOnly && (
                    <p className="mt-1 text-[11px] text-slate-400">Already sent — shown for reference.</p>
                  )}
                  {s.status === "failed" && s.sendLog && (
                    <p className="mt-1.5 rounded-md bg-red-50 px-2 py-1 text-[11px] leading-relaxed text-red-600">
                      Last error: {s.sendLog.replace(/^Failed:\s*/, "")}
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 px-5 py-3">
          <button onClick={onClose} className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
