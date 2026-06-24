import { baseApi } from "@/store/api/baseApi";
import type {
  BulkDeleteLeadsRequestBody,
  BulkDeleteLeadsResponse,
  CreateLeadRequestBody,
  CreateLeadResponse,
  DeleteLeadResponse,
  GetSingleLeadResponse,
  GetLeadsQueryParams,
  GetLeadsResponse,
  ImportLeadsCsvResponse,
  UpdateLeadRequestBody,
  UpdateLeadResponse,
} from "@/types/leads";

const sanitizeQueryParams = (params: GetLeadsQueryParams) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );

export const leadsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLeads: builder.query<GetLeadsResponse, GetLeadsQueryParams>({
      query: (params) => ({
        url: "/leads",
        method: "GET",
        params: sanitizeQueryParams(params),
      }),
      providesTags: ["Leads"],
    }),
    getSingleLead: builder.query<GetSingleLeadResponse, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "GET",
      }),
      providesTags: ["Leads"],
    }),
    createLead: builder.mutation<CreateLeadResponse, CreateLeadRequestBody>({
      query: (body) => ({
        url: "/leads",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),
    updateLead: builder.mutation<
      UpdateLeadResponse,
      { id: string; body: UpdateLeadRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/leads/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),
    deleteLead: builder.mutation<DeleteLeadResponse, string>({
      query: (id) => ({
        url: `/leads/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Leads"],
    }),
    bulkDeleteLeads: builder.mutation<BulkDeleteLeadsResponse, BulkDeleteLeadsRequestBody>({
      query: (body) => ({
        url: "/leads/bulk-delete",
        method: "DELETE",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),
    importLeadsCsv: builder.mutation<ImportLeadsCsvResponse, FormData>({
      query: (body) => ({
        url: "/leads/import-csv",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leads"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLeadsQuery,
  useGetSingleLeadQuery,
  useCreateLeadMutation,
  useUpdateLeadMutation,
  useDeleteLeadMutation,
  useBulkDeleteLeadsMutation,
  useImportLeadsCsvMutation,
} = leadsApi;
