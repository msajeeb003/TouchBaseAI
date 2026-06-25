export interface CallItem {
  id: string;
  retellCallId: string;
  callStatus: string;
  duration: number | null;
  recordingUrl: string | null;
  transcript: string | null;
  disconnectionReason: string | null;
  fromNumber: string | null;
  toNumber: string | null;
  createdAt: string;
  sequenceName: string | null;
  leadName: string | null;
  leadEmail: string | null;
}

export interface GetCallsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: CallItem[];
}

export interface MessageItem {
  id: string;
  stepType: string; // EMAIL | SMS | WHATSAPP
  subject: string | null;
  content: string | null;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  externalMessageId: string | null;
  sequenceName: string;
  leadName: string;
  leadEmail: string | null;
  leadPhone: string | null;
}

export interface GetMessagesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: MessageItem[];
}
