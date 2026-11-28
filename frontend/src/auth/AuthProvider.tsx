import { useQueryClient } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api } from "../api/client";
import type { AuthResponse, AuthUser } from "../api/types";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import type { LoginForm, SignupForm } from "./schema";
import { AUTH_EXPIRED_EVENT, authSession } from "./session";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(
    () => authSession.load()?.user ?? null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(
    () => authSession.load() !== null,
  );

  // The API client fires this when the server rejects a token it sent
  useEffect(() => {
    function handleExpired(): void {
      setUser(null);
      queryClient.clear();
    }
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, [queryClient]);

  // Verify a stored session once; a 401 is handled by the expiry event above
  useEffect(() => {
    if (!authSession.load()) {
      return;
    }
    let cancelled = false;
    api
      .get("/auth/me")
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const startSession = useCallback(
    (response: AuthResponse): AuthUser => {
      authSession.save({ token: response.token, user: response.user });
      queryClient.clear(); // never show one account's cached data to another
      setUser(response.user);
      return response.user;
    },
    [queryClient],
  );

  const login = useCallback(
    async (input: LoginForm) =>
      startSession((await api.post<AuthResponse>("/auth/login", input)).data),
    [startSession],
  );

  const signup = useCallback(
    async (input: SignupForm) =>
      startSession((await api.post<AuthResponse>("/auth/signup", input)).data),
    [startSession],
  );

  const logout = useCallback(() => {
    authSession.clear();
    queryClient.clear();
    setUser(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, login, signup, logout }),
    [user, isLoading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
