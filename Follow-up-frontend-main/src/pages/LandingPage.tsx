import { Link } from "react-router-dom";
import Logo from "@/components/logo/Logo";
import landingPageLogo from "@/assets/landingpage logo.png";
import HowItWorksSection, { WhatsIcon } from "@/components/landing/HowItWorksSection";
import {
  ArrowRight,
  Box,
  CalendarCheck,
  CalendarX,
  Check,
  ChevronDown,
  ChevronRight,
  Cog,
  Database,
  FileText,
  GitBranch,
  Handshake,
  Layers,
  Mail,
  MessageSquareText,
  Mic,
  Phone,
  ScrollText,
  Send,
  Star,
  TrendingDown,
  X,
} from "lucide-react";

const accent = "#2563EB";
const brandBlack = "#111111";

const shadowSubtle = "shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]";
const shadowCard =
  "shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)]";

/** Landing-only mark — `src/assets/landingpage logo.png` */
function LandingBrandMark({ className }: { className?: string }) {
  return (
    <img
      src={landingPageLogo}
      alt="Touch Base AI"
      className={`h-6 w-6 shrink-0 object-contain ${className ?? ""}`}
    />
  );
}

export default function LandingPage() {
  return (
    <div
      className="min-h-screen bg-white text-[#1F2937] antialiased"
      style={{ fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}
    >
      <nav className="fixed z-50 flex h-16 w-full items-center justify-center border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
        <div className="flex w-full max-w-[1040px] items-center justify-between px-6">
          <div className="flex items-center space-x-2">
            <LandingBrandMark />
            <span className="font-semibold tracking-tight text-[#111111]">TouchBase.ai</span>
          </div>

          <div className="hidden items-center space-x-8 text-sm font-medium text-[#6B7280] md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-[#111111]">
              How it Works
            </a>
            <a href="#flows" className="transition-colors hover:text-[#111111]">
              Flows
            </a>
            <a href="#get-started" className="transition-colors hover:text-[#111111]">
              Pricing
            </a>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/auth/signin"
              className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#111111]"
            >
              Log in
            </Link>
            <Link
              to="/auth/signin"
              className="rounded-[10px] px-4 py-2 text-sm font-medium text-white shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-colors hover:bg-gray-800"
              style={{ backgroundColor: brandBlack }}
            >
              Get Access
            </Link>
          </div>
        </div>
      </nav>

      <section id="hero" className="flex justify-center pb-16 pt-32 md:pb-20 md:pt-40">
        <div className="w-full max-w-[1040px] px-6">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <div className="mb-8 flex flex-wrap justify-center gap-2">
              {["For Dev/AI Agencies", "Founder-led Sales", "48-72h Decay"].map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded-full border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]"
                >
                  {t}
                </span>
              ))}
            </div>

            <h1 className="mb-6 text-4xl font-bold leading-[1.1] tracking-[-0.04em] text-[#111111] md:text-5xl lg:text-6xl">
              Recover 1–2 &quot;Almost Deals&quot; Per Month That Go Cold After the Call
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg font-normal leading-relaxed text-[#6B7280] md:text-xl">
              Built for Dev / AI agencies doing 10–40 sales calls/month and selling $5k–$50k builds.
            </p>

            <p className="mx-auto mb-10 max-w-xl text-base leading-relaxed text-[#6B7280]/80">
              Transcript-based follow-up (Fathom → personalized email/SMS cadence) that turns
              &quot;great call&quot; into a booked next step — without the founder chasing.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                to="/auth/signin"
                className="group flex w-full items-center justify-center rounded-[12px] px-6 py-3 text-center text-base font-semibold text-white shadow-sm transition-all hover:opacity-95 sm:w-auto"
                style={{ backgroundColor: accent }}
              >
                Book a 15-min walkthrough
                <ArrowRight className="ml-2 h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <span className="text-sm text-[#6B7280]">No credit card required</span>
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-[#E5E7EB] bg-gray-50/50 p-8 text-sm font-medium text-[#1F2937] md:flex-row md:gap-8 md:p-12">
            <div
              className={`flex min-w-[180px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 ${shadowSubtle}`}
            >
              <FileText className="mr-3 h-4 w-4 text-[#6B7280]" aria-hidden />
              <span>Transcript (Fathom)</span>
            </div>
            <div className="relative hidden h-px w-16 bg-[#E5E7EB] md:block">
              <ChevronRight className="absolute -right-0.5 -top-1.5 h-3 w-3 text-[#6B7280]" />
            </div>
            <div className="relative block h-8 w-px bg-[#E5E7EB] md:hidden">
              <ChevronDown className="absolute -bottom-0.5 -left-1 h-3 w-3 text-[#6B7280]" />
            </div>
            <div
              className={`flex min-w-[180px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 ring-1 ring-[#2563EB]/20 ${shadowSubtle}`}
            >
              <Send className="mr-3 h-4 w-4" style={{ color: accent }} aria-hidden />
              <span>Follow-up Cadence</span>
            </div>
            <div className="relative hidden h-px w-16 bg-[#E5E7EB] md:block">
              <ChevronRight className="absolute -right-0.5 -top-1.5 h-3 w-3 text-[#6B7280]" />
            </div>
            <div className="relative block h-8 w-px bg-[#E5E7EB] md:hidden">
              <ChevronDown className="absolute -bottom-0.5 -left-1 h-3 w-3 text-[#6B7280]" />
            </div>
            <div
              className={`flex min-w-[180px] items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 ${shadowSubtle}`}
            >
              <CalendarCheck className="mr-3 h-4 w-4 text-green-600" aria-hidden />
              <span>Booked Next Step</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-[#E5E7EB] bg-gray-50/30 py-8">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4 md:gap-0 md:divide-x md:divide-[#E5E7EB]">
            {[
              { k: "48-72h", l: "Leads go cold" },
              { k: "7-Touch", l: "Built-in Cadence" },
              { k: "3 Flows", l: "Decision Logic" },
              { k: "Zero", l: "Manual Chasing" },
            ].map((row) => (
              <div key={row.k} className="px-4">
                <div className="mb-1 font-mono text-2xl font-bold tracking-tight text-[#111111]">
                  {row.k}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-[#6B7280]">
                  {row.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E7EB] py-10">
        <div className="mx-auto flex max-w-[1040px] flex-col items-center justify-center gap-6 px-6 text-sm text-[#6B7280]/60 sm:flex-row">
          <span className="font-medium">Trusted by founders at</span>
          <div className="flex items-center gap-8 opacity-70 grayscale">
            <div className="flex items-center gap-2 font-semibold text-[#111111]">
              <Box className="h-4 w-4" aria-hidden /> Artech Digital
            </div>
            <div className="flex items-center gap-2 font-semibold text-[#111111]">
              <Layers className="h-4 w-4" aria-hidden /> StackFlow
            </div>
            <div className="flex items-center gap-2 font-semibold text-[#111111]">
              <GitBranch className="h-4 w-4" aria-hidden /> GitScale
            </div>
          </div>
          <div className="mx-2 hidden h-4 w-px bg-gray-300 sm:block" />
          <div className="flex items-center gap-1.5">
            <div className="flex text-[10px] text-yellow-500">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="mr-px h-3 w-3 fill-yellow-500" aria-hidden />
              ))}
            </div>
            <span className="text-xs font-medium text-[#6B7280]">120+ five-star reviews</span>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div>
              <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                The Problem
              </span>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#111111] md:text-4xl">
                The &quot;Great Call&quot; Paradox
              </h2>
              <p className="mb-8 leading-relaxed text-[#6B7280]">
                You have a fantastic discovery call. They seem interested. You send the proposal.
                Then... silence. You&apos;re busy building, so you forget to follow up until it&apos;s
                too late.
              </p>
              <div className="space-y-4">
                {[
                  "Mental load of remembering who to email and when",
                  'Generic "just checking in" bumps that get ignored',
                  "Leads drift away to competitors who stayed top-of-mind",
                  "Revenue lost simply due to lack of systematic persistence",
                ].map((t) => (
                  <div key={t} className="flex items-start">
                    <X className="mr-3 mt-1 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                    <span className="text-[#1F2937]">{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative rounded-xl border border-[#E5E7EB] bg-gray-50 p-8">
              <div className="absolute right-0 top-0 z-10 -mr-4 -mt-4 rounded-lg border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-medium text-red-500 shadow-sm">
                <TrendingDown className="mr-1 inline h-3 w-3" aria-hidden /> 20% Drop-off
              </div>

              <div className="space-y-3">
                {[
                  { s: "Discovery Call", tag: "High Interest", tg: "bg-green-100 text-green-700", op: 100 },
                  { s: "Proposal Sent", tag: "Waiting", tg: "bg-gray-100 text-gray-600", op: 90 },
                  { s: "Day 3: Silence", tag: "No follow up", tg: "text-gray-400", op: 75 },
                  { s: "Day 7: Cold", tag: "Lead Lost", tg: "text-red-500 font-medium", op: 50 },
                ].map((row, i, arr) => (
                  <div key={row.s}>
                    <div
                      className="flex items-center justify-between rounded border border-[#E5E7EB] bg-white p-3"
                      style={{ opacity: row.op / 100 }}
                    >
                      <span className="text-sm font-medium">{row.s}</span>
                      <span className={`rounded px-2 py-0.5 text-xs ${row.tg}`}>{row.tag}</span>
                    </div>
                    {i < arr.length - 1 ? (
                      <div className="mx-auto flex h-4 w-0 justify-center border-l border-dashed border-[#E5E7EB]" />
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-20 text-white">
        <div className="mx-auto max-w-[1040px] px-6 text-center">
          <span className="mb-4 block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
            The Insight
          </span>
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            The data already exists — it&apos;s just not connected.
          </h2>
          <p className="mx-auto mb-16 max-w-2xl text-[#6B7280]">
            You have the transcript. You have the status. You just lack the engine to connect them.
          </p>

          <div className="grid gap-8 text-left md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                <Mic className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Transcript</h3>
              <p className="text-sm text-gray-400">
                What was actually said. We pull context directly from Fathom, Otter, or Fireflies.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 text-white">
                <Database className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Status</h3>
              <p className="text-sm text-gray-400">
                What stage they&apos;re in. Synced from your Lead DB, CRM, or even a simple Google
                Sheet.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="absolute -right-10 -top-10 h-20 w-20 rounded-full bg-[#2563EB]/20 blur-2xl" />
              <div
                className="relative z-[1] mb-4 flex h-10 w-10 items-center justify-center rounded-lg text-white"
                style={{ backgroundColor: accent }}
              >
                <Cog className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="relative z-[1] mb-2 text-lg font-semibold">Execution</h3>
              <p className="relative z-[1] text-sm text-gray-400">
                Consistent follow-up + logging. VA-driven or automated, ensuring zero slippage.
              </p>
            </div>
          </div>

          <div className="mt-12 font-mono text-sm text-[#6B7280]">
            &gt; This connects them into a repeatable system.
          </div>
        </div>
      </section>

      <section className="border-b border-[#E5E7EB] py-20">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="flex flex-col gap-12 md:flex-row">
            <div className="md:w-1/3">
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#111111]">
                Systematic Recovery
              </h2>
              <p className="mb-6 text-[#6B7280]">
                We don&apos;t replace your sales process. We reinforce the leaky parts with
                engineering precision.
              </p>
              <div className="rounded-lg border border-[#E5E7EB] bg-gray-50 p-4">
                <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                  Available Channels
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { Icon: Mail, label: "Email" },
                    { Icon: MessageSquareText, label: "SMS" },
                    { Icon: WhatsIcon, label: "WhatsApp", isWa: true },
                    { Icon: Phone, label: "AI Call" },
                  ].map(({ Icon, label, isWa }) => (
                    <span
                      key={label}
                      className="flex items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-3 py-1 text-xs font-medium text-[#1F2937]"
                    >
                      {isWa ? (
                        <Icon className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden />
                      ) : (
                        <Icon className="h-3.5 w-3.5 text-[#2563EB]" aria-hidden />
                      )}
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 md:w-2/3">
              {[
                {
                  title: "Context-Aware",
                  desc: "Uses call transcript context (Fathom or any AI notetaker) to reference specific pain points.",
                },
                {
                  title: "Smart Triggers",
                  desc: 'Automatically triggers the right flow: No-show, Post-call, or Proposal follow-up.',
                },
                {
                  title: "Multi-Channel Reach",
                  desc: "Generates personalized messages across Email, SMS, WhatsApp, and AI voice calls on a proven cadence.",
                },
                {
                  title: "CRM Logging",
                  desc: "Logs every touch back to your system. Stops automatically when they book, buy, or decline.",
                },
              ].map(({ title, desc }) => (
                <div key={title} className="flex flex-col">
                  <div className="mb-4 h-px w-8 bg-[#2563EB]" />
                  <h3 className="mb-2 font-semibold text-[#111111]">{title}</h3>
                  <p className="text-sm text-[#6B7280]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-gray-50 py-20">
        <div className="px-6">
          <HowItWorksSection />
        </div>
      </section>

      <section id="flows" className="border-b border-[#E5E7EB] py-20">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[#111111]">Built-in Flows</h2>
            <p className="mt-4 text-[#6B7280]">
              Three standard operating procedures, automated across all channels.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <div
              className={`rounded-xl border border-[#E5E7EB] bg-white p-8 ${shadowCard} transition-shadow hover:shadow-md`}
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[#1F2937]">
                <CalendarX className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-3 text-lg font-bold">No-Show Recovery</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">
                Polite but persistent nudges to reschedule. Removes the awkwardness of chasing someone
                who ghosted the meeting.
              </p>
              <ul className="mb-6 space-y-2 font-mono text-xs text-[#6B7280]">
                {[
                  `Day 0: "Everything ok?"`,
                  "Day 2: Reschedule link",
                  "Day 5: Final check",
                ].map((li) => (
                  <li key={li} className="flex items-center">
                    <Check className="mr-2 h-2.5 w-2.5 shrink-0 text-[#2563EB]" aria-hidden />
                    {li}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <Mail className="mr-1 inline h-3 w-3" aria-hidden />
                  Email
                </span>
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <MessageSquareText className="mr-1 inline h-3 w-3" aria-hidden />
                  SMS
                </span>
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <Phone className="mr-1 inline h-3 w-3" aria-hidden />
                  AI Call
                </span>
              </div>
            </div>

            <div
              className={`relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-8 ring-1 ring-[#111111]/5 ${shadowCard} transition-shadow hover:shadow-md`}
            >
              <div className="absolute -right-8 -top-8 z-0 h-16 w-16 rounded-bl-full bg-[#F3F4F6]" />
              <div className="relative z-10 mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-[#111111] text-white">
                <Handshake className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="relative z-10 mb-3 text-lg font-bold">Post-Call Momentum</h3>
              <p className="relative z-10 mb-6 text-sm leading-relaxed text-[#6B7280]">
                Summarizes the call, reiterates value, and pushes for the next micro-commitment
                before they cool off.
              </p>
              <ul className="relative z-10 mb-6 space-y-2 font-mono text-xs text-[#6B7280]">
                {[
                  "1h Post: Summary + Resources",
                  "Day 2: Value add",
                  "Day 4: Next step bump",
                ].map((li) => (
                  <li key={li} className="flex items-center">
                    <Check className="mr-2 h-2.5 w-2.5 shrink-0 text-[#2563EB]" aria-hidden />
                    {li}
                  </li>
                ))}
              </ul>
              <div className="relative z-10 flex flex-wrap gap-2">
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <Mail className="mr-1 inline h-3 w-3" aria-hidden />
                  Email
                </span>
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <WhatsIcon className="mr-1 inline h-3 w-3 text-[#2563EB]" aria-hidden />
                  WhatsApp
                </span>
              </div>
            </div>

            <div
              className={`rounded-xl border border-[#E5E7EB] bg-white p-8 ${shadowCard} transition-shadow hover:shadow-md`}
            >
              <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-[#1F2937]">
                <ScrollText className="h-5 w-5" aria-hidden />
              </div>
              <h3 className="mb-3 text-lg font-bold">Proposal Chase</h3>
              <p className="mb-6 text-sm leading-relaxed text-[#6B7280]">
                Systematically handles objections and silence after pricing is sent. Keeps you top
                of mind during decision time.
              </p>
              <ul className="mb-6 space-y-2 font-mono text-xs text-[#6B7280]">
                {[
                  `Day 2: "Any questions?"`,
                  "Day 5: Case study",
                  "Day 9: Closing loop",
                ].map((li) => (
                  <li key={li} className="flex items-center">
                    <Check className="mr-2 h-2.5 w-2.5 shrink-0 text-[#2563EB]" aria-hidden />
                    {li}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <Mail className="mr-1 inline h-3 w-3" aria-hidden />
                  Email
                </span>
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <MessageSquareText className="mr-1 inline h-3 w-3" aria-hidden />
                  SMS
                </span>
                <span className="rounded border border-[#E5E7EB] bg-gray-50 px-2 py-1 text-[10px]">
                  <WhatsIcon className="mr-1 inline h-3 w-3 text-[#2563EB]" aria-hidden />
                  WhatsApp
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="grid items-center gap-16 md:grid-cols-2">
            <div className="order-2 md:order-1">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center space-x-2 border-b border-[#E5E7EB] pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                </div>
                <div className="space-y-3 font-mono text-xs text-[#6B7280]">
                  <div className="flex">
                    <span className="w-24 text-blue-600">input:</span>
                    <span>call_transcript_v4.txt</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-blue-600">context:</span>
                    <span>client mentioned &quot;budget freeze until Q3&quot;</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-blue-600">action:</span>
                    <span>trigger_flow(&quot;objection_budget_q3&quot;)</span>
                  </div>
                  <div className="flex">
                    <span className="w-24 text-blue-600">output:</span>
                    <span>generating personalized email...</span>
                  </div>
                  <div className="mt-4 rounded border border-[#E5E7EB] bg-gray-50 p-3 text-[#1F2937]">
                    &quot;Hey John, totally get the freeze. Since we discussed launching in Oct, should we
                    sign the scope now to lock in dev resources?&quot;
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <span className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                Our Philosophy
              </span>
              <h2 className="mb-6 text-3xl font-bold tracking-tight text-[#111111]">
                Not Another CRM
              </h2>
              <p className="mb-8 text-[#6B7280]">Most tools are databases. We are an active agent.</p>

              <ul className="space-y-4">
                {[
                  "Uses real call context, not generic templates",
                  "Built specifically for post-call follow-up",
                  "VA-ready execution + logging",
                  "Works with Google Sheets (Lightweight by design)",
                ].map((t) => (
                  <li key={t} className="flex items-start">
                    <Check className="mr-3 mt-1 h-4 w-4 shrink-0 text-[#2563EB]" aria-hidden />
                    <span className="font-medium text-[#1F2937]">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="get-started" className="py-20 md:py-28">
        <div className="mx-auto max-w-[1040px] px-6">
          <div
            className={`mx-auto max-w-4xl rounded-2xl border border-[#E5E7EB] bg-white p-8 ring-1 ring-[#111111]/5 md:p-12 ${shadowCard}`}
          >
            <div className="flex flex-col gap-12 md:flex-row">
              <div className="md:w-1/2">
                <h2 className="mb-4 text-3xl font-bold tracking-tight text-[#111111]">
                  Setup: fast, small, measurable
                </h2>
                <p className="mb-8 text-[#6B7280]">
                  We install the system, run it for 30 days, and prove the ROI before you commit to
                  anything long-term.
                </p>

                <div className="mb-8 rounded-lg border border-[#E5E7EB] bg-gray-50 p-4 text-sm text-[#6B7280]">
                  <span className="mb-2 block font-bold text-[#111111]">Risk Reversal:</span>
                  If you don&apos;t see measurable lift in replies or booked next steps in 30 days, we
                  pause — you don&apos;t continue.
                </div>

                <Link
                  to="/auth/signin"
                  className="group inline-flex w-full items-center justify-center rounded-[12px] px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95 md:w-auto"
                  style={{ backgroundColor: accent }}
                >
                  Book a 15-min walkthrough
                  <ArrowRight className="ml-2 h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <div className="border-t border-[#E5E7EB] pt-8 md:w-1/2 md:border-l md:border-t-0 md:pl-12 md:pt-0">
                <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-[#1F2937]">
                  What&apos;s Included
                </h3>
                <ul className="space-y-4">
                  {[
                    "Setup in 7 days",
                    "Run for 30 days",
                    "Done-for-you follow-up flows + templates",
                    "Weekly report: replies, bookings, recovered deals",
                    "Weekly optimization (subject lines, CTAs, timing)",
                  ].map((t) => (
                    <li key={t} className="flex items-center text-sm text-[#1F2937]">
                      <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-600">
                        <Check className="h-3 w-3" aria-hidden />
                      </div>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E5E7EB] bg-white py-16">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="flex flex-col items-start justify-between md:flex-row md:items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="mb-2 text-lg font-bold text-[#111111]">Ideal Profile</h3>
              <p className="text-sm text-[#6B7280]">Best fit for agencies that match this criteria.</p>
            </div>

            <div className="flex flex-wrap gap-4">
              {["Dev / AI Agencies", "10-40 Sales Calls/Mo", "$5k - $50k Deal Size", "Founder-Led Sales"].map(
                (t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-[#E5E7EB] bg-gray-50 px-4 py-2 text-sm font-medium text-[#1F2937]"
                  >
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-800 bg-[#111111] pb-12 pt-20 text-white">
        <div className="mx-auto max-w-[1040px] px-6">
          <div className="mb-16 flex flex-col items-center justify-between md:flex-row">
            <div className="mb-8 text-center md:mb-0 md:text-left">
              <h2 className="mb-2 text-2xl font-bold tracking-tight">Stop losing deals to silence.</h2>
              <p className="text-gray-400">Automate the follow-up. Close more deals.</p>
            </div>
            <Link
              to="/auth/signin"
              className="group flex items-center rounded-[12px] px-6 py-3 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
              style={{ backgroundColor: accent }}
            >
              Book a 15-min walkthrough
              <ArrowRight className="ml-2 h-4 w-4 opacity-80 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-gray-800 pt-8 text-sm text-gray-500 md:flex-row">
            <div className="mb-4 flex items-center gap-2 md:mb-0">
              <span className="flex items-center justify-center rounded-md bg-white p-1 shadow-sm">
                {/* <Logo className="h-6 w-6 shrink-0 object-contain" /> */}
                <LandingBrandMark></LandingBrandMark>
              </span>
              <span className="font-semibold text-white">TouchBase.ai</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
            
          </div>
        </div>
      </footer>
    </div>
  );
}
