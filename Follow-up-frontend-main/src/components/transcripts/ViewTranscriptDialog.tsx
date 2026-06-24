import { useMemo, useState, type ReactNode } from "react";
import { Copy, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLazyGetMeetingTranscriptQuery } from "@/store/features/transcripts/transcriptsApi";

interface ViewTranscriptDialogProps {
  recordingId: number;
  meetingTitle: string;
  trigger: ReactNode;
}

const colorPalettes = [
  "bg-indigo-100 text-indigo-700",
  "bg-emerald-100 text-emerald-700",
  "bg-violet-100 text-violet-700",
  "bg-orange-100 text-orange-700",
  "bg-sky-100 text-sky-700",
];

const getSpeakerInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

const getSpeakerColor = (name: string) => {
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colorPalettes[hash % colorPalettes.length];
};

export default function ViewTranscriptDialog({
  recordingId,
  meetingTitle,
  trigger,
}: ViewTranscriptDialogProps) {
  const [open, setOpen] = useState(false);
  const [fetchTranscript, { data, isFetching, isError }] = useLazyGetMeetingTranscriptQuery();
  const [isCopied, setIsCopied] = useState(false);

  const lines = useMemo(() => data?.data.transcript ?? [], [data]);
  const summary = useMemo(() => `${lines.length} messages`, [lines.length]);

  const transcriptText = useMemo(() => {
    return lines
      .map((item) => {
        const speakerName = item.speaker.display_name || "Unknown Speaker";
        return `${speakerName} (${item.timestamp}): ${item.text}`;
      })
      .join("\n");
  }, [lines]);

  const copyToClipboard = async (text: string) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback for environments where `navigator.clipboard` is not available/allowed.
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.left = "-1000px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    setIsCopied(true);
    window.setTimeout(() => setIsCopied(false), 1500);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      fetchTranscript(recordingId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-4xl p-0 sm:w-full">
        <DialogHeader className="border-b px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-left">{meetingTitle}</DialogTitle>
              <p className="text-xs text-slate-500">{summary}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void copyToClipboard(transcriptText)}
              disabled={lines.length === 0}
              className="mr-8"
            >
              <Copy className="h-4 w-4" />
              {isCopied ? "Copied" : "Copy"}
            </Button>
          </div>
        </DialogHeader>

        <div className="max-h-[72vh] overflow-y-auto px-4 py-4 sm:px-6">
          {isFetching ? (
            <p className="text-sm text-slate-500">Loading transcript...</p>
          ) : isError ? (
            <p className="text-sm text-red-600">Failed to load transcript.</p>
          ) : lines.length === 0 ? (
            <div className="rounded-md border border-dashed p-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                <MessageSquareText className="h-4 w-4 text-slate-500" />
              </div>
              <p className="text-sm text-slate-600">No transcript lines found for this meeting.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lines.map((item, index) => {
                const speakerName = item.speaker.display_name || "Unknown Speaker";
                const avatarClass = getSpeakerColor(speakerName);

                return (
                  <div key={`${item.timestamp}-${index}`} className="flex items-start gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarClass}`}
                    >
                      {getSpeakerInitials(speakerName)}
                    </div>

                    <div className="min-w-0 rounded-lg border bg-white px-3 py-2 shadow-sm">
                      <div className="mb-1 flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">{speakerName}</p>
                        <span className="text-xs text-slate-500">{item.timestamp}</span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
