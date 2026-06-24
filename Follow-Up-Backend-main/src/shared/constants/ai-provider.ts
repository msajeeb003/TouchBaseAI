export const AI_PROVIDER = {
  OPENAI: "openai",
  GEMINI: "gemini",
  CLAUDE: "claude",
} as const;

export type AIProvider = (typeof AI_PROVIDER)[keyof typeof AI_PROVIDER];

export const AI_PROVIDER_LIST = Object.values(AI_PROVIDER) as AIProvider[];

export const DEFAULT_AI_MODELS: Record<AIProvider, string> = {
  [AI_PROVIDER.OPENAI]: "gpt-4o-mini",
  [AI_PROVIDER.GEMINI]: "gemini-2.0-flash",
  [AI_PROVIDER.CLAUDE]: "claude-sonnet-4-20250514",
};
