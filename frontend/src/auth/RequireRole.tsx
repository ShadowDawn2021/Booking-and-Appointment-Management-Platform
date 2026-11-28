import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { Role } from "../api/types";
import { useAuth } from "./useAuth";

export function RequireRole({ role }: { role: Role }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p className="p-6 text-gray-600">Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== role) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
