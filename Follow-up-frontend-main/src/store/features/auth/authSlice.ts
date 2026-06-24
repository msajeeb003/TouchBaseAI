import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, SetCredentialsPayload } from "@/types/auth";
import { RootState } from "@/store";

const initialState: AuthState = {
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<SetCredentialsPayload>) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const useCurrentUser = (state: RootState) => state.auth.user;
export const useCurrentToken = (state: RootState) => state.auth.token;

export const { setCredentials, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
