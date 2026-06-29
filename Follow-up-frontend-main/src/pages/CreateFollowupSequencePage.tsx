import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Workflow,
  BookOpen,
  Phone,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  PlayCircle,
  Sparkles,
  GripVertical,
  MoreVertical,
  Mail,
  MessageCircle,
  Linkedin,
  Instagram,
  Check,
  Pencil,
  Plus,
  RefreshCw,
  Settings2,
  Send,
  Pause,
  Calendar,
  CalendarX2,
  FileText,
  RotateCcw,
  ChevronDown,
  Clock,
  Copy,
  Trash2,
  CheckCircle2,
  X,
  type LucideIcon,
} from "lucide-react";
import type { StepType } from "@/constants/stepType";
import type { SequenceStepItem } from "@/types/sequences";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useGetLeadsQuery, useUpdateLeadMutation } from "@/store/features/leads/leadsApi";
import { useGetPromptTemplatesQuery } from "@/store/features/templates/templatesApi";
import {
  useCreateSequenceMutation,
  useGenerateSequenceStepsMutation,
  useRegenerateAllStepContentMutation,
  useCreateSequenceStepMutation,
  useDeleteSequenceStepMutation,
  useReorderSequenceStepsMutation,
  useGenerateSequenceStepContentMutation,
  useUpdateSequenceStepMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} from "@/store/features/sequences/sequencesApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, useCurrentUser } from "@/store/features/auth/authSlice";
import Logo from "@/components/logo/Logo";
import { showError, showSuccess } from "@/utils/toast";

/* -------------------------------------------------------------------------- */
/*  Static data                                                               */
/* -------------------------------------------------------------------------- */

type NavItem = { label: string; icon: LucideIcon; to?: string; active?: boolean; soon?: boolean };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Leads", icon: Users, to: "/dashboard/leads" },
  { label: "Sequences", icon: Workflow, to: "/create-sequence", active: true },
  { label: "Templates (Playbooks)", icon: BookOpen, to: "/dashboard/templates" },
  { label: "Calls", icon: Phone, to: "/dashboard/calls" },
  { label: "Messages", icon: MessageSquare, to: "/dashboard/messages" },
  { label: "Analytics", icon: BarChart3, to: "/dashboard/analytics" },
  { label: "Settings", icon: Settings, to: "/dashboard/settings" },
];

const STEPS = [
  { title: "Choose Goal", sub: "Tell us the situation" },
  { title: "Configure", sub: "Set your preferences" },
  { title: "Generate", sub: "AI builds your sequence" },
  { title: "Review", sub: "Check and edit steps" },
  { title: "Activate", sub: "Launch and automate" },
];

const SITUATIONS: { id: string; label: string; desc: string; icon: LucideIcon }[] = [
  { id: "no-show", label: "No-show", desc: "Lead missed a scheduled call or meeting", icon: CalendarX2 },
  { id: "post-call", label: "Post-call follow-up", desc: "Follow up after a call or meeting", icon: Phone },
  { id: "proposal", label: "Proposal sent", desc: "Follow up after sending a proposal", icon: FileText },
  { id: "no-reply", label: "No reply", desc: "Lead hasn't replied to your message", icon: MessageSquare },
  { id: "re-engage", label: "Re-engagement", desc: "Re-connect with an inactive lead", icon: RotateCcw },
  { id: "custom", label: "Custom", desc: "Describe your own situation", icon: Sparkles },
];

const GOALS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "book-call", label: "Book another call", icon: Calendar },
  { id: "get-reply", label: "Get a reply", icon: MessageSquare },
  { id: "close-proposal", label: "Close proposal", icon: FileText },
  { id: "qualify", label: "Qualify lead", icon: Plus },
  { id: "other", label: "Other goal", icon: Plus },
];

type ChannelKey = "email" | "sms" | "whatsapp" | "aiCall" | "linkedin" | "instagram";

const CHANNELS: { key: ChannelKey; label: string; icon: LucideIcon; color: string; manual?: boolean }[] = [
  { key: "email", label: "Email", icon: Mail, color: "text-blue-500" },
  { key: "sms", label: "SMS", icon: MessageSquare, color: "text-violet-500" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-green-500" },
  { key: "aiCall", label: "AI Call", icon: Phone, color: "text-amber-500" },
  { key: "linkedin", label: "LinkedIn DM", icon: Linkedin, color: "text-sky-700", manual: true },
  { key: "instagram", label: "Instagram DM", icon: Instagram, color: "text-pink-500", manual: true },
];

/** UI channel key -> backend StepType. Manual channels have no backend step type. */
const CHANNEL_TO_STEPTYPE: Record<ChannelKey, StepType | null> = {
  email: "EMAIL",
  sms: "SMS",
  whatsapp: "WHATSAPP",
  aiCall: "CALL",
  linkedin: null,
  instagram: null,
};
/** Order channels are cycled into the sequence (mirrors the sample: SMS first). */
const CHANNEL_ORDER: ChannelKey[] = ["sms", "email", "whatsapp", "aiCall"];

type ChannelMeta = { name: string; icon: LucideIcon; text: string; chip: string };
const CHANNEL_META: Record<string, ChannelMeta> = {
  SMS: { name: "SMS", icon: MessageSquare, text: "text-violet-600", chip: "bg-violet-100 text-violet-600" },
  Email: { name: "Email", icon: Mail, text: "text-blue-600", chip: "bg-blue-50 text-blue-600" },
  WhatsApp: { name: "WhatsApp", icon: MessageCircle, text: "text-green-600", chip: "bg-green-50 text-green-600" },
  "AI Call": { name: "AI Call", icon: Phone, text: "text-amber-600", chip: "bg-amber-50 text-amber-500" },
};
const STEPTYPE_TO_NAME: Record<string, keyof typeof CHANNEL_META> = {
  EMAIL: "Email",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  CALL: "AI Call",
};
const NAME_TO_STEPTYPE: Record<string, StepType> = {
  Email: "EMAIL",
  SMS: "SMS",
  WhatsApp: "WHATSAPP",
  "AI Call": "CALL",
};
/** Channels a user can add a step for, in the Add-Step menu. */
const ADDABLE_CHANNELS: (keyof typeof CHANNEL_META)[] = ["SMS", "Email", "WhatsApp", "AI Call"];

type DisplayStep = {
  key: string;
  stepId?: string; // backend id once persisted
  channel: keyof typeof CHANNEL_META;
  delay: string;
  subject?: string | null;
  preview: string;
  script?: boolean;
  scheduledAt?: string; // raw ISO, for scheduling appended steps
  status?: string;
};

/** Sample steps shown as a design preview before a real sequence is generated. */
const SAMPLE_STEPS: DisplayStep[] = [
  { key: "s1", channel: "SMS", delay: "Now", preview: "Hi Art, I tried reaching you earlier but couldn't connect. Are you still open to a quick chat this week?" },
  { key: "s2", channel: "Email", delay: "+1 day", subject: "Following up on our conversation", preview: "Hi Art, I hope you're doing well. I wanted to follow up on our conversation..." },
  { key: "s3", channel: "WhatsApp", delay: "+2 days", preview: "Hi Art! Just checking in 🙂 Let me know if a quick call this week works for you." },
  { key: "s4", channel: "AI Call", delay: "+3 days", preview: "AI will call and leave a personalized voicemail asking to reschedule a call.", script: true },
  { key: "s5", channel: "Email", delay: "+5 days", subject: "Should we reschedule?", preview: "Just circling back one more time. Happy to find a time that works for you!" },
];

const TIPS: { strong: string; rest?: string }[] = [
  { strong: "Best time to reach out:", rest: "Weekdays, 10am – 2pm" },
  { strong: "Keep messages short and clear" },
  { strong: "Offer an easy next step" },
  { strong: "Don't sound needy" },
];

/* -------------------------------------------------------------------------- */
/*  Mapping helpers                                                           */
/* -------------------------------------------------------------------------- */

function parseCadence(c: string): { totalSteps: number; intervalDays: number } {
  const m = c.match(/(\d+)\s*steps?\s*over\s*(\d+)\s*days?/i);
  const totalSteps = m ? parseInt(m[1], 10) : 5;
  const span = m ? parseInt(m[2], 10) : 7;
  const intervalDays = Math.max(1, Math.round(span / Math.max(1, totalSteps - 1)));
  return { totalSteps, intervalDays };
}

function delayLabel(scheduledAt: string): string {
  const days = Math.round((new Date(scheduledAt).getTime() - Date.now()) / 86_400_000);
  if (days <= 0) return "Now";
  return `+${days} day${days === 1 ? "" : "s"}`;
}

function mapStep(s: SequenceStepItem): DisplayStep {
  const channel = STEPTYPE_TO_NAME[s.stepType] ?? "SMS";
  return {
    key: s.id,
    stepId: s.id,
    channel,
    delay: delayLabel(s.scheduledAt),
    subject: s.subject,
    preview: s.content?.trim() || (s.status === "pending" ? "Not generated yet — click Edit to write it" : "(no content yet)"),
    script: s.stepType === "CALL",
    scheduledAt: s.scheduledAt,
    status: s.status,
  };
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "L";
}

function apiError(err: unknown, fallback: string): string {
  return (err as { data?: { message?: string } })?.data?.message || fallback;
}

/* -------------------------------------------------------------------------- */
/*  Tiny primitives                                                           */
/* -------------------------------------------------------------------------- */

function Avatar({ initials, className = "", square = false }: { initials: string; className?: string; square?: boolean }) {
  return (
    <div className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 font-semibold text-white ${square ? "rounded-lg" : "rounded-full"} ${className}`}>
      {initials}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-gray-200 bg-white ${className}`}>{children}</div>;
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */

export default function CreateFollowupSequencePage() {
  const [situation, setSituation] = useState("no-show");
  const [goal, setGoal] = useState("book-call");
  const [tone, setTone] = useState("🙂 Friendly & Professional");
  const [intensity, setIntensity] = useState("Standard");
  const [cadence, setCadence] = useState("5 steps over 7 days");
  const [channels, setChannels] = useState<Record<ChannelKey, boolean>>({
    email: true,
    sms: true,
    whatsapp: true,
    aiCall: true,
    linkedin: false,
    instagram: false,
  });

  const [steps, setSteps] = useState<DisplayStep[]>(SAMPLE_STEPS);
  const [sequenceId, setSequenceId] = useState<string | null>(null);
  const [seqStatus, setSeqStatus] = useState<"draft" | "active" | "paused">("draft");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string>("");

  // ---- Navigation + current user ----
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(useCurrentUser);
  const userEmail = currentUser?.email ?? "art@artech.digital";
  const userName = currentUser ? currentUser.email.split("@")[0] : "Artur A.";
  const userInitials = userName.replace(/[^a-zA-Z]/g, "").slice(0, 2).toUpperCase() || "AA";

  const handleNav = (item: NavItem) => {
    if (item.to) navigate(item.to);
    else toast(`${item.label} is coming soon`, { description: "This section isn't available yet." });
  };
  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // ---- Backend data + mutations ----
  const { data: leadsData } = useGetLeadsQuery({ limit: 100 });
  const leads = useMemo(() => leadsData?.data?.items ?? [], [leadsData]);
  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  const { data: templatesData } = useGetPromptTemplatesQuery();
  const templates = useMemo(() => templatesData?.data ?? [], [templatesData]);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);

  const [createSequence, { isLoading: isCreating }] = useCreateSequenceMutation();
  const [generateSteps, { isLoading: isGenerating }] = useGenerateSequenceStepsMutation();
  const [regenerateAll, { isLoading: isRegenerating }] = useRegenerateAllStepContentMutation();
  const [createStep] = useCreateSequenceStepMutation();
  const [deleteStepMutation] = useDeleteSequenceStepMutation();
  const [reorderSteps] = useReorderSequenceStepsMutation();
  const [generateStepContent] = useGenerateSequenceStepContentMutation();
  const [updateSequence, { isLoading: isActivating }] = useUpdateSequenceMutation();
  const [deleteSequenceMutation, { isLoading: isDeletingSeq }] = useDeleteSequenceMutation();
  const [updateStepMutation] = useUpdateSequenceStepMutation();
  const [updateLead, { isLoading: isSavingLead }] = useUpdateLeadMutation();

  // ---- Editing state (modals + advanced mode) ----
  const [advancedMode, setAdvancedMode] = useState(false);
  const [editingLead, setEditingLead] = useState(false);
  const [leadDraft, setLeadDraft] = useState({ name: "", email: "", phone: "" });
  const [editingStep, setEditingStep] = useState<DisplayStep | null>(null);
  const [previewStep, setPreviewStep] = useState<DisplayStep | null>(null);
  const [stepDraft, setStepDraft] = useState({ subject: "", content: "" });
  const [savingStep, setSavingStep] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const busyGenerating = isCreating || isGenerating;

  // Default-select the first lead once leads load.
  useEffect(() => {
    if (!selectedLeadId && leads.length > 0) setSelectedLeadId(leads[0].id);
  }, [leads, selectedLeadId]);

  const toggleChannel = (key: ChannelKey) => setChannels((p) => ({ ...p, [key]: !p[key] }));

  const situationLabel = SITUATIONS.find((s) => s.id === situation)?.label ?? "—";
  const goalLabel = GOALS.find((g) => g.id === goal)?.label ?? "—";

  const buildChannelsPayload = (): StepType[] =>
    CHANNEL_ORDER.filter((k) => channels[k]).map((k) => CHANNEL_TO_STEPTYPE[k]!).filter(Boolean) as StepType[];

  /* ----------------------------- Actions ----------------------------- */

  // Surface per-step AI generation outcomes so failures (bad key, wrong
  // provider, quota, model) aren't silently swallowed.
  const reportGeneration = (
    results: { status: string; error?: string }[],
    successMsg: string
  ) => {
    const failed = results.filter(
      (r) => r.status !== "generated" && r.status !== "skipped"
    );
    if (failed.length === 0) {
      showSuccess(successMsg);
      return;
    }
    const firstError = failed.find((r) => r.error)?.error;
    showError(
      `Steps created, but AI content didn't generate (${failed.length}/${results.length}). ` +
        (firstError ?? "Check your AI provider, model and API key in Settings.")
    );
  };

  const runGenerate = async () => {
    if (!selectedLeadId) {
      showError("Select a lead first (add leads on the Leads page).");
      return;
    }
    const chosen = buildChannelsPayload();
    if (chosen.length === 0) {
      showError("Pick at least one automated channel (Email, SMS, WhatsApp or AI Call).");
      return;
    }
    const { totalSteps, intervalDays } = parseCadence(cadence);
    setSeqStatus("draft");
    try {
      const created = await createSequence({
        leadId: selectedLeadId,
        name: `${selectedLead?.name ?? "Lead"} — ${situationLabel}`,
        totalSteps,
        promptTemplateId: selectedTemplateId || undefined,
        situation,
        goal,
        tone: tone.replace(/^\S+\s/, ""),
        intensity,
        channels: chosen,
        intervalDays,
      }).unwrap();

      const gen = await generateSteps(created.data.id).unwrap();
      setSequenceId(created.data.id);
      setSteps(gen.data.sequence.steps.map(mapStep));
      reportGeneration(gen.data.generationResults ?? [], "Sequence generated successfully.");
    } catch (err) {
      showError(apiError(err, "Failed to generate sequence. Check your AI settings and try again."));
    }
  };

  const runRegenerate = async () => {
    if (!sequenceId) {
      showError("Generate a sequence first.");
      return;
    }
    try {
      const res = await regenerateAll(sequenceId).unwrap();
      setSteps(res.data.steps.map(mapStep));
      reportGeneration(res.data.results ?? [], "Sequence content regenerated.");
    } catch (err) {
      showError(apiError(err, "Failed to regenerate content."));
    }
  };

  const activate = async () => {
    if (!sequenceId) {
      showError("Generate a sequence first.");
      return;
    }
    try {
      await updateSequence({ id: sequenceId, body: { status: "active" } }).unwrap();
      setSeqStatus("active");
      showSuccess("Sequence activated — it will now run automatically.");
    } catch (err) {
      showError(apiError(err, "Failed to activate sequence."));
    }
  };

  const pauseSequence = async () => {
    if (!sequenceId) return;
    try {
      await updateSequence({ id: sequenceId, body: { status: "paused" } }).unwrap();
      setSeqStatus("paused");
      showSuccess("Sequence paused — no further steps will send until you resume.");
    } catch (err) {
      showError(apiError(err, "Failed to pause sequence."));
    }
  };

  const doDeleteSequence = async () => {
    setConfirmDelete(false);
    if (!sequenceId) return;
    try {
      // An active sequence can't be deleted directly — cancel it first.
      if (seqStatus === "active") {
        await updateSequence({ id: sequenceId, body: { status: "cancelled" } }).unwrap();
      }
      await deleteSequenceMutation(sequenceId).unwrap();
      showSuccess("Sequence deleted.");
      setSequenceId(null);
      setSeqStatus("draft");
      setSteps(SAMPLE_STEPS);
    } catch (err) {
      showError(apiError(err, "Failed to delete sequence."));
    }
  };

  const addStep = async (channel: keyof typeof CHANNEL_META) => {
    setAddMenuOpen(false);
    const { intervalDays } = parseCadence(cadence);

    if (!sequenceId) {
      // Pre-generation: local-only step of the chosen channel.
      setSteps((p) => [
        ...p,
        {
          key: `local-${Date.now()}`,
          channel,
          delay: `+${(p.length + 1) * intervalDays} days`,
          preview: "New step — generate the sequence (or Edit) to add content.",
          script: channel === "AI Call",
        },
      ]);
      return;
    }

    // Schedule after the last step.
    const lastIso = steps[steps.length - 1]?.scheduledAt;
    const base = lastIso ? new Date(lastIso).getTime() : Date.now();
    const scheduledAt = new Date(base + intervalDays * 86_400_000).toISOString();
    try {
      const res = await createStep({
        sequenceId,
        body: { stepOrder: steps.length + 1, stepType: NAME_TO_STEPTYPE[channel], scheduledAt },
      }).unwrap();
      setSteps((p) => [...p, mapStep(res.data)]);
      showSuccess(`${channel} step added.`);
      // Best-effort: generate AI content for the new step.
      try {
        const gen = await generateStepContent({ sequenceId, stepId: res.data.id }).unwrap();
        setSteps((p) => p.map((s) => (s.key === res.data.id ? mapStep(gen.data) : s)));
      } catch {
        /* no AI key / generation failed — step stays editable */
      }
    } catch (err) {
      showError(apiError(err, "Failed to add step."));
    }
  };

  // Drag-to-reorder
  const onDrop = async (toIndex: number) => {
    const from = dragIndex;
    setDragIndex(null);
    if (from === null || from === toIndex) return;

    const reordered = [...steps];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(toIndex, 0, moved);
    setSteps(reordered); // optimistic

    if (sequenceId && reordered.every((s) => s.stepId)) {
      try {
        const res = await reorderSteps({
          sequenceId,
          orderedStepIds: reordered.map((s) => s.stepId!),
        }).unwrap();
        setSteps(res.data.map(mapStep));
        showSuccess("Steps reordered.");
      } catch (err) {
        showError(apiError(err, "Failed to reorder steps."));
      }
    }
  };

  const removeStep = async (step: DisplayStep) => {
    setOpenMenu(null);
    if (!sequenceId || !step.stepId) {
      setSteps((p) => p.filter((s) => s.key !== step.key));
      return;
    }
    try {
      await deleteStepMutation({ sequenceId, stepId: step.stepId }).unwrap();
      setSteps((p) => p.filter((s) => s.key !== step.key));
      showSuccess("Step removed.");
    } catch (err) {
      showError(apiError(err, "Failed to remove step."));
    }
  };

  const duplicateStep = (step: DisplayStep) => {
    setOpenMenu(null);
    setSteps((p) => {
      const i = p.findIndex((s) => s.key === step.key);
      if (i < 0) return p;
      const copy: DisplayStep = { ...step, key: `local-${Date.now()}`, stepId: undefined };
      return [...p.slice(0, i + 1), copy, ...p.slice(i + 1)];
    });
  };

  // ---- Lead editing ----
  const openLeadEdit = () => {
    if (!selectedLead) {
      showError("No lead selected to edit. Add or pick a lead first.");
      return;
    }
    setLeadDraft({
      name: selectedLead.name ?? "",
      email: selectedLead.email ?? "",
      phone: selectedLead.phone ?? "",
    });
    setEditingLead(true);
  };
  const saveLead = async () => {
    if (!selectedLead) return;
    if (!leadDraft.name.trim()) {
      showError("Name is required.");
      return;
    }
    try {
      await updateLead({
        id: selectedLead.id,
        body: {
          name: leadDraft.name.trim(),
          email: leadDraft.email.trim() || null,
          phone: leadDraft.phone.trim() || null,
        },
      }).unwrap();
      showSuccess("Lead updated.");
      setEditingLead(false);
    } catch (err) {
      showError(apiError(err, "Failed to update lead."));
    }
  };

  // ---- Step editing ----
  const openStepEdit = (step: DisplayStep) => {
    setOpenMenu(null);
    setEditingStep(step);
    setStepDraft({ subject: step.subject ?? "", content: step.preview ?? "" });
  };
  const saveStep = async () => {
    if (!editingStep) return;
    const isEmail = editingStep.channel === "Email";
    const subject = isEmail ? stepDraft.subject.trim() || null : null;
    const content = stepDraft.content;

    if (sequenceId && editingStep.stepId) {
      setSavingStep(true);
      try {
        const res = await updateStepMutation({
          sequenceId,
          stepId: editingStep.stepId,
          body: { subject, content },
        }).unwrap();
        setSteps((p) => p.map((s) => (s.key === editingStep.key ? mapStep(res.data) : s)));
        showSuccess("Step updated.");
        setEditingStep(null);
      } catch (err) {
        showError(apiError(err, "Failed to update step."));
      } finally {
        setSavingStep(false);
      }
    } else {
      setSteps((p) =>
        p.map((s) => (s.key === editingStep.key ? { ...s, subject, preview: content } : s))
      );
      showSuccess("Step updated.");
      setEditingStep(null);
    }
  };

  return (
    <div
      className="flex min-h-screen bg-[#fafafb] text-gray-900 antialiased"
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif" }}
      onClick={() => { if (openMenu !== null) setOpenMenu(null); if (addMenuOpen) setAddMenuOpen(false); }}
    >
      {/* ============================== LEFT SIDEBAR ============================== */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Logo className="h-7 w-7" />
          <span className="text-[15px] font-bold tracking-tight text-gray-900">Touch Base AI</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV_ITEMS.map((item) => {
            const { label, icon: Icon, active, soon } = item;
            return (
              <button
                key={label}
                onClick={() => handleNav(item)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-[0.98] ${
                  active ? "bg-indigo-50 text-indigo-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-[18px] w-[18px] ${active ? "text-indigo-600" : "text-gray-400"}`} />
                <span className="flex-1 truncate text-left">{label}</span>
                {soon && (
                  <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    Soon
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 transition hover:bg-gray-50">
            <Avatar initials={userInitials} square className="h-9 w-9 text-sm" />
            <div className="min-w-0 flex-1 text-left">
              <p className="truncate text-sm font-semibold capitalize text-gray-900">{userName}</p>
              <p className="truncate text-xs text-gray-500">{userEmail}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition-all duration-150 hover:bg-red-50 active:scale-[0.98]"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Logout
          </button>
        </div>
      </aside>

      {/* ============================== MAIN ============================== */}
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-start gap-4 px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="mt-1.5 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:bg-gray-50 hover:shadow active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create Follow-up Sequence</h1>
            <p className="mt-0.5 text-sm text-gray-500">Generate a multi-channel follow-up in seconds.</p>
          </div>
          <button
            onClick={() => navigate("/dashboard/how-to-configure")}
            className="group mt-1.5 flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 shadow-sm transition-all duration-150 hover:bg-gray-50 active:scale-95"
          >
            <PlayCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
            How it works
          </button>
          <button
            onClick={() => navigate("/dashboard/settings")}
            title="Account settings"
            className="mt-1 flex items-center gap-1 rounded-full p-0.5 transition hover:bg-gray-100"
          >
            <Avatar initials={userInitials} className="h-9 w-9 text-sm ring-2 ring-white" />
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>
        </header>

        <div className="flex flex-1 gap-6 px-8 pb-10">
          {/* -------- Center column -------- */}
          <div className="min-w-0 flex-1 space-y-6">
            <Card className="p-6">
              {/* Stepper */}
              <ol className="mb-7 flex items-center">
                {STEPS.map((s, i) => {
                  const active = i === 0;
                  return (
                    <li key={s.title} className="flex items-center" style={i < STEPS.length - 1 ? { flex: 1 } : undefined}>
                      <div className="flex items-center gap-2.5">
                        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition ${active ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "bg-gray-100 text-gray-400"}`}>
                          {i + 1}
                        </span>
                        <div className="hidden md:block">
                          <p className={`text-sm font-semibold leading-tight ${active ? "text-indigo-700" : "text-gray-700"}`}>{s.title}</p>
                          <p className="text-xs leading-tight text-gray-400">{s.sub}</p>
                        </div>
                      </div>
                      {i < STEPS.length - 1 && <span className={`mx-3 hidden h-px flex-1 md:block ${i === 0 ? "bg-indigo-200" : "bg-gray-200"}`} />}
                    </li>
                  );
                })}
              </ol>

              <div className="border-t border-gray-100 pt-6">
                {/* Section 1 */}
                <h2 className="text-[15px] font-semibold text-gray-900">1. What happened with this lead?</h2>
                <p className="mb-4 mt-0.5 text-sm text-gray-500">This helps us choose the right follow-up strategy.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                  {SITUATIONS.map(({ id, label, desc, icon: Icon }) => {
                    const active = situation === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setSituation(id)}
                        className={`flex flex-col gap-2 rounded-xl border p-3.5 text-left transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${active ? "border-indigo-400 bg-indigo-50 ring-1 ring-indigo-300" : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-sm"}`}
                      >
                        <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                        <span className={`text-sm font-semibold leading-tight ${active ? "text-indigo-700" : "text-gray-800"}`}>{label}</span>
                        <span className="text-xs leading-snug text-gray-400">{desc}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Section 2 */}
                <h2 className="mt-7 text-[15px] font-semibold text-gray-900">2. What is your goal?</h2>
                <div className="mt-3 flex flex-wrap gap-2.5">
                  {GOALS.map(({ id, label, icon: Icon }) => {
                    const active = goal === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setGoal(id)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-all duration-150 hover:-translate-y-0.5 active:scale-95 ${active ? "border-indigo-400 bg-indigo-50 text-indigo-700" : "border-gray-200 bg-white text-gray-600 hover:border-indigo-200"}`}
                      >
                        <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-gray-400"}`} />
                        {label}
                      </button>
                    );
                  })}
                </div>

                {/* Section 3 */}
                <h2 className="mt-7 text-[15px] font-semibold text-gray-900">3. Preferences</h2>
                <div className="mt-3 grid gap-6 lg:grid-cols-[1fr_minmax(280px,0.9fr)]">
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <SelectField label="Tone of voice" value={tone} onChange={setTone} options={["🙂 Friendly & Professional", "😎 Casual", "🎯 Direct", "💜 Warm & Empathetic"]} />
                      <SelectField label="Intensity" value={intensity} onChange={setIntensity} options={["Light", "Standard", "Aggressive"]} />
                      <SelectField label="Cadence" value={cadence} onChange={setCadence} options={["3 steps over 5 days", "5 steps over 7 days", "7 steps over 14 days"]} />
                    </div>

                    {/* Prompt template / playbook */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700">Prompt template</label>
                        <button
                          type="button"
                          onClick={() => navigate("/dashboard/templates")}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                        >
                          Manage templates
                        </button>
                      </div>
                      <div className="relative">
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        >
                          <option value="">Auto — based on the situation above</option>
                          {templates.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name}{t.followUpStage ? ` · ${t.followUpStage}` : ""}
                            </option>
                          ))}
                        </select>
                        <BookOpen className="pointer-events-none absolute right-9 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-gray-300 sm:block" />
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">
                        {selectedTemplate
                          ? "The AI will follow this saved playbook (plus your situation & tone)."
                          : templates.length === 0
                            ? "No saved templates yet — the AI uses the situation above. Create one under Templates."
                            : "Optional. Pick a saved playbook to steer the AI, or leave on Auto."}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2.5 text-sm font-medium text-gray-700">Channels</p>
                    <div className="grid grid-cols-2 gap-x-5 gap-y-2.5">
                      {CHANNELS.map(({ key, label, icon: Icon, color, manual }) => {
                        const checked = channels[key];
                        return (
                          <label key={key} className="flex cursor-pointer select-none items-center gap-2">
                            <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border transition-all duration-150 ${checked ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-300 bg-white"}`}>
                              {checked && <Check className="h-3 w-3" strokeWidth={3.5} />}
                            </span>
                            <Icon className={`h-[18px] w-[18px] ${color}`} />
                            <span className="flex flex-col leading-none">
                              <span className="text-sm font-medium text-gray-700">{label}</span>
                              {manual && <span className="mt-0.5 text-[11px] text-gray-400">(manual)</span>}
                            </span>
                            <input type="checkbox" checked={checked} onChange={() => toggleChannel(key)} className="sr-only" />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Generate */}
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <button
                    onClick={runGenerate}
                    disabled={busyGenerating}
                    className="group flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-200 transition-all duration-150 hover:bg-indigo-700 hover:shadow-md hover:shadow-indigo-300 active:scale-95 disabled:opacity-80"
                  >
                    {busyGenerating ? <RefreshCw className="h-[18px] w-[18px] animate-spin" /> : <Sparkles className="h-[18px] w-[18px] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />}
                    {busyGenerating ? "Generating…" : "Generate Follow-up Sequence"}
                  </button>
                  <span className="text-xs text-gray-400">Takes ~10 seconds</span>
                </div>
              </div>
            </Card>

            {/* Generated sequence card */}
            <Card className="p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-[15px] font-semibold text-gray-900">Your Generated Sequence</h2>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">{steps.length} steps</span>
                  {seqStatus === "active" && (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Active</span>
                  )}
                  {seqStatus === "paused" && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">Paused</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={runRegenerate} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-95">
                    <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
                    Regenerate
                  </button>
                  <button
                    onClick={() => setAdvancedMode((v) => !v)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-all duration-150 active:scale-95 ${
                      advancedMode
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Settings2 className="h-4 w-4" />
                    {advancedMode ? "Done" : "Advanced Edit"}
                  </button>
                  {sequenceId && (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      disabled={isDeletingSeq}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 active:scale-95 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                  {seqStatus === "active" ? (
                    <button
                      onClick={pauseSequence}
                      disabled={isActivating}
                      className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-amber-600 active:scale-95 disabled:opacity-80"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={activate}
                      disabled={isActivating}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-indigo-700 hover:shadow-md active:scale-95 disabled:opacity-80"
                    >
                      <Send className="h-4 w-4" />
                      {seqStatus === "paused" ? "Resume" : "Activate Sequence"}
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-2.5">
                {steps.map((step, index) => {
                  const meta = CHANNEL_META[step.channel];
                  const Icon = meta.icon;
                  return (
                    <div
                      key={step.key}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(index)}
                      onDragEnd={() => setDragIndex(null)}
                      className={`group flex items-center gap-3 rounded-xl border bg-white p-3 transition-all duration-150 hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm ${
                        dragIndex === index ? "border-indigo-300 opacity-50" : "border-gray-200"
                      }`}
                    >
                      <button className="cursor-grab text-gray-300 transition hover:text-gray-500 active:cursor-grabbing" title="Drag to reorder">
                        <GripVertical className="h-5 w-5" />
                      </button>
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.chip}`}>
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div className="flex w-[120px] shrink-0 flex-col">
                        <span className={`text-sm font-semibold ${meta.text}`}>{meta.name}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {step.delay}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        {step.subject && (
                          <p className={`text-sm font-medium text-gray-700 ${advancedMode ? "whitespace-pre-wrap break-words" : "truncate"}`}>
                            Subject: {step.subject}
                          </p>
                        )}
                        <p className={`text-sm text-gray-500 ${advancedMode ? "whitespace-pre-wrap break-words" : "truncate"}`}>
                          {step.preview}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {step.script ? (
                          <button onClick={() => openStepEdit(step)} className="rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-95">Edit Script</button>
                        ) : (
                          <>
                            <button onClick={() => setPreviewStep(step)} className="hidden rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-95 sm:block">Preview</button>
                            <button onClick={() => openStepEdit(step)} className="hidden items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-95 sm:flex">
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                          </>
                        )}
                        <div className="relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setOpenMenu(openMenu === step.key ? null : step.key); }}
                            className="rounded-md p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 active:scale-90"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          {openMenu === step.key && (
                            <div className="absolute right-0 top-9 z-20 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                              <button onClick={(e) => { e.stopPropagation(); duplicateStep(step); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-50">
                                <Copy className="h-3.5 w-3.5" /> Duplicate
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); removeStep(step); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-500 transition hover:bg-red-50">
                                <Trash2 className="h-3.5 w-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative mt-3">
                <button
                  onClick={(e) => { e.stopPropagation(); setAddMenuOpen((v) => !v); }}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-all duration-150 hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-600 active:scale-[0.99]"
                >
                  <Plus className="h-4 w-4" />
                  Add Step
                </button>
                {addMenuOpen && (
                  <div className="absolute bottom-14 left-1/2 z-20 w-56 -translate-x-1/2 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                    <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">Choose a channel</p>
                    {ADDABLE_CHANNELS.map((ch) => {
                      const m = CHANNEL_META[ch];
                      const I = m.icon;
                      return (
                        <button
                          key={ch}
                          onClick={(e) => { e.stopPropagation(); addStep(ch); }}
                          className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
                        >
                          <span className={`flex h-6 w-6 items-center justify-center rounded-md ${m.chip}`}>
                            <I className="h-3.5 w-3.5" />
                          </span>
                          {m.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* -------- Right column -------- */}
          <aside className="hidden w-80 shrink-0 space-y-5 xl:block">
            {/* Lead + Summary */}
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Lead</h3>
                <button onClick={openLeadEdit} className="flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 transition-all duration-150 hover:bg-gray-50 active:scale-95">
                  <Pencil className="h-3 w-3" />
                  Edit
                </button>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Avatar initials={selectedLead ? initials(selectedLead.name) : "A4"} square className="h-11 w-11 text-base" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{selectedLead?.name ?? "Addie 40songs"}</p>
                  <p className="truncate text-xs text-gray-500">{selectedLead?.email ?? "addie40@example.com"}</p>
                  <p className="truncate text-xs text-gray-500">{selectedLead?.phone ?? "+233 50 123 4567"}</p>
                </div>
              </div>
              {leads.length > 0 ? (
                <div className="relative mt-3">
                  <select
                    value={selectedLeadId}
                    onChange={(e) => setSelectedLeadId(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-gray-600 outline-none transition hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {leads.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}{l.email ? ` — ${l.email}` : ""}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                </div>
              ) : (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                  No leads loaded. Sign in and add leads to generate a real sequence.
                </p>
              )}

              <h3 className="mt-5 text-sm font-semibold text-gray-900">Follow-up Summary</h3>
              <dl className="mt-3 space-y-2.5 text-sm">
                <SummaryRow label="Situation" value={situationLabel} />
                <SummaryRow label="Goal" value={goalLabel} />
                <SummaryRow label="Tone" value={tone.replace(/^\S+\s/, "")} />
                <SummaryRow label="Intensity" value={intensity} />
                <SummaryRow label="Cadence" value={cadence} />
                <SummaryRow label="Template" value={selectedTemplate?.name ?? "Auto (situation)"} />
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-gray-500">Channels</dt>
                  <dd className="flex items-center gap-1.5">
                    {CHANNELS.filter((c) => channels[c.key]).map(({ key, label, icon: Icon, color }) => (
                      <span key={key} title={label}><Icon className={`h-4 w-4 ${color}`} /></span>
                    ))}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex gap-2 rounded-xl bg-indigo-50 p-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                <p className="text-xs leading-relaxed text-indigo-700">AI will generate a sequence optimized for this situation and your goal.</p>
              </div>
            </Card>

            {/* Tips */}
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-gray-900">Tips for this sequence</h3>
              <ul className="mt-3 space-y-3">
                {TIPS.map((tip) => (
                  <li key={tip.strong} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gray-300" />
                    <span>
                      {tip.strong}
                      {tip.rest && <span className="block text-gray-500">{tip.rest}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>

            <button
              onClick={() => navigate("/dashboard/templates")}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 transition-all duration-150 hover:bg-indigo-100 active:scale-[0.98]"
            >
              <BookOpen className="h-[18px] w-[18px]" />
              View Playbook ({situationLabel})
            </button>
          </aside>
        </div>
      </main>

      {/* ============================== MODALS ============================== */}
      {editingLead && (
        <Modal
          title="Edit lead"
          onClose={() => setEditingLead(false)}
          footer={
            <>
              <button onClick={() => setEditingLead(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveLead} disabled={isSavingLead} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70">
                {isSavingLead ? "Saving…" : "Save changes"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            <LabeledInput label="Name" value={leadDraft.name} onChange={(v) => setLeadDraft((d) => ({ ...d, name: v }))} />
            <LabeledInput label="Email" type="email" value={leadDraft.email} onChange={(v) => setLeadDraft((d) => ({ ...d, email: v }))} />
            <LabeledInput label="Phone" value={leadDraft.phone} onChange={(v) => setLeadDraft((d) => ({ ...d, phone: v }))} />
          </div>
        </Modal>
      )}

      {editingStep && (
        <Modal
          title={editingStep.script ? "Edit call script" : `Edit ${editingStep.channel} message`}
          onClose={() => setEditingStep(null)}
          footer={
            <>
              <button onClick={() => setEditingStep(null)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={saveStep} disabled={savingStep} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-70">
                {savingStep ? "Saving…" : "Save changes"}
              </button>
            </>
          }
        >
          <div className="space-y-3">
            {editingStep.channel === "Email" && (
              <LabeledInput label="Subject" value={stepDraft.subject} onChange={(v) => setStepDraft((d) => ({ ...d, subject: v }))} />
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {editingStep.script ? "Call script" : "Message"}
              </label>
              <textarea
                value={stepDraft.content}
                onChange={(e) => setStepDraft((d) => ({ ...d, content: e.target.value }))}
                rows={7}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
          </div>
        </Modal>
      )}

      {previewStep && (
        <Modal
          title={`${previewStep.channel} preview`}
          onClose={() => setPreviewStep(null)}
          footer={
            <button onClick={() => setPreviewStep(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200">
              Close
            </button>
          }
        >
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {previewStep.delay}
            </div>
            {previewStep.subject && <p className="text-sm font-semibold text-gray-900">Subject: {previewStep.subject}</p>}
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-600">{previewStep.preview}</p>
          </div>
        </Modal>
      )}

      {confirmDelete && (
        <Modal
          title="Delete sequence?"
          onClose={() => setConfirmDelete(false)}
          footer={
            <>
              <button onClick={() => setConfirmDelete(false)} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100">
                Cancel
              </button>
              <button onClick={doDeleteSequence} disabled={isDeletingSeq} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-70">
                {isDeletingSeq ? "Deleting…" : "Delete sequence"}
              </button>
            </>
          }
        >
          <p className="text-sm text-gray-600">
            This permanently removes the sequence and all its steps
            {seqStatus === "active" ? " and stops it from sending" : ""}. This can't be undone.
          </p>
        </Modal>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sub-components                                                            */
/* -------------------------------------------------------------------------- */

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-lg border border-gray-200 bg-white px-3 py-2.5 pr-9 text-sm text-gray-700 outline-none transition-all duration-150 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-900">{value}</dd>
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  footer,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
