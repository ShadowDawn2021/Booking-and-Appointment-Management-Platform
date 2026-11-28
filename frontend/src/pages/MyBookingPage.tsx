import { BookingsList } from "../components/BookingList";

export default function MyBookingsPage() {
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-2xl font-bold">My bookings</h1>
      <BookingsList audience="customer" />
    </main>
  );
}
