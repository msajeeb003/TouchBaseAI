import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
  RETELL_API_KEYS_OVERVIEW_URL,
  RETELL_DOCS_HOME_URL,
  RETELL_MANAGE_API_KEYS_URL,
  RETELL_WEB_URL,
} from "@/constants/docs/retellAiCallingLinks";

const outbound = { target: "_blank", rel: "noopener noreferrer" } as const;

function DocLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      {...outbound}
      className="inline-flex items-center gap-1 font-medium text-indigo-600 underline-offset-2 hover:text-indigo-700 hover:underline"
    >
      {children}
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
    </a>
  );
}

export default function RetellAiCallingDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
          <BookOpen className="h-4 w-4" aria-hidden />
          Settings · Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Retell AI calling — connecting your workspace
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This app uses Retell&apos;s outbound voice APIs. You provide an API key, the agent that answers the calls,
          and an outbound caller number. Exact labels in Retell&apos;s dashboard can change — use Retell&apos;s docs
          if something looks different.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <strong className="font-semibold">Security.</strong> Do not paste your Retell API key into chat or email.
        Store it only in Settings here.
      </div>

      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Retell API key</h2>
        <ol className="list-inside list-decimal space-y-3 text-sm leading-relaxed text-slate-700">
          <li>
            Sign in to Retell:&nbsp;
            <DocLink href={RETELL_WEB_URL}>retellai.com</DocLink>, then open the Retell&nbsp;
            <strong className="font-medium text-slate-900">dashboard</strong> (log in from the site menu if needed).
          </li>
          <li>
            Open&nbsp;
            <strong className="font-medium text-slate-900">Settings</strong> (or workspace settings) and locate the&nbsp;
            <strong className="font-medium text-slate-900">API Keys</strong> section described in Retell&apos;s help.
          </li>
          <li>
            Use&nbsp;<strong className="font-medium text-slate-900">Add</strong> to create a key, give it a name, then copy
            it — you typically see the full secret only once.
          </li>
          <li>
            Paste it into&nbsp;
            <strong className="font-medium text-slate-900">Settings → AI Calling (Retell) → Retell API Key</strong>.
          </li>
        </ol>
        <ul className="list-inside list-disc space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-700">
          <li>
            <DocLink href={RETELL_MANAGE_API_KEYS_URL}>Manage API keys</DocLink>
            &nbsp;(official steps from Retell)
          </li>
          <li>
            <DocLink href={RETELL_API_KEYS_OVERVIEW_URL}>API key overview</DocLink>
            &nbsp;(what keys are used for)
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Retell Agent ID</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          This is the ID of the <strong className="font-medium text-slate-900">voice agent</strong> Retell runs when
          your sequences place a call. In the Retell dashboard, open{" "}
          <strong className="font-medium text-slate-900">Agents</strong>, select the agent you want, and copy its
          identifier — it often starts with{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">agent_</code>.
        </p>
        <p className="text-sm text-slate-600">
          If you cannot find it, search &quot;agent&quot; in&nbsp;
          <DocLink href={RETELL_DOCS_HOME_URL}>Retell docs</DocLink>.
        </p>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Retell Caller number</h2>
        <p className="text-sm leading-relaxed text-slate-600">
          Enter the phone number Retell uses for{" "}
          <strong className="font-medium text-slate-900">outbound caller ID</strong>, in{" "}
          <strong className="font-medium text-slate-900">E.164</strong> format (for example{" "}
          <code className="rounded bg-slate-100 px-1 text-xs">+14155552671</code>). This must match numbers you have
          set up or purchased in Retell.
        </p>
        <p className="text-sm text-slate-600">
          For provisioning and verification, follow Retell&apos;s dashboard or documentation. Search{" "}
          &quot;phone&quot; in <DocLink href={RETELL_DOCS_HOME_URL}>Retell docs</DocLink>.
        </p>
      </section>

      <p className="text-xs text-slate-500">
        Retell owns API behavior, pricing, and compliance. Confirm numbers and dialing rules match your workspace and
        local regulations before going live.
      </p>
    </div>
  );
}
