import type { BookingView } from "../api/types";
import { formatSlotDateTime } from "../lib/dateTime";

interface BookingConfirmationProps {
  booking: BookingView;
  timezone: string;
  onBookAnother: () => void;
}

export function BookingConfirmation({
  booking,
  timezone,
  onBookAnother,
}: BookingConfirmationProps) {
  return (
    <section
      role="status"
      className="space-y-3 rounded border border-green-200 bg-green-50 p-4"
    >
      <h2 className="text-lg font-semibold text-green-800">
        Booking confirmed
      </h2>
      <p className="font-medium">{booking.service.name}</p>
      <p className="text-gray-700">
        {formatSlotDateTime(booking.startTime, timezone)}
      </p>
      <p className="text-sm text-gray-600">
        With {booking.provider.businessName} · Reference{" "}
        {booking.id.slice(0, 8)}
      </p>
      <button
        type="button"
        onClick={onBookAnother}
        className="text-sm underline"
      >
        Book another time
      </button>
    </section>
  );
}
