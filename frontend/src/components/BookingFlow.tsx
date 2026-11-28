import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCreateBooking } from "../api/booking";
import { getErrorMessage } from "../api/errors";
import { useSlots } from "../api/slots";
import type { PublicProvider, Service } from "../api/types";
import { useAuth } from "../auth/useAuth";
import { MAX_ADVANCE_DAYS } from "../lib/constants";
import {
  addDaysToDateString,
  formatSlotDateTime,
  todayInTimezone,
} from "../lib/dateTime";
import { BookingConfirmation } from "./BookingConfirmation";
import { ServicePicker } from "./ServicePicker";
import { SlotGrid } from "./SlotGrid";

interface BookingFlowProps {
  provider: PublicProvider;
  services: Service[];
}

export function BookingFlow({ provider, services }: BookingFlowProps) {
  const { user } = useAuth();
  const location = useLocation();
  const createBooking = useCreateBooking();

  const [serviceId, setServiceId] = useState<string | null>(null);
  const [dateOverride, setDateOverride] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState<string | null>(null);

  const today = todayInTimezone(provider.timezone);
  const maxDate = addDaysToDateString(today, MAX_ADVANCE_DAYS);
  const date = dateOverride ?? today;

  const slots = useSlots(provider.slug, serviceId, date);
  const selectedService =
    services.find((service) => service.id === serviceId) ?? null;
  // Derived, so a slot that vanishes after a refetch (someone else booked it) is dropped automatically
  const selectedSlot =
    slots.data?.slots.find((slot) => slot.start === slotStart) ?? null;
  const returnState = { from: location.pathname };

  function handleServiceSelect(id: string): void {
    createBooking.reset();
    setServiceId(id);
    setSlotStart(null);
  }

  function handleDateChange(value: string): void {
    if (!value) {
      return; // the date input emits "" when cleared
    }
    createBooking.reset();
    setDateOverride(value);
    setSlotStart(null);
  }

  function handleSlotSelect(start: string): void {
    createBooking.reset();
    setSlotStart(start);
  }

  function handleConfirm(): void {
    if (!selectedService || !selectedSlot) {
      return;
    }
    createBooking.mutate({
      providerSlug: provider.slug,
      serviceId: selectedService.id,
      startTime: selectedSlot.start,
    });
  }

  if (createBooking.isSuccess) {
    return (
      <BookingConfirmation
        booking={createBooking.data}
        timezone={provider.timezone}
        onBookAnother={() => {
          createBooking.reset();
          setSlotStart(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-2 text-lg font-semibold">1. Choose a service</h2>
        <ServicePicker
          services={services}
          selectedServiceId={serviceId}
          onSelect={handleServiceSelect}
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">2. Pick a date</h2>
        <input
          type="date"
          value={date}
          min={today}
          max={maxDate}
          onChange={(event) => handleDateChange(event.target.value)}
          className="rounded border border-gray-300 px-3 py-2"
        />
      </section>

      <section>
        <h2 className="mb-2 text-lg font-semibold">3. Pick a time</h2>
        {serviceId === null && (
          <p className="text-gray-600">
            Select a service to see available times.
          </p>
        )}
        {serviceId !== null && slots.isPending && (
          <p className="text-gray-600">Loading times…</p>
        )}
        {slots.isError && (
          <div className="text-red-600">
            <p>{getErrorMessage(slots.error)}</p>
            <button
              type="button"
              onClick={() => void slots.refetch()}
              className="mt-2 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}
        {slots.data && slots.data.slots.length === 0 && (
          <p className="text-gray-600">
            No times available on this date. Try another day.
          </p>
        )}
        {slots.data && slots.data.slots.length > 0 && (
          <SlotGrid
            slots={slots.data.slots}
            timezone={provider.timezone}
            selectedStart={slotStart}
            onSelect={handleSlotSelect}
          />
        )}
      </section>

      {selectedService && selectedSlot && (
        <section className="space-y-3 rounded border border-blue-200 bg-blue-50 p-4">
          <div>
            <p className="font-medium">{selectedService.name}</p>
            <p className="text-gray-700">
              {formatSlotDateTime(selectedSlot.start, provider.timezone)}
            </p>
          </div>
          {user === null ? (
            <p className="text-sm">
              <Link
                to="/login"
                state={returnState}
                className="font-medium underline"
              >
                Log in
              </Link>{" "}
              or{" "}
              <Link
                to="/signup"
                state={returnState}
                className="font-medium underline"
              >
                sign up
              </Link>{" "}
              to book this time.
            </p>
          ) : user.role === "CUSTOMER" ? (
            <button
              type="button"
              disabled={createBooking.isPending}
              onClick={handleConfirm}
              className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
            >
              {createBooking.isPending ? "Booking…" : "Confirm booking"}
            </button>
          ) : (
            <p className="text-sm text-gray-700">
              You're logged in as a provider. Log in with a customer account to
              book.
            </p>
          )}
        </section>
      )}

      {/* Outside the summary box: after a conflict the slot list refreshes and the box disappears */}
      {createBooking.isError && (
        <p role="alert" className="text-sm text-red-600">
          {getErrorMessage(createBooking.error)}
        </p>
      )}
    </div>
  );
}
