// src/components/BookingFlow.tsx
import { useState } from "react";
import { getErrorMessage } from "../api/errors";
import { useSlots } from "../api/slots";
import type { PublicProvider, Service } from "../api/types";
import { MAX_ADVANCE_DAYS } from "../lib/constants";
import {
  addDaysToDateString,
  formatSlotDateTime,
  todayInTimezone,
} from "../lib/dateTime";
import { ServicePicker } from "./ServicePicker";
import { SlotGrid } from "./SlotGrid";

interface BookingFlowProps {
  provider: PublicProvider;
  services: Service[];
}

export function BookingFlow({ provider, services }: BookingFlowProps) {
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

  function handleServiceSelect(id: string): void {
    setServiceId(id);
    setSlotStart(null);
  }

  function handleDateChange(value: string): void {
    if (!value) {
      return; // the date input emits "" when cleared
    }
    setDateOverride(value);
    setSlotStart(null);
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
            onSelect={setSlotStart}
          />
        )}
      </section>

      {selectedService && selectedSlot && (
        <section className="rounded border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium">{selectedService.name}</p>
          <p className="text-gray-700">
            {formatSlotDateTime(selectedSlot.start, provider.timezone)}
          </p>
        </section>
      )}
    </div>
  );
}
