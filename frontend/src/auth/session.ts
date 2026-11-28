import type { AuthUser } from "../api/types";

const STORAGE_KEY = "booking.session";
export const AUTH_EXPIRED_EVENT = "auth:expired";

export interface StoredSession {
  token: string;
  user: AuthUser;
}

function isStoredSession(value: unknown): value is StoredSession {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const { token, user } = value as Record<string, unknown>;
  if (typeof token !== "string" || typeof user !== "object" || user === null) {
    return false;
  }
  const fields = user as Record<string, unknown>;
  return (
    typeof fields.id === "string" &&
    typeof fields.email === "string" &&
    typeof fields.name === "string" &&
    (fields.role === "CUSTOMER" || fields.role === "PROVIDER")
  );
}

export const authSession = {
  load(): StoredSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return null;
      }
      const parsed: unknown = JSON.parse(raw);
      return isStoredSession(parsed) ? parsed : null;
    } catch {
      return null; // storage unavailable or corrupted JSON
    }
  },
  save(session: StoredSession): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } catch {
      // storage unavailable (e.g. blocked); the user stays logged out after a reload
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // nothing to clear if storage is unavailable
    }
  },
};
