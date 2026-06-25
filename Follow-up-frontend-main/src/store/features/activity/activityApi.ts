import { baseApi } from "@/store/api/baseApi";
import type { GetCallsResponse, GetMessagesResponse } from "@/types/activity";

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalls: builder.query<GetCallsResponse, void>({
      query: () => ({ url: "/activity/calls", method: "GET" }),
    }),
    getMessages: builder.query<GetMessagesResponse, void>({
      query: () => ({ url: "/activity/messages", method: "GET" }),
    }),
  }),
  overrideExisting: false,
});

export const { useGetCallsQuery, useGetMessagesQuery } = activityApi;
