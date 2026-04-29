import { create } from "zustand";
import {
  changeUserPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateCurrentUserProfile,
} from "@/api/auth";
import type {
  AuthErrorResponse,
  AuthSession,
  AuthUser,
  ChangePasswordRequest,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
} from "@/models/auth";
import {
  clearStoredSession,
  readStoredSession,
  writeStoredSession,
} from "@/features/auth/session";

const delay = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

export type AuthTransitionMode = "login" | "register" | "logout" | null;

const normalizeError = (error: unknown): AuthErrorResponse => {
  if (error && typeof error === "object" && "message" in error) {
    const maybeAuthError = error as Partial<AuthErrorResponse>;
    return {
      code: maybeAuthError.code ?? "UNKNOWN",
      message: maybeAuthError.message ?? "Unexpected auth error.",
      fieldErrors: maybeAuthError.fieldErrors,
    };
  }

  return {
    code: "UNKNOWN",
    message: "Unexpected auth error.",
  };
};

type AuthState = {
  user: AuthUser | null;
  session: AuthSession | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  isLoading: boolean;
  isAuthTransitioning: boolean;
  authTransitionMode: AuthTransitionMode;
  error: AuthErrorResponse | null;

  bootstrap: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<boolean>;
  login: (payload: LoginRequest) => Promise<boolean>;
  updateProfile: (payload: UpdateProfileRequest) => Promise<boolean>;
  changePassword: (payload: ChangePasswordRequest) => Promise<boolean>;
  refreshSession: () => Promise<boolean>;
  runAuthTransition: (
    mode: Exclude<AuthTransitionMode, null>,
    task: () => void | Promise<void>,
    minimumMs?: number
  ) => Promise<void>;
  clearError: () => void;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isBootstrapping: true,
  isLoading: false,
  isAuthTransitioning: false,
  authTransitionMode: null,
  error: null,

  bootstrap: async () => {
    if (!get().isBootstrapping) return;

    const existingSession = readStoredSession();
    if (!existingSession) {
      set({ isBootstrapping: false });
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const user = await getCurrentUser();
      set({
        user,
        session: existingSession,
        isAuthenticated: true,
        isBootstrapping: false,
        isLoading: false,
      });
    } catch {
      clearStoredSession();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isBootstrapping: false,
        isLoading: false,
      });
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await registerUser(payload);
      writeStoredSession(response.session);
      set({
        user: response.user,
        session: response.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: normalizeError(error),
      });
      return false;
    }
  },

  login: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const response = await loginUser(payload);
      writeStoredSession(response.session);
      set({
        user: response.user,
        session: response.session,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: normalizeError(error),
      });
      return false;
    }
  },

  changePassword: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      await changeUserPassword(payload);
      set({ isLoading: false, error: null });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: normalizeError(error),
      });
      return false;
    }
  },

  updateProfile: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const updatedUser = await updateCurrentUserProfile(payload);
      set({
        user: updatedUser,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (error) {
      set({
        isLoading: false,
        error: normalizeError(error),
      });
      return false;
    }
  },

  refreshSession: async () => {
    const currentSession = get().session ?? readStoredSession();
    if (!currentSession) return false;

    try {
      const refreshed = await refreshAccessToken({
        refreshToken: currentSession.refreshToken,
      });

      const nextSession: AuthSession = {
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresAt: refreshed.expiresAt,
      };

      writeStoredSession(nextSession);
      set({ session: nextSession });

      return true;
    } catch {
      await get().logout();
      return false;
    }
  },

  runAuthTransition: async (mode, task, minimumMs = 450) => {
    set({ isAuthTransitioning: true, authTransitionMode: mode });
    const startedAt = Date.now();

    try {
      await task();
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < minimumMs) {
        await delay(minimumMs - elapsed);
      }

      set({ isAuthTransitioning: false, authTransitionMode: null });
    }
  },

  clearError: () => set({ error: null }),

  logout: async () => {
    set({ isLoading: true });

    try {
      await logoutUser();
    } finally {
      clearStoredSession();
      set({
        user: null,
        session: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },
}));
