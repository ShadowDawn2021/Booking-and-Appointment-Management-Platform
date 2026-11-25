import type { Slot } from "../api/types";
import { formatSlotTime } from "../lib/dateTime";

interface SlotGridProps {
  slots: Slot[];
  timezone: string;
  selectedStart: string | null;
  onSelect: (start: string) => void;
}

export function SlotGrid({
  slots,
  timezone,
  selectedStart,
  onSelect,
}: SlotGridProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = slot.start === selectedStart;
        return (
          <li key={slot.start}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(slot.start)}
              className={`w-full rounded border px-2 py-2 text-sm transition ${
                isSelected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 hover:border-blue-600"
              }`}
            >
              {formatSlotTime(slot.start, timezone)}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
