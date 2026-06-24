import { baseApi } from "@/store/api/baseApi";
import type {
  CreatePromptTemplateRequestBody,
  CreatePromptTemplateResponse,
  DeletePromptTemplateResponse,
  GeneratePromptTextRequestBody,
  GeneratePromptTextResponse,
  GetPromptTemplateByIdResponse,
  GetPromptTemplatesResponse,
  UpdatePromptTemplateRequestBody,
  UpdatePromptTemplateResponse,
} from "@/types/templates";

export const templatesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPromptTemplates: builder.query<GetPromptTemplatesResponse, void>({
      query: () => ({
        url: "/prompt-templates",
        method: "GET",
      }),
      providesTags: ["Templates"],
    }),
    getPromptTemplateById: builder.query<GetPromptTemplateByIdResponse, string>({
      query: (id) => ({
        url: `/prompt-templates/${id}`,
        method: "GET",
      }),
      providesTags: ["Templates"],
    }),
    createPromptTemplate: builder.mutation<
      CreatePromptTemplateResponse,
      CreatePromptTemplateRequestBody
    >({
      query: (body) => ({
        url: "/prompt-templates",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    updatePromptTemplate: builder.mutation<
      UpdatePromptTemplateResponse,
      { id: string; body: UpdatePromptTemplateRequestBody }
    >({
      query: ({ id, body }) => ({
        url: `/prompt-templates/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    deletePromptTemplate: builder.mutation<DeletePromptTemplateResponse, string>({
      query: (id) => ({
        url: `/prompt-templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
    generatePromptText: builder.mutation<
      GeneratePromptTextResponse,
      GeneratePromptTextRequestBody
    >({
      query: (body) => ({
        url: "/prompt-templates/generate-prompt-text",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPromptTemplatesQuery,
  useGetPromptTemplateByIdQuery,
  useLazyGetPromptTemplateByIdQuery,
  useCreatePromptTemplateMutation,
  useUpdatePromptTemplateMutation,
  useDeletePromptTemplateMutation,
  useGeneratePromptTextMutation,
} = templatesApi;
