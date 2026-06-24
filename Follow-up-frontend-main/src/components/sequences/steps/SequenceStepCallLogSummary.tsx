import { ExternalLink, Mic, PhoneCall } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { SequenceStepCallLog } from "@/types/sequences";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const humanizeToken = (value: string) =>
  value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

const formatCallDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  if (seconds < 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${`${s}`.padStart(2, "0")} (${seconds} seconds)`;
};

interface SequenceStepCallLogSummaryProps {
  log: SequenceStepCallLog;
}

export function SequenceStepCallLogSummary({ log }: SequenceStepCallLogSummaryProps) {
  const statusLabel = humanizeToken(log.callStatus || "unknown");
  const reasonLabel = log.disconnectionReason ? humanizeToken(log.disconnectionReason) : null;
  const showReason =
    reasonLabel &&
    log.disconnectionReason &&
    log.disconnectionReason.toLowerCase() !== log.callStatus.toLowerCase();

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 shadow-sm lg:col-span-2">
      <Accordion
        type="multiple"
        defaultValue={["call-details"]}
        className="w-full"
      >
        <AccordionItem
          value="call-details"
          className={log.transcript ? "border-slate-100" : "border-slate-100 border-b-0"}
        >
          <AccordionTrigger className="py-3.5 hover:no-underline">
            <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <PhoneCall className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              Call details
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-4">
            <dl className="grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-0.5 text-slate-800">{statusLabel}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Duration
                </dt>
                <dd className="mt-0.5 text-slate-800">{formatCallDuration(log.duration)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  From
                </dt>
                <dd className="mt-0.5 font-mono text-slate-800">{log.fromNumber || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">To</dt>
                <dd className="mt-0.5 font-mono text-slate-800">{log.toNumber || "—"}</dd>
              </div>
              {showReason ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Disconnection
                  </dt>
                  <dd className="mt-0.5 text-slate-800">{reasonLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Completed
                </dt>
                <dd className="mt-0.5 text-slate-800">{formatDateTime(log.createdAt)}</dd>
              </div>
            </dl>

            {log.recordingUrl ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  Recording
                </p>
                <a
                  href={log.recordingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 underline-offset-4 hover:text-indigo-700 hover:underline"
                >
                  <Mic className="h-4 w-4 shrink-0" aria-hidden />
                  Open recording
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" aria-hidden />
                </a>
              </div>
            ) : null}
          </AccordionContent>
        </AccordionItem>

        {log.transcript ? (
          <AccordionItem value="transcript" className="border-slate-100 border-b-0">
            <AccordionTrigger className="py-3.5 hover:no-underline">
              <span className="text-sm font-semibold text-slate-900">Transcript</span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-sm leading-relaxed text-slate-800 whitespace-pre-wrap">
                {log.transcript}
              </div>
            </AccordionContent>
          </AccordionItem>
        ) : null}
      </Accordion>
    </div>
  );
}
