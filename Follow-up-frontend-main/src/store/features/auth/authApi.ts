import { baseApi } from "@/store/api/baseApi";
import type {
  LoginRequestBody,
  LoginResponse,
  RegisterRequestBody,
  RegisterResponse,
} from "@/types/auth";
import { setCredentials } from "./authSlice";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<RegisterResponse, RegisterRequestBody>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              token: data.data.accessToken,
              user: data.data.user,
            }),
          );
        } catch {
          // Handled by RTK Query error state in UI
        }
      },
    }),
    login: builder.mutation<LoginResponse, LoginRequestBody>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              token: data.data.accessToken,
              user: data.data.user,
            }),
          );
        } catch {
          // Handled by RTK Query error state in UI
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useRegisterMutation, useLoginMutation } = authApi;
