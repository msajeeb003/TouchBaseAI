export interface AuthUser {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

export interface SetCredentialsPayload {
  token: string;
  user: AuthUser;
}

export interface AuthRequestBody {
  email: string;
  password: string;
}

export interface AuthSuccessResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    accessToken: string;
    user: AuthUser;
  };
}

export type RegisterRequestBody = AuthRequestBody;
export type LoginRequestBody = AuthRequestBody;

export type RegisterResponse = AuthSuccessResponse;
export type LoginResponse = AuthSuccessResponse;
