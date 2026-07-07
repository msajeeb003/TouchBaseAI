import { baseApi } from "@/store/api/baseApi";
import type {
  CreateSequenceStepRequestBody,
  CreateSequenceStepResponse,
  CreateSequenceRequestBody,
  CreateSequenceResponse,
  DeleteAllSequenceStepsResponse,
  DeleteSequenceStepResponse,
  DeleteSequenceResponse,
  GenerateSequenceStepContentResponse,
  GenerateSequenceStepsResponse,
  RegenerateAllStepContentResponse,
  GetSequencesResponse,
  GetSequenceStepsResponse,
  GetSingleSequenceResponse,
  UpdateSequenceStepRequestBody,
  UpdateSequenceStepResponse,
  UpdateSequenceRequestBody,
  UpdateSequenceResponse,
} from "@/types/sequences";

export const sequencesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSequences: builder.query<GetSequencesResponse, void>({
      query: () => ({
        url: "/sequences",
        method: "GET",
      }),
      providesTags: ["Sequences"],
    }),
    getSingleSequence: builder.query<GetSingleSequenceResponse, string>({
      query: (id) => ({
        url: `/sequences/${id}`,
        method: "GET",
      }),
      providesTags: ["Sequences"],
    }),
    getSequenceSteps: builder.query<GetSequenceStepsResponse, string>({
      query: (sequenceId) => ({
        url: `/sequences/${sequenceId}/steps`,
        method: "GET",
      }),
      providesTags: ["Sequences"],
    }),
    createSequenceStep: builder.mutation<
      CreateSequenceStepResponse,
      { sequenceId: string; body: CreateSequenceStepRequestBody }
    >({
      query: ({ sequenceId, body }) => ({
        url: `/sequences/${sequenceId}/steps`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sequences"],
    }),
    deleteSequenceStep: builder.mutation<
      DeleteSequenceStepResponse,
      { sequenceId: string; stepId: string }
    >({
      query: ({ sequenceId, stepId }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sequences"],
    }),
    reorderSequenceSteps: builder.mutation<
      GetSequenceStepsResponse,
      { sequenceId: string; orderedStepIds: string[] }
    >({
      query: ({ sequenceId, orderedStepIds }) => ({
        url: `/sequences/${sequenceId}/steps/reorder`,
        method: "PATCH",
        body: { orderedStepIds },
      }),
      invalidatesTags: ["Sequences"],
    }),
    deleteAllSequenceSteps: builder.mutation<DeleteAllSequenceStepsResponse, string>({
      query: (sequenceId) => ({
        url: `/sequences/${sequenceId}/steps/delete-all`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sequences"],
    }),
    generateSequenceStepContent: builder.mutation<
      GenerateSequenceStepContentResponse,
      { sequenceId: string; stepId: string }
    >({
      query: ({ sequenceId, stepId }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}/generate`,
        method: "POST",
      }),
      invalidatesTags: ["Sequences"],
    }),
    generateSequenceSteps: builder.mutation<GenerateSequenceStepsResponse, string>({
      query: (sequenceId) => ({
        url: `/sequences/${sequenceId}/generate-steps`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Sequences", "Dashboard"],
    }),
    regenerateAllStepContent: builder.mutation<RegenerateAllStepContentResponse, string>({
      query: (sequenceId) => ({
        url: `/sequences/${sequenceId}/steps/regenerate-all`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["Sequences"],
    }),
    updateSequenceStep: builder.mutation<
      UpdateSequenceStepResponse,
      { sequenceId: string; stepId: string; body: UpdateSequenceStepRequestBody }
    >({
      query: ({ sequenceId, stepId, body }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Sequences"],
    }),
    retrySequenceStep: builder.mutation<
      { success: boolean; message: string; data: { success: boolean; log: string } },
      { sequenceId: string; stepId: string }
    >({
      query: ({ sequenceId, stepId }) => ({
        url: `/sequences/${sequenceId}/steps/${stepId}/retry`,
        method: "POST",
      }),
      invalidatesTags: ["Sequences", "Dashboard"],
    }),
    createSequence: builder.mutation<CreateSequenceResponse, CreateSequenceRequestBody>({
      query: (body) => ({
        url: "/sequences",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sequences", "Dashboard"],
    }),
    updateSequence: builder.mutation<
      UpdateSequenceResponse,
      { id: string; body: UpdateSequenceRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/sequences/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Sequences", "Dashboard"],
    }),
    deleteSequence: builder.mutation<DeleteSequenceResponse, string>({
      query: (id) => ({
        url: `/sequences/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Sequences", "Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSequencesQuery,
  useGetSingleSequenceQuery,
  useGetSequenceStepsQuery,
  useCreateSequenceStepMutation,
  useDeleteAllSequenceStepsMutation,
  useDeleteSequenceStepMutation,
  useReorderSequenceStepsMutation,
  useGenerateSequenceStepContentMutation,
  useGenerateSequenceStepsMutation,
  useRegenerateAllStepContentMutation,
  useUpdateSequenceStepMutation,
  useRetrySequenceStepMutation,
  useCreateSequenceMutation,
  useUpdateSequenceMutation,
  useDeleteSequenceMutation,
} = sequencesApi;
