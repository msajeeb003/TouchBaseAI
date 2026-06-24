import { BookOpen, ExternalLink } from "lucide-react";
import type { ReactNode } from "react";
import {
  ANTHROPIC_CONSOLE_HOME_URL,
  ANTHROPIC_MAIN_DOCS_URL,
  ANTHROPIC_MODELS_DOCS_URL,
  GEMINI_API_DOCS_HUB_URL,
  GEMINI_MODELS_DOCS_URL,
  GOOGLE_AI_STUDIO_KEYS_URL,
  OPENAI_ACCOUNT_API_KEYS_URL,
  OPENAI_DOCS_HUB_URL,
  OPENAI_MODELS_DOCS_URL,
} from "@/constants/docs/aiCredentialsLinks";

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

export default function AiCredentialsDocsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
          <BookOpen className="h-4 w-4" aria-hidden />
          Settings · Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          AI provider credentials
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Use this page to find official documentation and consoles for each provider. Model names, pricing,
          regions, and direct links change often — always rely on each vendor&apos;s current docs for the truth.
        </p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
        <strong className="font-semibold">Security.</strong> Never share API keys in chat or screenshots.
        Paste keys only into this app&apos;s Settings form. Stored values are handled according to our backend policy.
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">OpenAI</h2>
        <p className="text-sm text-slate-600">
          Compatible with GPT-family models referenced in Settings (e.g. <code className="rounded bg-slate-100 px-1 text-xs">gpt-4o-mini</code> — confirm the exact identifier in current docs).
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>
            Documentation hub:&nbsp;
            <DocLink href={OPENAI_DOCS_HUB_URL}>OpenAI Platform docs overview</DocLink>
          </li>
          <li>
            API keys (account dashboard):&nbsp;
            <DocLink href={OPENAI_ACCOUNT_API_KEYS_URL}>Manage API keys</DocLink>
          </li>
          <li>
            Models reference (names change with releases):&nbsp;
            <DocLink href={OPENAI_MODELS_DOCS_URL}>Models documentation</DocLink>
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Google · Gemini API</h2>
        <p className="text-sm text-slate-600">
          Gemini model IDs (for example&nbsp;
          <code className="rounded bg-slate-100 px-1 text-xs">gemini-2.0-flash</code>) update — check the Gemini API docs for naming and quotas.
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>
            Main API documentation:&nbsp;
            <DocLink href={GEMINI_API_DOCS_HUB_URL}>Gemini API docs</DocLink>
          </li>
          <li>
            Create or manage keys (Google AI Studio):&nbsp;
            <DocLink href={GOOGLE_AI_STUDIO_KEYS_URL}>Google AI Studio · API keys</DocLink>
          </li>
          <li>
            Model list (IDs, versions, deprecations):&nbsp;
            <DocLink href={GEMINI_MODELS_DOCS_URL}>Gemini models</DocLink>
          </li>
        </ul>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Anthropic · Claude</h2>
        <p className="text-sm text-slate-600">
          Claude model names and API versioning are documented centrally. Prefer the anthropic docs for model strings and deprecation notices.
        </p>
        <ul className="list-inside list-disc space-y-2 text-sm text-slate-700">
          <li>
            Documentation:&nbsp;
            <DocLink href={ANTHROPIC_MAIN_DOCS_URL}>Anthropic documentation</DocLink>
          </li>
          <li>
            Console (account, keys, workspace):&nbsp;
            <DocLink href={ANTHROPIC_CONSOLE_HOME_URL}>Anthropic Console</DocLink>
          </li>
          <li>
            Model list (API IDs, comparisons, deprecations):&nbsp;
            <DocLink href={ANTHROPIC_MODELS_DOCS_URL}>Claude models overview</DocLink>
          </li>
        </ul>
      </section>

      <p className="text-xs text-slate-500">
        If a link returns 404 or redirects, open the provider&apos;s main documentation site from your browser and use their search — we refresh these entry points when we can, but vendors change URLs without notice.
      </p>
    </div>
  );
}
