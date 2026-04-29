import type {
  AuthErrorCode,
  AuthErrorResponse,
  AuthSession,
  AuthSuccessResponse,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  UpdateProfileRequest,
} from "@/models/auth";
import axios, { AxiosError, AxiosInstance } from 'axios';

import { APIConfiguration } from '@/configs/api.config';
import { AUTH_ENDPOINTS } from '@/configs/auth-endpoints';
import { readStoredSession } from '@/features/auth/session';

type BackendAuthUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type BackendSessionResponse = {
  accessToken: string;
  refreshToken: string;
  user: BackendAuthUser;
};

type BackendRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

type BackendErrorResponse = {
  code?: string;
  message?: string;
  details?: {
    fieldErrors?: Record<string, string>;
    issues?: Array<{ path?: Array<string | number>; message?: string }>;
  };
};

type AuthErrorContext = 'login' | 'register' | 'default';
const FRIENDLY_AUTH_401_MESSAGE = 'Invalid email or password.';

const mapBackendCodeToAuthCode = (backendCode?: string): AuthErrorCode => {
  if (!backendCode) return 'UNKNOWN';

  const map: Record<string, AuthErrorCode> = {
    EMAIL_EXISTS: 'EMAIL_ALREADY_EXISTS',
    EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    WEAK_PASSWORD: 'WEAK_PASSWORD',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_REFRESH_TOKEN: 'INVALID_REFRESH_TOKEN',
    UNKNOWN: 'UNKNOWN',
  };

  return map[backendCode] ?? 'UNKNOWN';
};

const authAxios: AxiosInstance = axios.create({
  baseURL: APIConfiguration.baseURL,
  headers: {
    'Content-Type': 'application/json',
    ...(APIConfiguration.APIKey ? { 'API-Key': APIConfiguration.APIKey } : {}),
  },
});

const decodeJwtExp = (token: string): number | null => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const json = JSON.parse(atob(padded)) as { exp?: number };
    return typeof json.exp === 'number' ? json.exp * 1000 : null;
  } catch {
    return null;
  }
};

const createSession = (accessToken: string, refreshToken: string): AuthSession => {
  const fallbackExpiry = Date.now() + 15 * 60 * 1000;
  const expiresAt = new Date(decodeJwtExp(accessToken) ?? fallbackExpiry).toISOString();

  return {
    accessToken,
    refreshToken,
    expiresAt,
  };
};

const toAuthUser = (user: BackendAuthUser): AuthUser => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeAuthError = (
  error: unknown,
  context: AuthErrorContext = 'default'
): AuthErrorResponse => {
  if (!axios.isAxiosError(error)) {
    return {
      code: 'UNKNOWN',
      message: 'Unexpected auth error.',
    };
  }

  const axiosError = error as AxiosError<BackendErrorResponse>;
  const data = axiosError.response?.data;
  const status = axiosError.response?.status;
  const mappedCode = mapBackendCodeToAuthCode(data?.code);

  const issueFieldErrors =
    data?.details?.issues?.reduce<Record<string, string>>((acc, issue) => {
      const key = typeof issue.path?.[0] === 'string' ? issue.path[0] : undefined;
      if (key && issue.message) {
        acc[key] = issue.message;
      }
      return acc;
    }, {}) ?? {};

  const mergedFieldErrors = {
    ...(data?.details?.fieldErrors ?? {}),
    ...issueFieldErrors,
  };

  if (status === 401) {
    return {
      code: mappedCode === 'UNKNOWN' ? 'UNAUTHORIZED' : mappedCode,
      message: FRIENDLY_AUTH_401_MESSAGE,
    };
  }

  const backendMessage = data?.message ?? axiosError.message ?? 'Unexpected auth error.';
  const lowerMessage = backendMessage.toLowerCase();

  const shouldMaskLoginMessage =
    context === 'login' &&
    (mappedCode === 'INVALID_CREDENTIALS' ||
      mappedCode === 'UNKNOWN' ||
      mappedCode === 'UNAUTHORIZED' ||
      mappedCode === 'WEAK_PASSWORD' ||
      mappedCode === 'USER_NOT_FOUND' ||
      lowerMessage.includes('failed to serialize an error') ||
      lowerMessage.includes('body/password') ||
      lowerMessage.includes('validation'));

  return {
    code: mappedCode,
    message: shouldMaskLoginMessage
      ? FRIENDLY_AUTH_401_MESSAGE
      : backendMessage,
    fieldErrors: Object.keys(mergedFieldErrors).length > 0 ? mergedFieldErrors : undefined,
  };
};

const withAuthHeader = () => {
  const session = readStoredSession();
  return session?.accessToken
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
};

export const registerUser = async (payload: RegisterRequest): Promise<AuthSuccessResponse> => {
  try {
    const response = await authAxios.post<BackendSessionResponse>(AUTH_ENDPOINTS.register, payload);

    return {
      user: toAuthUser(response.data.user),
      session: createSession(response.data.accessToken, response.data.refreshToken),
    };
  } catch (error) {
    throw normalizeAuthError(error, 'register');
  }
};

export const loginUser = async (payload: LoginRequest): Promise<AuthSuccessResponse> => {
  try {
    const response = await authAxios.post<BackendSessionResponse>(AUTH_ENDPOINTS.login, payload);

    return {
      user: toAuthUser(response.data.user),
      session: createSession(response.data.accessToken, response.data.refreshToken),
    };
  } catch (error) {
    throw normalizeAuthError(error, 'login');
  }
};

export const getCurrentUser = async (): Promise<AuthUser> => {
  try {
    const response = await authAxios.get<BackendAuthUser>(AUTH_ENDPOINTS.me, {
      headers: withAuthHeader(),
    });
    return toAuthUser(response.data);
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const updateCurrentUserProfile = async (
  payload: UpdateProfileRequest
): Promise<AuthUser> => {
  try {
    const response = await authAxios.patch<BackendAuthUser>(
      AUTH_ENDPOINTS.me,
      {
        name: payload.name,
        email: payload.email,
      },
      {
        headers: withAuthHeader(),
      }
    );

    return toAuthUser(response.data);
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const changeUserPassword = async (
  payload: ChangePasswordRequest
): Promise<void> => {
  try {
    await authAxios.post(AUTH_ENDPOINTS.changePassword, payload, {
      headers: withAuthHeader(),
    });
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const refreshAccessToken = async (
  payload: RefreshTokenRequest
): Promise<RefreshTokenResponse> => {
  try {
    const response = await authAxios.post<BackendRefreshResponse>(AUTH_ENDPOINTS.refresh, payload);
    return createSession(response.data.accessToken, response.data.refreshToken);
  } catch (error) {
    throw normalizeAuthError(error);
  }
};

export const logoutUser = async (): Promise<void> => {
  const session = readStoredSession();
  if (!session?.refreshToken) return;

  try {
    await authAxios.post(AUTH_ENDPOINTS.logout, {
      refreshToken: session.refreshToken,
    });
  } catch {
    // logout should clear local session even if backend call fails
  }
};
