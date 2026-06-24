export const STEP_TYPE = {
  EMAIL: "EMAIL",
  SMS: "SMS",
  WHATSAPP: "WHATSAPP",
  CALL: "CALL",
} as const;

export type StepType = (typeof STEP_TYPE)[keyof typeof STEP_TYPE];

export const STEP_TYPE_LIST = Object.values(STEP_TYPE) as StepType[];
