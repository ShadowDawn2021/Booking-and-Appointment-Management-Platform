import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function AuthControls() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return null;
  }
  if (!user) {
    return (
      <>
        <Link to="/login" className="underline">
          Log in
        </Link>
        <Link
          to="/signup"
          className="rounded bg-blue-600 px-3 py-1.5 text-white"
        >
          Sign up
        </Link>
      </>
    );
  }
  return (
    <>
      {user.role === "PROVIDER" ? (
        <Link to="/dashboard" className="underline">
          Dashboard
        </Link>
      ) : (
        <Link to="/my-bookings" className="underline">
          My bookings
        </Link>
      )}
      <span className="text-gray-600">{user.name}</span>
      <button type="button" onClick={logout} className="underline">
        Log out
      </button>
    </>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-3xl items-center justify-between p-4">
          <Link to="/" className="font-semibold">
            Booking Platform
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <AuthControls />
          </div>
        </nav>
      </header>
      <Outlet />
    </div>
  );
}
