export const SEQUENCE_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  PAUSED: "paused",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type SequenceStatus =
  (typeof SEQUENCE_STATUS)[keyof typeof SEQUENCE_STATUS];

export const SEQUENCE_STATUS_LIST = Object.values(
  SEQUENCE_STATUS
) as SequenceStatus[];
