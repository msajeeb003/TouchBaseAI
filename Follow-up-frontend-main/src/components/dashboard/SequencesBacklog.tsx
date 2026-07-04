import { useMemo, useState } from "react";
import {
  RefreshCw,
  Loader2,
  AlertTriangle,
  Wand2,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  useGetSequencesQuery,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
  useRegenerateAllStepContentMutation,
  useGenerateSequenceStepsMutation,
} from "@/store/features/sequences/sequencesApi";
import type { SequenceItem, SequenceStatus } from "@/types/sequences";
import { showError, showSuccess } from "@/utils/toast";
import SequenceStepsModal from "./SequenceStepsModal";

type CountKey = keyof NonNullable<SequenceItem["_count"]>;
const CHANNELS: { steps: CountKey; sent: CountKey; icon: LucideIcon; color: string; chip: string }[] = [
  { steps: "emailSteps", sent: "emailSent", icon: Mail, color: "text-blue-500", chip: "bg-blue-50 text-blue-600" },
  { steps: "smsSteps", sent: "smsSent", icon: MessageSquare, color: "text-violet-500", chip: "bg-violet-50 text-violet-600" },
  { steps: "whatsappSteps", sent: "whatsappSent", icon: MessageCircle, color: "text-green-500", chip: "bg-green-50 text-green-600" },
  { steps: "callSteps", sent: "callSent", icon: Phone, color: "text-amber-500", chip: "bg-amber-50 text-amber-600" },
];

// Status pill/select colours, matching the mock.
const STATUS_SELECT: Record<string, string> = {
  active: "border-green-200 bg-green-50 text-green-700",
  paused: "border-blue-200 bg-blue-50 text-blue-700",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  completed: "border-slate-200 bg-slate-100 text-slate-400",
  cancelled: "border-red-200 bg-red-50 text-red-600",
};

const STATUS_OPTIONS: SequenceStatus[] = ["draft", "active", "paused", "cancelled"];
const FINISHED = ["completed", "cancelled"];

// Tabs keep the table short and put completed sequences in their own section.
type TabKey = "active" | "drafts" | "completed" | "all";
const TABS: { key: TabKey; label: string; match: (status: string) => boolean }[] = [
  { key: "active", label: "Active", match: (s) => s === "active" || s === "paused" },
  { key: "drafts", label: "Drafts", match: (s) => s === "draft" },
  { key: "completed", label: "Completed", match: (s) => s === "completed" || s === "cancelled" },
  { key: "all", label: "All", match: () => true },
];

function apiError(err: unknown, fallback: string): string {
  return (err as { data?: { message?: string } })?.data?.message || fallback;
}

export default function SequencesBacklog() {
  const { data, isLoading, isError, isFetching, refetch } = useGetSequencesQuery();
  const sequences = useMemo(() => data?.data ?? [], [data]);

  const [updateSequence] = useUpdateSequenceMutation();
  const [deleteSequence] = useDeleteSequenceMutation();
  const [regenerateAll] = useRegenerateAllStepContentMutation();
  const [generateSteps] = useGenerateSequenceStepsMutation();

  const [busyId, setBusyId] = useState<string | null>(null);
  const [genId, setGenId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [viewSeq, setViewSeq] = useState<SequenceItem | null>(null);
  const [renameSeq, setRenameSeq] = useState<SequenceItem | null>(null);

  const [templateFilter, setTemplateFilter] = useState("all");
  const [tab, setTab] = useState<TabKey>("active");

  const templateNames = useMemo(() => {
    const set = new Set<string>();
    sequences.forEach((s) => set.add(s.promptTemplate?.name ?? "N/A"));
    return Array.from(set).sort();
  }, [sequences]);

  // Apply the template filter first, then split by tab (completed lives in its own tab).
  const byTemplate = sequences.filter(
    (s) => templateFilter === "all" || (s.promptTemplate?.name ?? "N/A") === templateFilter
  );
  const counts: Record<TabKey, number> = { active: 0, drafts: 0, completed: 0, all: byTemplate.length };
  byTemplate.forEach((s) => {
    if (s.status === "active" || s.status === "paused") counts.active += 1;
    else if (s.status === "draft") counts.drafts += 1;
    else if (s.status === "completed" || s.status === "cancelled") counts.completed += 1;
  });
  const rows = byTemplate.filter((s) => TABS.find((t) => t.key === tab)!.match(s.status));

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

  const generateContent = async (seq: SequenceItem) => {
    setGenId(seq.id);
    try {
      const hasSteps = (seq._count?.steps ?? 0) > 0;
      if (hasSteps) {
        await regenerateAll(seq.id).unwrap();
      } else {
        await generateSteps(seq.id).unwrap();
      }
      showSuccess("Steps & content generated.");
    } catch (err) {
      showError(apiError(err, "Failed to generate content. Check your AI settings."));
    } finally {
      setGenId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h3 className="inline-flex items-center gap-2 text-lg font-bold text-slate-900">
          <button
            onClick={() => refetch()}
            title="Refresh"
            className="text-indigo-600 transition hover:text-indigo-700"
          >
            <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
          </button>
          Sequences
        </h3>
      </div>

      {/* Tabs + template filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
        <div className="flex flex-wrap gap-1 rounded-lg bg-slate-100 p-1">
          {TABS.map((t) => {
            const activeTab = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {t.label}
                <span className={`rounded-full px-1.5 text-[10px] font-bold ${activeTab ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                  {counts[t.key]}
                </span>
              </button>
            );
          })}
        </div>
        <LabeledSelect
          label="Filter"
          value={templateFilter}
          onChange={setTemplateFilter}
          options={[{ value: "all", label: "All" }, ...templateNames.map((t) => ({ value: t, label: t }))]}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 px-5 py-10 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> Loading sequences…
        </div>
      ) : isError ? (
        <div className="flex items-center gap-3 px-5 py-10 text-sm text-red-600">
          <AlertTriangle className="h-5 w-5" /> Could not load sequences. Please try again.
        </div>
      ) : rows.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            {sequences.length === 0 ? "No sequences yet" : "Nothing in this tab"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
            {sequences.length === 0
              ? "Generate one above and it'll appear here so you can manage it."
              : "Switch tabs to see your other sequences."}
          </p>
        </div>
      ) : (
        <div className="max-h-[480px] overflow-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="sticky top-0 z-10 border-b border-slate-100 bg-white text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-3 py-3 font-medium">Lead</th>
                <th className="px-3 py-3 font-medium">Template</th>
                <th className="px-3 py-3 font-medium">Steps</th>
                <th className="px-3 py-3 font-medium">Progress</th>
                <th className="px-3 py-3 font-medium">Step Details</th>
                <th className="px-3 py-3 text-center font-medium">Generate Steps &amp; Content</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 text-center font-medium">Active</th>
                <th className="px-3 py-3 text-center font-medium">Edit</th>
                <th className="px-5 py-3 text-center font-medium">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.map((seq) => {
                const c = seq._count;
                const created = c?.steps ?? 0;
                const sent = (c?.emailSent ?? 0) + (c?.smsSent ?? 0) + (c?.whatsappSent ?? 0) + (c?.callSent ?? 0);
                const pct = seq.totalSteps ? Math.round((sent / seq.totalSteps) * 100) : 0;
                const busy = busyId === seq.id;
                const finished = FINISHED.includes(seq.status);
                const isActive = seq.status === "active";
                return (
                  <tr key={seq.id} className="align-top transition hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-medium text-slate-900">{seq.name}</td>
                    <td className="px-3 py-3 text-slate-600">{seq.lead?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-slate-600">{seq.promptTemplate?.name ?? "N/A"}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{created}/{seq.totalSteps}</td>

                    {/* Progress */}
                    <td className="px-3 py-3">
                      <div className="w-52">
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                          <span className="tabular-nums">{sent}/{seq.totalSteps} sent</span>
                          <span className="tabular-nums font-medium text-slate-600">{pct}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="mt-1.5 flex flex-wrap gap-1.5">
                          {CHANNELS.filter((ch) => (c?.[ch.steps] ?? 0) > 0).map((ch) => {
                            const Icon = ch.icon;
                            return (
                              <span key={ch.steps} className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[11px] font-medium tabular-nums ${ch.chip}`}>
                                <Icon className="h-3 w-3" />
                                {c?.[ch.sent] ?? 0}/{c?.[ch.steps] ?? 0}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </td>

                    {/* Step details */}
                    <td className="px-3 py-3">
                      <button onClick={() => setViewSeq(seq)} className="inline-flex items-center gap-0.5 text-sm font-medium text-indigo-600 transition hover:text-indigo-700">
                        View <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </td>

                    {/* Generate steps & content */}
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => generateContent(seq)}
                        disabled={genId === seq.id || finished}
                        title="Generate steps & content"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-sm transition hover:brightness-110 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {genId === seq.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                      </button>
                    </td>

                    {/* Status */}
                    <td className="px-3 py-3">
                      <select
                        value={seq.status}
                        disabled={busy || finished}
                        onChange={(e) => setStatus(seq, e.target.value as SequenceStatus)}
                        className={`cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-semibold capitalize outline-none transition disabled:cursor-not-allowed ${STATUS_SELECT[seq.status] ?? STATUS_SELECT.draft}`}
                      >
                        {finished && <option value={seq.status}>{seq.status}</option>}
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>

                    {/* Active toggle */}
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-center gap-2 text-[11px] font-medium text-slate-400">
                        <span>Paused</span>
                        <button
                          role="switch"
                          aria-checked={isActive}
                          disabled={busy || finished}
                          onClick={() => setStatus(seq, isActive ? "paused" : "active")}
                          className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-50 ${isActive ? "bg-green-500" : "bg-slate-300"}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                        </button>
                        <span>Start</span>
                      </div>
                    </td>

                    {/* Edit */}
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => setRenameSeq(seq)} title="Rename sequence" className="rounded-md p-1.5 text-indigo-500 transition hover:bg-indigo-50">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-3 text-center">
                      {confirmId === seq.id ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => doDelete(seq)} className="rounded-md bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700">Yes</button>
                          <button onClick={() => setConfirmId(null)} className="rounded-md px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setConfirmId(seq.id)} disabled={busy} title="Delete sequence" className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 disabled:opacity-50">
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {viewSeq && <SequenceStepsModal seq={viewSeq} onClose={() => setViewSeq(null)} />}
      {renameSeq && (
        <RenameModal
          seq={renameSeq}
          onClose={() => setRenameSeq(null)}
          onSave={async (name) => {
            try {
              await updateSequence({ id: renameSeq.id, body: { name } }).unwrap();
              showSuccess("Sequence renamed.");
              setRenameSeq(null);
            } catch (err) {
              showError(apiError(err, "Failed to rename sequence."));
            }
          }}
        />
      )}
    </div>
  );
}

function LabeledSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cursor-pointer appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-medium text-slate-600 outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{label}: {o.label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  );
}

function RenameModal({ seq, onClose, onSave }: { seq: SequenceItem; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(seq.name);
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    if (!name.trim()) return showError("Name can't be empty.");
    setSaving(true);
    await onSave(name.trim());
    setSaving(false);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-slate-900">Rename sequence</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100">Cancel</button>
          <button onClick={submit} disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70">
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
