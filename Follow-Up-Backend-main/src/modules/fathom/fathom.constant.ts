export const FATHOM_BASE_URL = "https://api.fathom.ai/external/v1";

export const FATHOM_ERRORS = {
  NO_API_KEY: "Fathom API key not configured. Please add it in Settings.",
  INVALID_API_KEY: "Invalid Fathom API key. Please check your Settings.",
  RATE_LIMITED: "Fathom API rate limit exceeded. Please try again later.",
  FATHOM_ERROR: "Failed to fetch data from Fathom.",
} as const;
