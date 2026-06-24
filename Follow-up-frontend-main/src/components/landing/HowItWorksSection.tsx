import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Mail,
  MessageSquareText,
  Mic,
  Pause,
  Phone,
  Send,
  Settings,
  Sparkles,
  User,
  UserPlus,
  Users,
  Wand2,
} from "lucide-react";

export function WhatsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <title>WhatsApp</title>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function FlowMergeConnector() {
  return (
    <div className="relative mx-auto w-full max-w-xl py-2">
      <div className="hidden md:block">
        <svg
          viewBox="0 0 400 72"
          className="mx-auto h-[72px] w-full text-[#D1D5DB]"
          aria-hidden
        >
          <path
            d="M 72 0 L 72 36 L 200 36 L 200 72"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <path
            d="M 328 0 L 328 36 L 200 36"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5 4"
          />
          <polygon points="196,68 204,68 200,76" fill="currentColor" />
        </svg>
        <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1">
          <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-semibold text-emerald-700 shadow-sm">
            Lead + Template
          </span>
        </div>
        <div className="absolute left-[18%] top-2 text-[10px] font-medium text-violet-600">
          Template
        </div>
        <div className="absolute right-[18%] top-2 text-[10px] font-medium text-blue-600">
          Lead + Transcript
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 py-3 md:hidden">
        <ChevronDown className="h-4 w-4 text-[#9CA3AF]" aria-hidden />
        <span className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-semibold text-emerald-700">
          Lead + Template
        </span>
        <ChevronDown className="h-4 w-4 text-[#9CA3AF]" aria-hidden />
      </div>
    </div>
  );
}

function FlowDownConnector({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center py-2", className)}>
      <div className="h-8 w-px border-l-2 border-dashed border-[#D1D5DB]" />
      <ChevronDown className="-mt-1 h-4 w-4 text-[#9CA3AF]" aria-hidden />
      <span className="mt-1 rounded-full border border-[#E5E7EB] bg-white px-2.5 py-0.5 text-[10px] font-medium text-[#6B7280]">
        {label}
      </span>
      <div className="mt-1 h-8 w-px border-l-2 border-dashed border-[#D1D5DB]" />
      <ChevronDown className="-mt-1 h-4 w-4 text-[#9CA3AF]" aria-hidden />
    </div>
  );
}

function FlowRightConnector({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-1", className)}>
      <div className="flex items-center gap-0.5">
        <div className="h-px w-6 border-t-2 border-dashed border-[#D1D5DB] md:w-10" />
        <ChevronRight className="h-4 w-4 shrink-0 text-[#9CA3AF]" aria-hidden />
      </div>
      <span className="mt-1 whitespace-nowrap text-[10px] font-medium text-[#6B7280]">
        Approve
      </span>
    </div>
  );
}

const SETUP_ITEMS = [
  { label: "AI provider", desc: "OpenAI, Gemini, or Claude", icon: Bot },
  { label: "Fathom", desc: "Meeting transcripts", icon: Mic },
  { label: "Email SMTP", desc: "Outbound email", icon: Mail },
  { label: "SMS & WhatsApp", desc: "Twilio or TextMagic", icon: MessageSquareText },
  { label: "AI calling", desc: "Retell voice steps", icon: Phone },
] as const;

const DELIVERY_CHANNELS = [
  { label: "Email", icon: Mail },
  { label: "SMS", icon: MessageSquareText },
  { label: "WhatsApp", icon: WhatsIcon },
  { label: "AI Call", icon: Phone },
] as const;

interface HowItWorksSectionProps {
  id?: string;
  className?: string;
  showHeader?: boolean;
  /** Before you start + After activation blocks (How to configure page). */
  showSetupAndTracking?: boolean;
  /** Show Settings link on setup block (dashboard). */
  linksEnabled?: boolean;
}

function SetupPrerequisites({ linksEnabled }: { linksEnabled: boolean }) {
  return (
    <div className="mb-12 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Before you start
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-900">
            One-time setup in Settings
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Connect your tools once — then templates, leads, and sequences can run end to end.
          </p>
        </div>
        {linksEnabled ? (
          <Link
            to="/dashboard/settings"
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
          >
            <Settings className="h-3.5 w-3.5" aria-hidden />
            Open Settings
          </Link>
        ) : null}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {SETUP_ITEMS.map(({ label, desc, icon: Icon }) => (
          <div
            key={label}
            className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
          >
            <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-800">
              <Icon className="h-3.5 w-3.5 text-indigo-600" aria-hidden />
              {label}
            </div>
            <p className="text-[10px] leading-relaxed text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackAndControl() {
  return (
    <div className="mt-12 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        After activation
      </p>
      <h3 className="mt-1 text-lg font-semibold text-slate-900">Track & control</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <BarChart3 className="h-4 w-4 text-indigo-600" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Dashboard</p>
            <p className="text-xs text-slate-500">
              See sent counts and progress per channel on each sequence.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <Pause className="h-4 w-4 text-indigo-600" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Pause or resume</p>
            <p className="text-xs text-slate-500">
              Toggle sequences active or paused anytime from the Sequences page.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/80 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100">
            <Send className="h-4 w-4 text-indigo-600" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Multi-channel delivery</p>
            <p className="text-xs text-slate-500">
              Steps run across email, SMS, WhatsApp, and AI calls on your cadence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HowItWorksSection({
  id = "how-it-works",
  className,
  showHeader = true,
  showSetupAndTracking = false,
  linksEnabled = false,
}: HowItWorksSectionProps) {
  return (
    <div id={id} className={cn("mx-auto max-w-[1040px]", className)}>
      {showHeader ? (
        <div className="mb-12 text-center">
          <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            Workflow
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-[#111111]">How It Works</h2>
          <p className="mx-auto mt-4 max-w-2xl text-[#6B7280]">
            Build templates and leads on their own — then combine them with AI to generate a full
            follow-up sequence.
          </p>
        </div>
      ) : null}

      {showSetupAndTracking ? (
        <SetupPrerequisites linksEnabled={linksEnabled} />
      ) : null}

      <div className="mb-16 hidden lg:block">
        <div className="relative flex items-start justify-between gap-2">
          <div className="absolute left-[10%] right-[10%] top-5 h-px bg-[#E5E7EB]" />
          {[
            {
              step: 1,
              title: "Create Template",
              desc: "Define structure, tone, and channel rules — with AI or manually.",
              Icon: FileText,
            },
            {
              step: 2,
              title: "Add Lead",
              desc: "Add a lead and attach a meeting transcript anytime.",
              Icon: Users,
            },
            {
              step: 3,
              title: "Generate Sequence",
              desc: "AI combines lead + template into a multi-step sequence.",
              Icon: Sparkles,
            },
            {
              step: 4,
              title: "Review & Edit",
              desc: "Tweak steps, content, timing, or channels if needed.",
              Icon: Wand2,
            },
            {
              step: 5,
              title: "Activate",
              desc: "Launch the sequence and let automation run.",
              Icon: Send,
            },
          ].map(({ step, title, desc, Icon }) => (
            <div
              key={step}
              className="relative z-[1] flex w-1/5 flex-col items-center px-2 text-center"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#E5E7EB] bg-white shadow-sm">
                <Icon className="h-4 w-4 text-[#2563EB]" aria-hidden />
              </div>
              <span className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]">
                Step {step}
              </span>
              <h4 className="mb-1 text-sm font-semibold text-[#111111]">{title}</h4>
              <p className="text-xs leading-relaxed text-[#6B7280]">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-10">
          <div className="flex flex-col overflow-hidden rounded-xl border border-violet-200 bg-white shadow-sm">
            <div className="border-b border-violet-100 bg-violet-50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-700">
                Templates
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-3 space-y-1.5">
                {[
                  { name: "No Show Follow-up", active: true },
                  { name: "Post-Call Momentum", active: false },
                  { name: "Proposal Chase", active: false },
                  { name: "Re-engagement", active: false },
                ].map((tpl) => (
                  <div
                    key={tpl.name}
                    className={`rounded-md border px-2.5 py-1.5 text-xs ${
                      tpl.active
                        ? "border-violet-300 bg-violet-50 font-medium text-violet-900"
                        : "border-[#E5E7EB] text-[#6B7280]"
                    }`}
                  >
                    {tpl.name}
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="mb-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 px-3 py-2 text-xs font-medium text-violet-700"
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                Generate with AI
              </button>
              <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
                Build reusable templates with steps, tone, and channel rules — create prompt text
                with AI anytime.
              </p>
            </div>
          </div>

          <div className="flex flex-col overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm">
            <div className="border-b border-blue-100 bg-blue-50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                Lead
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-3 rounded-lg border border-[#E5E7EB] bg-gray-50 p-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <User className="h-4 w-4 text-blue-600" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#111111]">Sarah Chen</p>
                    <p className="truncate text-xs text-[#6B7280]">sarah@acme.io · Acme Corp</p>
                  </div>
                </div>
              </div>

              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/60 px-2 py-2 text-xs font-medium text-blue-700"
                >
                  <UserPlus className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Add manually
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-blue-300 bg-white px-2 py-2 text-xs font-medium text-blue-700"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  CSV import
                </button>
              </div>

              <div className="mb-3 rounded-lg border border-dashed border-blue-200 bg-blue-50/40 px-3 py-2.5">
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium text-blue-700">
                  <Mic className="h-3.5 w-3.5" aria-hidden />
                  Meeting transcript
                </div>
                <p className="text-xs leading-relaxed text-[#6B7280]">
                  Attach from Fathom to personalize outreach.
                </p>
              </div>

              <p className="mt-auto text-xs leading-relaxed text-[#6B7280]">
                Add leads manually or import a CSV, then link meeting transcripts per lead.
              </p>
            </div>
          </div>
        </div>

        <FlowMergeConnector />

        <div className="mx-auto max-w-sm">
          <div className="flex flex-col overflow-hidden rounded-xl border border-emerald-200 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Generate Sequence
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                <Sparkles className="h-6 w-6 text-emerald-600" aria-hidden />
              </div>
              <p className="mb-1 text-xs font-medium text-[#111111]">Lead + Template</p>
              <p className="mb-4 text-[10px] text-[#6B7280]">Sarah Chen + No Show Follow-up</p>
              <button
                type="button"
                className="mb-3 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Generate Sequence with AI
              </button>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                One click — AI uses lead info, transcript, and template to create steps and content.
              </p>
            </div>
          </div>
        </div>

        <FlowDownConnector label="Generated steps" />

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_auto_1fr] md:gap-4">
          <div className="flex flex-col overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-amber-50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                Review & Edit
              </span>
            </div>
            <div className="flex flex-1 flex-col p-4">
              <div className="mb-3 space-y-1.5">
                {[
                  { n: 1, ch: "Email", time: "Immediate", Icon: Mail },
                  { n: 2, ch: "SMS", time: "+1 day", Icon: MessageSquareText },
                  { n: 3, ch: "WhatsApp", time: "+2 days", Icon: WhatsIcon },
                  { n: 4, ch: "AI Call", time: "+3 days", Icon: Phone },
                  { n: 5, ch: "Email", time: "+4 days", Icon: Mail },
                ].map(({ n, ch, time, Icon }) => (
                  <div
                    key={n}
                    className="flex items-center justify-between rounded-md border border-[#E5E7EB] px-2.5 py-1.5 text-[10px]"
                  >
                    <span className="flex items-center gap-1.5 font-medium text-[#1F2937]">
                      <Icon className="h-3 w-3 text-[#2563EB]" aria-hidden />
                      Step {n}: {ch}
                    </span>
                    <span className="text-[#6B7280]">{time}</span>
                  </div>
                ))}
              </div>
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"
                >
                  Edit Steps
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-white px-3 py-2 text-xs font-medium text-amber-800"
                >
                  <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  Regenerate content
                </button>
              </div>
              <p className="mt-auto text-xs leading-relaxed text-[#6B7280]">
                Edit steps manually, or regenerate all content with AI before going live.
              </p>
            </div>
          </div>

          <FlowRightConnector className="hidden md:flex" />
          <FlowDownConnector label="Go live" className="py-0 md:hidden" />

          <div className="flex flex-col overflow-hidden rounded-xl border border-indigo-200 bg-white shadow-sm">
            <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
                Activate
              </span>
            </div>
            <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
                <Check className="h-6 w-6 text-indigo-600" aria-hidden />
              </div>
              <p className="mb-3 text-sm font-semibold text-[#111111]">Sequence is ready!</p>
              <div className="mb-3 flex flex-wrap justify-center gap-1.5">
                {DELIVERY_CHANNELS.map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-800"
                  >
                    <Icon className="h-3 w-3" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="mb-3 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm"
              >
                Activate Sequence
              </button>
              <p className="text-xs leading-relaxed text-[#6B7280]">
                Activate to start automated follow-up across all configured channels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showSetupAndTracking ? <TrackAndControl /> : null}
    </div>
  );
}
