import { baseApi } from "@/store/api/baseApi";
import type { GetDashboardResponse } from "@/types/dashboard";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<GetDashboardResponse, void>({
      query: () => ({
        url: "/dashboard",
        method: "GET",
      }),
      providesTags: ["Dashboard"],
    }),
  }),
  overrideExisting: false,
});

export const { useGetDashboardQuery } = dashboardApi;
