import type { StepType } from "@/constants/stepType";

export interface PromptTemplateItem {
  id: string;
  name: string;
  followUpStage: string;
  promptText: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetPromptTemplatesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem[];
}

export interface CreatePromptTemplateRequestBody {
  name: string;
  followUpStage: string;
  promptText: string;
}

export interface CreatePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface GetPromptTemplateByIdResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface UpdatePromptTemplateRequestBody {
  name: string;
  followUpStage: string;
  promptText: string;
}

export interface UpdatePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: PromptTemplateItem;
}

export interface DeletePromptTemplateResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: null;
}

export interface GeneratePromptTextRequestBody {
  followUpScenario: string;
  serviceDescription: string;
  sequenceGoal: string;
  senderName: string;
  ctaLink?: string;
  companyName?: string;
  stepTypesPattern: StepType[];
  intervalDays: number;
  toneStyle: string;
  additionalNotes?: string;
}

export interface GeneratePromptTextResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    promptText: string;
  };
}
