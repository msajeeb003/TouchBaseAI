import { baseApi } from "@/store/api/baseApi";
import type {
  DeleteLeadTranscriptResponse,
  GetFathomMeetingsResponse,
  GetLeadTranscriptsResponse,
  GetMeetingTranscriptResponse,
  ImportLeadTranscriptFromFathomRequestBody,
  ImportLeadTranscriptFromFathomResponse,
} from "@/types/transcripts";

export const transcriptsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFathomMeetings: builder.query<GetFathomMeetingsResponse, string | void>({
      query: (cursor) => ({
        url: "/fathom/meetings",
        method: "GET",
        ...(cursor ? { params: { cursor } } : {}),
      }),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCacheData, responseData, { arg }) => {
        if (!arg) {
          return responseData;
        }
        if (!currentCacheData) {
          return responseData;
        }
        const seen = new Set(currentCacheData.data.items.map((i) => i.recording_id));
        const newItems = responseData.data.items.filter((i) => !seen.has(i.recording_id));
        return {
          ...responseData,
          data: {
            ...responseData.data,
            items: [...currentCacheData.data.items, ...newItems],
          },
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
      providesTags: ["FathomMeetings"],
    }),
    getMeetingTranscript: builder.query<GetMeetingTranscriptResponse, number>({
      query: (recordingId) => ({
        url: `/fathom/meetings/${recordingId}/transcript`,
        method: "GET",
      }),
      providesTags: (_result, _error, recordingId) => [{ type: "MeetingTranscript", id: recordingId }],
    }),
    getLeadTranscripts: builder.query<GetLeadTranscriptsResponse, string>({
      query: (leadId) => ({
        url: `/leads/${leadId}/transcripts`,
        method: "GET",
      }),
      providesTags: (_result, _error, leadId) => [{ type: "LeadTranscripts", id: leadId }],
    }),
    importLeadTranscriptFromFathom: builder.mutation<
      ImportLeadTranscriptFromFathomResponse,
      { leadId: string; body: ImportLeadTranscriptFromFathomRequestBody }
    >({
      query: ({ leadId, body }) => ({
        url: `/leads/${leadId}/transcripts/from-fathom`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { leadId }) => [
        { type: "LeadTranscripts", id: leadId },
        "Dashboard",
      ],
    }),
    deleteLeadTranscript: builder.mutation<
      DeleteLeadTranscriptResponse,
      { leadId: string; transcriptId: string }
    >({
      query: ({ leadId, transcriptId }) => ({
        url: `/leads/${leadId}/transcripts/${transcriptId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { leadId }) => [
        { type: "LeadTranscripts", id: leadId },
        "Dashboard",
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFathomMeetingsQuery,
  useLazyGetFathomMeetingsQuery,
  useGetLeadTranscriptsQuery,
  useLazyGetMeetingTranscriptQuery,
  useDeleteLeadTranscriptMutation,
  useImportLeadTranscriptFromFathomMutation,
} = transcriptsApi;
