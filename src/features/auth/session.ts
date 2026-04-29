import type { AuthSession } from "@/models/auth";

const AUTH_SESSION_STORAGE_KEY = "study-tracker:auth-session";

export function readStoredSession(): AuthSession | null {
  try {
    const raw = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: AuthSession): void {
  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredSession(): void {
  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export { AUTH_SESSION_STORAGE_KEY };
