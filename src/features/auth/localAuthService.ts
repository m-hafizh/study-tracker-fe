import {
  AUTH_ERROR_CODES,
  type AuthGateway,
  type AuthErrorResponse,
  type AuthSuccessResponse,
  type AuthUser,
  type ChangePasswordRequest,
  type LoginRequest,
  type RefreshTokenRequest,
  type RefreshTokenResponse,
  type RegisterRequest,
  type UpdateProfileRequest,
  type UpdateProfileResponse,
} from "@/models/auth";
import { createUuid } from "@/utils/uuid";

type LocalAuthUserRecord = AuthUser & {
  password: string;
};

const USERS_STORAGE_KEY = "study-tracker:auth-users";
const CURRENT_USER_ID_STORAGE_KEY = "study-tracker:auth-current-user-id";

const now = () => new Date().toISOString();

const wait = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function makeAuthError(error: AuthErrorResponse): never {
  throw error;
}

function generateToken(prefix: string) {
  return `${prefix}_${createUuid()}_${Date.now()}`;
}

function parseUsers(): LocalAuthUserRecord[] {
  try {
    const raw = window.localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as LocalAuthUserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: LocalAuthUserRecord[]) {
  window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function sanitizeUser(user: LocalAuthUserRecord): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function getCurrentUser(): LocalAuthUserRecord | null {
  const userId = window.localStorage.getItem(CURRENT_USER_ID_STORAGE_KEY);
  if (!userId) return null;
  return parseUsers().find((user) => user.id === userId) ?? null;
}

function ensureStrongPassword(password: string) {
  if (password.length < 8) {
    makeAuthError({
      code: AUTH_ERROR_CODES.WEAK_PASSWORD,
      message: "Password must be at least 8 characters.",
      fieldErrors: { password: "Minimum 8 characters." },
    });
  }
}

function ensureValidEmail(email: string) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    makeAuthError({
      code: AUTH_ERROR_CODES.UNKNOWN,
      message: "Please provide a valid email address.",
      fieldErrors: { email: "Invalid email format." },
    });
  }
}

function ensureValidName(name: string) {
  if (name.trim().length < 2) {
    makeAuthError({
      code: AUTH_ERROR_CODES.UNKNOWN,
      message: "Name must be at least 2 characters.",
      fieldErrors: { name: "Minimum 2 characters." },
    });
  }
}

function createSession(): RefreshTokenResponse {
  return {
    accessToken: generateToken("access"),
    refreshToken: generateToken("refresh"),
    expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
  };
}

export const localAuthService: AuthGateway = {
  async register(payload: RegisterRequest): Promise<AuthSuccessResponse> {
    await wait();

    const users = parseUsers();
    const email = payload.email.trim().toLowerCase();

    if (users.some((user) => user.email.toLowerCase() === email)) {
      makeAuthError({
        code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: "This email is already registered.",
        fieldErrors: { email: "Email is already in use." },
      });
    }

    ensureStrongPassword(payload.password);

    const timestamp = now();
    const newUser: LocalAuthUserRecord = {
      id: createUuid(),
      name: payload.name.trim(),
      email,
      password: payload.password,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextUsers = [newUser, ...users];
    saveUsers(nextUsers);
    window.localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, newUser.id);

    const session = createSession();

    return {
      user: sanitizeUser(newUser),
      session,
    };
  },

  async login(payload: LoginRequest): Promise<AuthSuccessResponse> {
    await wait();

    const email = payload.email.trim().toLowerCase();
    const users = parseUsers();

    const user = users.find(
      (candidate) =>
        candidate.email.toLowerCase() === email && candidate.password === payload.password
    );

    if (!user) {
      makeAuthError({
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        message: "Incorrect email or password.",
      });
    }

    window.localStorage.setItem(CURRENT_USER_ID_STORAGE_KEY, user.id);

    return {
      user: sanitizeUser(user),
      session: createSession(),
    };
  },

  async me(): Promise<AuthUser> {
    await wait(40);

    const user = getCurrentUser();
    if (!user) {
      makeAuthError({
        code: AUTH_ERROR_CODES.UNAUTHORIZED,
        message: "Session expired. Please login again.",
      });
    }

    return sanitizeUser(user);
  },

  async updateProfile(payload: UpdateProfileRequest): Promise<UpdateProfileResponse> {
    await wait();

    const user = getCurrentUser();
    if (!user) {
      makeAuthError({
        code: AUTH_ERROR_CODES.UNAUTHORIZED,
        message: "You need to login first.",
      });
    }

    const nextName = payload.name.trim();
    const nextEmail = payload.email.trim().toLowerCase();
    const nextAvatarUrl = payload.avatarUrl?.trim() || undefined;

    ensureValidName(nextName);
    ensureValidEmail(nextEmail);

    const users = parseUsers();
    const duplicateEmailOwner = users.find(
      (entry) => entry.id !== user.id && entry.email.toLowerCase() === nextEmail
    );

    if (duplicateEmailOwner) {
      makeAuthError({
        code: AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: "This email is already registered.",
        fieldErrors: { email: "Email is already in use." },
      });
    }

    const isUnchanged =
      user.name === nextName &&
      user.email.toLowerCase() === nextEmail &&
      (user.avatarUrl || undefined) === nextAvatarUrl;

    if (isUnchanged) {
      return sanitizeUser(user);
    }

    const timestamp = now();
    const updatedUsers = users.map((entry) => {
      if (entry.id !== user.id) return entry;

      return {
        ...entry,
        name: nextName,
        email: nextEmail,
        avatarUrl: nextAvatarUrl,
        updatedAt: timestamp,
      };
    });

    saveUsers(updatedUsers);

    const updatedCurrentUser = updatedUsers.find((entry) => entry.id === user.id);
    if (!updatedCurrentUser) {
      makeAuthError({
        code: AUTH_ERROR_CODES.USER_NOT_FOUND,
        message: "Unable to update profile. Please try again.",
      });
    }

    return sanitizeUser(updatedCurrentUser);
  },

  async changePassword(payload: ChangePasswordRequest): Promise<void> {
    await wait();

    ensureStrongPassword(payload.newPassword);

    const user = getCurrentUser();
    if (!user) {
      makeAuthError({
        code: AUTH_ERROR_CODES.UNAUTHORIZED,
        message: "You need to login first.",
      });
    }

    if (user.password !== payload.currentPassword) {
      makeAuthError({
        code: AUTH_ERROR_CODES.INVALID_CREDENTIALS,
        message: "Current password is invalid.",
        fieldErrors: { currentPassword: "Current password does not match." },
      });
    }

    const users = parseUsers();
    const updatedUsers = users.map((entry) =>
      entry.id === user.id
        ? { ...entry, password: payload.newPassword, updatedAt: now() }
        : entry
    );

    saveUsers(updatedUsers);
  },

  async refresh(payload: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    await wait(60);

    if (!payload.refreshToken) {
      makeAuthError({
        code: AUTH_ERROR_CODES.INVALID_REFRESH_TOKEN,
        message: "Missing refresh token.",
      });
    }

    return createSession();
  },

  async logout(): Promise<void> {
    await wait(50);
    window.localStorage.removeItem(CURRENT_USER_ID_STORAGE_KEY);
  },
};
