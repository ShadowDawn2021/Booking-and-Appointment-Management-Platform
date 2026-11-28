import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { getRedirectTarget } from "../auth/redirect";
import { loginSchema, type LoginForm } from "../auth/schema";
import { useAuth } from "../auth/useAuth";

export default function LoginPage() {
  const { user, isLoading, login } = useAuth();
  const location = useLocation();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (isLoading) {
    return <p className="p-6 text-gray-600">Loading…</p>;
  }

  if (user) {
    return (
      <Navigate
        to={getRedirectTarget(
          location.state,
          user.role === "PROVIDER" ? "/dashboard" : "/",
        )}
        replace
      />
    );
  }

  async function onSubmit(values: LoginForm): Promise<void> {
    setSubmitError(null);
    try {
      await login(values);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  }

  return (
    <main className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-2xl font-bold">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="w-full rounded border border-gray-300 px-3 py-2"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="w-full rounded border border-gray-300 px-3 py-2"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>
        {submitError && (
          <p role="alert" className="text-sm text-red-600">
            {submitError}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
        >
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>
      </form>
      <p className="mt-4 text-sm text-gray-600">
        No account?{" "}
        <Link to="/signup" state={location.state} className="underline">
          Sign up
        </Link>
      </p>
    </main>
  );
}
