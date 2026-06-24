import AppError from "../../shared/errors/AppError";
import { SettingsService } from "../settings/settings.service";
import { FATHOM_BASE_URL, FATHOM_ERRORS } from "./fathom.constant";

const getFathomApiKey = async (userId: string): Promise<string> => {
  const apiKey = await SettingsService.getDecryptedField(
    userId,
    "fathomApiKey"
  );

  if (!apiKey) {
    throw new AppError(400, FATHOM_ERRORS.NO_API_KEY);
  }

  return apiKey;
};

const fathomFetch = async (
  apiKey: string,
  path: string,
  queryParams?: Record<string, string>
) => {
  const url = new URL(`${FATHOM_BASE_URL}${path}`);

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value) url.searchParams.append(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: { "X-Api-Key": apiKey },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new AppError(401, FATHOM_ERRORS.INVALID_API_KEY);
    }
    if (response.status === 429) {
      throw new AppError(429, FATHOM_ERRORS.RATE_LIMITED);
    }
    throw new AppError(response.status, FATHOM_ERRORS.FATHOM_ERROR);
  }

  return response.json();
};

type MeetingsQuery = {
  cursor?: string;
  include_summary?: string;
  include_transcript?: string;
  include_action_items?: string;
};

type FathomMeetingsPage = {
  items: unknown[];
  limit: number | null;
  next_cursor: string | null;
};

type MeetingsListResult = {
  items: unknown[];
  limit: number | null;
  next_cursor: string | null;
  hasMore: boolean;
};

/** Fathom pages fetched per request (~10 meetings/page → ~30 per load). */
const MAX_PAGES = 10;

const getMeetings = async (
  userId: string,
  query: MeetingsQuery
): Promise<MeetingsListResult> => {
  const apiKey = await getFathomApiKey(userId);
  const { cursor: startCursor, ...filters } = query;

  const items: unknown[] = [];
  let cursor: string | undefined = startCursor;
  let limit: number | null = null;
  let next_cursor: string | null = null;

  for (let page = 0; page < MAX_PAGES; page++) {
    const params: Record<string, string> = {
      ...(filters as Record<string, string>),
    };
    if (cursor) params.cursor = cursor;

    const data = (await fathomFetch(
      apiKey,
      "/meetings",
      params
    )) as FathomMeetingsPage;

    items.push(...(data.items || []));
    limit = items.length;
    // limit = data.limit ?? limit;
    next_cursor = data.next_cursor;

    if (!data.next_cursor) break;
    cursor = data.next_cursor;
  }

  return {
    items,
    limit,
    next_cursor,
    hasMore: !!next_cursor,
  };
};

const getTranscript = async (userId: string, recordingId: string) => {
  const apiKey = await getFathomApiKey(userId);

  return fathomFetch(apiKey, `/recordings/${recordingId}/transcript`);
};

const getSummary = async (userId: string, recordingId: string) => {
  const apiKey = await getFathomApiKey(userId);

  return fathomFetch(apiKey, `/recordings/${recordingId}/summary`);
};

export const FathomService = {
  getMeetings,
  getTranscript,
  getSummary,
};
