import { baseApi } from "@/store/api/baseApi";
import type {
  GetSettingsResponse,
  UpdateSettingsRequestBody,
  UpdateSettingsResponse,
} from "@/types/settings";

export const settingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSettings: builder.query<GetSettingsResponse, void>({
      query: () => ({
        url: "/settings",
        method: "GET",
      }),
      providesTags: ["Settings"],
    }),
    updateSettings: builder.mutation<UpdateSettingsResponse, UpdateSettingsRequestBody>({
      query: (body) => ({
        url: "/settings",
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Settings"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetSettingsQuery, useUpdateSettingsMutation } = settingsApi;
