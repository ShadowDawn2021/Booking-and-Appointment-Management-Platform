import axios from "axios";
import { AUTH_EXPIRED_EVENT, authSession } from "../auth/session";

const apiBaseUrl: string = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const session = authSession.load();
  if (session) {
    config.headers.Authorization = `Bearer ${session.token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const isRejectedToken =
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      authSession.load() !== null;
    if (isRejectedToken) {
      authSession.clear();
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }
    return Promise.reject(error);
  },
);
