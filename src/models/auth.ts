export const AUTH_ERROR_CODES = {
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  WEAK_PASSWORD: "WEAK_PASSWORD",
  UNAUTHORIZED: "UNAUTHORIZED",
  INVALID_REFRESH_TOKEN: "INVALID_REFRESH_TOKEN",
  UNKNOWN: "UNKNOWN",
} as const;

export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

export type AuthErrorResponse = {
  code: AuthErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export type AuthSuccessResponse = {
  user: AuthUser;
  session: AuthSession;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type RefreshTokenResponse = Pick<AuthSession, "accessToken" | "refreshToken" | "expiresAt">;

export type UpdateProfileRequest = {
  name: string;
  email: string;
  avatarUrl?: string;
};

export type UpdateProfileResponse = AuthUser;

export interface AuthGateway {
  register: (payload: RegisterRequest) => Promise<AuthSuccessResponse>;
  login: (payload: LoginRequest) => Promise<AuthSuccessResponse>;
  me: () => Promise<AuthUser>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  changePassword: (payload: ChangePasswordRequest) => Promise<void>;
  refresh: (payload: RefreshTokenRequest) => Promise<RefreshTokenResponse>;
  logout: () => Promise<void>;
}
