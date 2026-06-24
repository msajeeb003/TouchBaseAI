export interface MeetingInvitee {
  name: string;
  email: string;
  email_domain: string;
  is_external: boolean;
  matched_speaker_display_name: string | null;
}

export interface MeetingRecordedBy {
  name: string;
  email: string;
  email_domain: string;
  team: string | null;
}

export interface FathomMeetingItem {
  title: string;
  meeting_title: string;
  url: string;
  created_at: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  recording_id: number;
  recording_start_time: string | null;
  recording_end_time: string | null;
  calendar_invitees_domains_type: string | null;
  transcript: string | null;
  transcript_language: string | null;
  default_summary: string | null;
  action_items: string | null;
  calendar_invitees: MeetingInvitee[];
  recorded_by: MeetingRecordedBy | null;
  share_url: string | null;
  crm_matches: unknown;
}

export interface GetFathomMeetingsData {
  items: FathomMeetingItem[];
  limit: number;
  next_cursor: string;
  hasMore: boolean;
}

export interface GetFathomMeetingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: GetFathomMeetingsData;
}

export interface MeetingTranscriptSpeaker {
  display_name: string;
  matched_calendar_invitee_email: string | null;
}

export interface MeetingTranscriptLine {
  speaker: MeetingTranscriptSpeaker;
  text: string;
  timestamp: string;
}

export interface GetMeetingTranscriptData {
  transcript: MeetingTranscriptLine[];
}

export interface GetMeetingTranscriptResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: GetMeetingTranscriptData;
}

export interface LeadTranscriptItem {
  id: string;
  userId?: string;
  leadId?: string;
  source: string;
  fathomRecordingId: number;
  meetingTitle: string;
  meetingDate: string;
  transcript: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportLeadTranscriptFromFathomRequestBody {
  recordingId: number;
  meetingTitle: string;
  meetingDate: string;
}

export interface ImportLeadTranscriptFromFathomResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadTranscriptItem;
}

export interface GetLeadTranscriptsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: LeadTranscriptItem[];
}

export interface DeleteLeadTranscriptResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}
