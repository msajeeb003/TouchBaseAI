import { CalendarDays, ExternalLink, Eye, FileText, Loader2, Mic, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useGetFathomMeetingsQuery,
  useLazyGetFathomMeetingsQuery,
} from "@/store/features/transcripts/transcriptsApi";
import ViewTranscriptDialog from "@/components/transcripts/ViewTranscriptDialog";

const formatDateTime = (value: string | null | undefined) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleString();
};

const getDurationText = (start: string | null | undefined, end: string | null | undefined) => {
  if (!start || !end) return "N/A";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms <= 0) return "N/A";

  const totalMinutes = Math.round(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export default function TranscriptsPage() {
  const { data, isLoading, isError } = useGetFathomMeetingsQuery();
  const [fetchMoreMeetings, { isFetching: isLoadingMore }] = useLazyGetFathomMeetingsQuery();

  const meetings = data?.data.items ?? [];
  const hasMore = Boolean(data?.data.hasMore && data.data.next_cursor);
  const nextCursor = data?.data.next_cursor ?? "";

  const handleLoadMore = () => {
    if (!hasMore || !nextCursor || isLoadingMore) return;
    fetchMoreMeetings(nextCursor);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          <span>Loading meetings...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-dashed border-red-200 bg-red-50 p-8 text-center text-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <FileText className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-semibold text-red-900">Invalid Fathom API key.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-red-500">
          Invalid Fathom API key. Please check your Settings.
        </p>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/40 px-6 py-14 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
          <FileText className="h-5 w-5 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-900">No meetings found.</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
          Connect your settings and sync with Fathom to view transcript-ready meetings here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-3xl font-semibold text-slate-900">
          Transcripts <span className="text-xl font-medium text-slate-400">({meetings.length})</span>
        </h2>
        <p className="mt-1 text-sm text-slate-500">Latest meetings from Fathom integration.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {meetings.map((meeting) => {
          const host = meeting.recorded_by?.name || meeting.calendar_invitees[0]?.name || "Unknown";
          const attendeesCount = meeting.calendar_invitees?.length ?? 0;

          return (
            <div key={meeting.recording_id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {meeting.meeting_title || meeting.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">Recording ID: {meeting.recording_id}</p>
                </div>
              </div>

              <div className="flex flex-col space-y-2 text-sm text-slate-600">
                <p className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-400" />
                  {formatDateTime(meeting.scheduled_start_time)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <Mic className="h-4 w-4 text-slate-400" />
                  Recording duration:{" "}
                  {getDurationText(meeting.recording_start_time, meeting.recording_end_time)}
                </p>
                <p className="inline-flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  Host: {host} | Invitees: {attendeesCount}
                </p>
              </div>

              <div className="mt-4 flex flex-row items-center gap-2 border-t pt-4">
                <ViewTranscriptDialog
                  recordingId={meeting.recording_id}
                  meetingTitle={meeting.meeting_title || meeting.title}
                  trigger={
                    <Button size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
                      Transcript <Eye className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  }
                />

                {meeting.share_url ? (
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <a href={meeting.share_url} target="_blank" rel="noreferrer">
                      Open
                      <ExternalLink className="ml-1 h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="outline"
            className="min-w-[200px] border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load more meetings"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
