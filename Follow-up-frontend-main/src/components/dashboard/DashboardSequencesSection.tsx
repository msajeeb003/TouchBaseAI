import { useEffect, useState } from "react";
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
  ChevronDown,
  Eye,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useGetSequencesQuery,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
  useGetSequenceStepsQuery,
  useUpdateSequenceStepMutation,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceItem, SequenceStatus, SequenceStepItem } from "@/types/sequences";
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

// Live sequences are sorted active-first, then paused.
const LIVE_RANK: Record<string, number> = { active: 0, paused: 1 };

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
  const [showDrafts, setShowDrafts] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [viewSeq, setViewSeq] = useState<SequenceItem | null>(null);

  // Group sequences: live (active/paused) stays front-and-center, the rest tuck away.
  const live = sequences
    .filter((s) => s.status === "active" || s.status === "paused")
    .sort((a, b) => (LIVE_RANK[a.status] ?? 9) - (LIVE_RANK[b.status] ?? 9));
  const drafts = sequences.filter((s) => s.status === "draft");
  const done = sequences.filter((s) => s.status === "completed" || s.status === "cancelled");

  const activeCount = sequences.filter((s) => s.status === "active").length;
  const pausedCount = sequences.filter((s) => s.status === "paused").length;

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

  const renderRow = (seq: SequenceItem) => {
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
              <button
                onClick={() => setViewSeq(seq)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <Eye className="h-3.5 w-3.5" /> View
              </button>
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
  };

  const renderTable = (rows: SequenceItem[]) => (
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
        <tbody className="divide-y divide-slate-50">{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );

  const collapsibleBar = (
    label: string,
    count: number,
    open: boolean,
    onToggle: () => void,
    badgeClass: string,
  ) => (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
    >
      <span className="inline-flex items-center gap-2">
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-0" : "-rotate-90"}`} />
        {label}
        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>{count}</span>
      </span>
      <span className="text-xs text-slate-400">{open ? "Hide" : "Show"}</span>
    </button>
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <h3 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900">
          <Workflow className="h-5 w-5 text-indigo-600" />
          Sequences
        </h3>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
              {activeCount} active
            </span>
          )}
          {pausedCount > 0 && (
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {pausedCount} paused
            </span>
          )}
        </div>
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
        <>
          {/* Live: active + paused — the front-and-center list */}
          {live.length > 0 ? (
            renderTable(live)
          ) : (
            <div className="px-5 py-8 text-center text-sm text-slate-500">
              No active or paused sequences right now.
              {drafts.length > 0 && " You have drafts below ready to activate."}
            </div>
          )}

          {/* Drafts — tucked into a collapsible bar */}
          {drafts.length > 0 && (
            <>
              {collapsibleBar("Drafts", drafts.length, showDrafts, () => setShowDrafts((v) => !v), "bg-slate-100 text-slate-600")}
              {showDrafts && renderTable(drafts)}
            </>
          )}

          {/* Completed / cancelled — tucked into a collapsible bar */}
          {done.length > 0 && (
            <>
              {collapsibleBar("Completed", done.length, showDone, () => setShowDone((v) => !v), "bg-blue-50 text-blue-700")}
              {showDone && renderTable(done)}
            </>
          )}
        </>
      )}

      {viewSeq && (
        <SequenceStepsModal seq={viewSeq} onClose={() => setViewSeq(null)} />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Steps preview + edit modal                                                */
/* -------------------------------------------------------------------------- */

function SequenceStepsModal({ seq, onClose }: { seq: SequenceItem; onClose: () => void }) {
  const { data, isLoading, isError } = useGetSequenceStepsQuery(seq.id);
  const steps = data?.data ?? [];
  const [updateStep] = useUpdateSequenceStepMutation();
  const [drafts, setDrafts] = useState<Record<string, { subject: string; content: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

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
                      <span className="rounded-full border border-slate-200 px-2 py-0.5 text-[11px] font-medium capitalize text-slate-500">
                        {s.status}
                      </span>
                    </div>
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
