import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const docLinks: { to: string; title: string; description: string }[] = [
  {
    to: "/docs/ai-credentials",
    title: "AI provider credentials",
    description: "OpenAI, Gemini, and Claude keys, models, and official documentation.",
  },
  {
    to: "/docs/fathom-transcripts",
    title: "Fathom call transcripts",
    description: "How to get your Fathom API key and connect transcripts.",
  },
  {
    to: "/docs/retell-ai-calling",
    title: "Retell AI calling",
    description: "API key, agent ID, and caller number for voice sequences.",
  },
  {
    to: "/docs/email-smtp",
    title: "Email (SMTP)",
    description: "SMTP fields, ports, common providers (Google & Microsoft).",
  },
  {
    to: "/docs/sms-settings",
    title: "SMS settings",
    description: "TextMagic and Twilio setup for SMS and WhatsApp.",
  },
];

const cardClass =
  "block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200 hover:bg-indigo-50/40";

export default function DocsIndexPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <p className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600">
          <BookOpen className="h-4 w-4" aria-hidden />
          Help
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Documentation</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Guides for configuring integrations in&nbsp;
          <Link to="/dashboard/settings" className="font-medium text-indigo-600 hover:underline">
            Settings
          </Link>
          . Choose a topic below.
        </p>
      </div>

      <nav aria-label="Documentation topics">
        <ul className="grid gap-3 sm:grid-cols-1">
          {docLinks.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className={cn(cardClass)}>
                <span className="font-medium text-slate-900">{item.title}</span>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
