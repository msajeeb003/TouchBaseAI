import type { StepType } from "@/constants/stepType";

export type SequenceStatus = "draft" | "active" | "paused" | "completed" | "cancelled";

/** Retell call record attached to a sequence step when stepType is CALL. */
export interface SequenceStepCallLog {
  id: string;
  stepId: string;
  userId: string;
  retellCallId: string;
  callStatus: string;
  duration: number;
  recordingUrl: string | null;
  transcript: string | null;
  disconnectionReason: string | null;
  fromNumber: string;
  toNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface SequenceLeadInfo {
  name: string;
  email: string;
  company: string;
  followUpStage: string;
}

export interface SequencePromptTemplateInfo {
  id: string;
  name: string;
  followUpStage: string;
}

export interface SequenceCountInfo {
  steps: number;
  emailSteps: number;
  smsSteps: number;
  whatsappSteps: number;
  callSteps: number;
  emailSent: number;
  smsSent: number;
  whatsappSent: number;
  callSent: number;
}

export interface SequenceItem {
  id: string;
  userId: string;
  leadId: string;
  promptTemplateId: string | null;
  name: string;
  totalSteps: number;
  status: SequenceStatus;
  situation?: string | null;
  goal?: string | null;
  tone?: string | null;
  intensity?: string | null;
  channels?: string[];
  intervalDays?: number | null;
  createdAt: string;
  updatedAt: string;
  lead: SequenceLeadInfo;
  promptTemplate: SequencePromptTemplateInfo | null;
  _count?: SequenceCountInfo;
}

export interface SequenceStepItem {
  id: string;
  sequenceId: string;
  stepOrder: number;
  stepType: StepType;
  subject: string | null;
  content: string | null;
  status: string;
  scheduledAt: string;
  sentAt: string | null;
  sendLog: string | null;
  externalMessageId: string | null;
  callLog: SequenceStepCallLog | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetSequencesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem[];
}

export interface CreateSequenceRequestBody {
  leadId: string;
  name: string;
  totalSteps: number;
  promptTemplateId?: string;
  /** Configurator inputs from the "Create Follow-up Sequence" UI. */
  situation?: string;
  goal?: string;
  tone?: string;
  intensity?: string;
  channels?: StepType[];
  intervalDays?: number;
}

export interface CreateSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem;
}

export interface GetSingleSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem & {
    steps: SequenceStepItem[];
  };
}

export interface UpdateSequenceRequestBody {
  leadId?: string;
  name?: string;
  totalSteps?: number;
  promptTemplateId?: string;
  status?: SequenceStatus;
}

export interface UpdateSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceItem;
}

export interface DeleteSequenceResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface GetSequenceStepsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem[];
}

export interface CreateSequenceStepRequestBody {
  stepOrder: number;
  stepType: StepType;
  scheduledAt: string;
}

export interface CreateSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}

export interface DeleteSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface DeleteAllSequenceStepsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    deletedCount: number;
  };
}

export interface GenerateSequenceStepContentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}

export interface SequenceGenerationStepResult {
  stepOrder: number;
  status: string;
}

/** Shape returned by POST /sequences/:id/generate-steps (lead may omit optional list fields). */
export interface GenerateSequenceStepsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    sequence: Omit<SequenceItem, "lead" | "_count"> & {
      lead: Pick<SequenceLeadInfo, "name" | "email" | "followUpStage"> &
        Partial<Pick<SequenceLeadInfo, "company">>;
      promptTemplate: SequencePromptTemplateInfo;
      steps: SequenceStepItem[];
    };
    generationResults: SequenceGenerationStepResult[];
  };
}

export interface RegenerateAllStepContentResult {
  stepOrder: number;
  status: string;
}

/** POST /sequences/:id/steps/regenerate-all — refreshes AI content on existing steps only. */
export interface RegenerateAllStepContentResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    steps: SequenceStepItem[];
    results: RegenerateAllStepContentResult[];
  };
}

export interface UpdateSequenceStepRequestBody {
  subject?: string | null;
  content?: string | null;
  scheduledAt?: string;
}

export interface UpdateSequenceStepResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: SequenceStepItem;
}
