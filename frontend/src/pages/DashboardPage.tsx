// src/pages/DashboardPage.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { useMyProvider } from "../api/providers";
import { BookingsList } from "../components/BookingList";
import { ProviderOnboarding } from "../components/ProviderOnboarding";

export default function DashboardPage() {
  const profile = useMyProvider();
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  if (profile.isPending) {
    return <p className="p-6 text-gray-600">Loading…</p>;
  }
  if (profile.isError) {
    return <p className="p-6 text-red-600">{getErrorMessage(profile.error)}</p>;
  }
  if (profile.data === null) {
    return <ProviderOnboarding />;
  }

  const bookingPath = `/book/${profile.data.slug}`;
  const bookingUrl = `${window.location.origin}${bookingPath}`;

  async function copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold">{profile.data.businessName}</h1>
        <p className="text-sm text-gray-500">
          Timezone: {profile.data.timezone}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
          <Link to={bookingPath} className="text-blue-600 underline">
            {bookingUrl}
          </Link>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="underline"
          >
            {copyState === "copied"
              ? "Copied"
              : copyState === "failed"
                ? "Copy failed"
                : "Copy link"}
          </button>
        </div>
      </header>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Bookings</h2>
        <BookingsList audience="provider" />
      </section>
    </main>
  );
}
