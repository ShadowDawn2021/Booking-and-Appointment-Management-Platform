import { createContext } from "react";
import type { AuthUser } from "../api/types";
import type { LoginForm, SignupForm } from "./schema";

export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean; // true while a stored session is being verified on startup
  login: (input: LoginForm) => Promise<AuthUser>;
  signup: (input: SignupForm) => Promise<AuthUser>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
