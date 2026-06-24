import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL = import.meta.env.VITE_BASE_URL as string;

export const baseApi = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            // Get token from Redux state, not localStorage
            // @ts-expect-error Redux state type is not defined
            const token = getState()?.auth?.token;

            if (token) {
                headers.set("Authorization", `Bearer ${token}`);
            }
            return headers;
        },
    }),
    endpoints: () => ({}),
    tagTypes: [
        "Leads",
        "Templates",
        "Settings",
        "FathomMeetings",
        "LeadTranscripts",
        "MeetingTranscript",
        "Sequences",
        "Dashboard",
    ],
    // overrideExisting: false,
});