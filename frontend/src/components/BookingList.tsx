import { useState } from "react";
import {
  useCancelBooking,
  useMyBookings,
  type BookingScope,
} from "../api/booking";
import { getErrorMessage } from "../api/errors";
import type { BookingStatus, BookingView } from "../api/types";
import { formatSlotDateTime } from "../lib/dateTime";

type ListScope = Exclude<BookingScope, "all">;

const SCOPES: { value: ListScope; label: string }[] = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-green-100 text-green-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  CANCELLED: "bg-gray-200 text-gray-600",
};

interface BookingsListProps {
  audience: "provider" | "customer";
}

export function BookingsList({ audience }: BookingsListProps) {
  const [scope, setScope] = useState<ListScope>("upcoming");
  const bookings = useMyBookings(scope);
  const cancel = useCancelBooking();

  function handleCancel(booking: BookingView): void {
    const when = formatSlotDateTime(
      booking.startTime,
      booking.provider.timezone,
    );
    if (window.confirm(`Cancel ${booking.service.name} on ${when}?`)) {
      cancel.mutate(booking.id);
    }
  }

  return (
    <section>
      <div className="mb-4 flex gap-2" role="tablist">
        {SCOPES.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={scope === option.value}
            onClick={() => setScope(option.value)}
            className={`rounded px-3 py-1.5 text-sm ${
              scope === option.value
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {bookings.isPending && <p className="text-gray-600">Loading bookings…</p>}
      {bookings.isError && (
        <p className="text-red-600">{getErrorMessage(bookings.error)}</p>
      )}
      {cancel.isError && (
        <p role="alert" className="mb-3 text-sm text-red-600">
          {getErrorMessage(cancel.error)}
        </p>
      )}
      {bookings.data?.length === 0 && (
        <p className="text-gray-600">No {scope} bookings.</p>
      )}

      <ul className="space-y-3">
        {bookings.data?.map((booking) => {
          const isCancelling =
            cancel.isPending && cancel.variables === booking.id;
          return (
            <li
              key={booking.id}
              className="rounded border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{booking.service.name}</p>
                  <p className="text-sm text-gray-700">
                    {formatSlotDateTime(
                      booking.startTime,
                      booking.provider.timezone,
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    {audience === "provider"
                      ? `${booking.customer.name} · ${booking.customer.email}`
                      : booking.provider.businessName}
                  </p>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[booking.status]}`}
                >
                  {booking.status.toLowerCase()}
                </span>
              </div>
              {scope === "upcoming" && booking.status !== "CANCELLED" && (
                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={() => handleCancel(booking)}
                  className="mt-3 text-sm text-red-600 underline disabled:opacity-60"
                >
                  {isCancelling ? "Cancelling…" : "Cancel booking"}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
