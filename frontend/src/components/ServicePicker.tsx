import type { Service } from "../api/types";

interface ServicePickerProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export function ServicePicker({
  services,
  selectedServiceId,
  onSelect,
}: ServicePickerProps) {
  if (services.length === 0) {
    return <p className="text-gray-600">No services available yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;
        return (
          <li key={service.id}>
            <button
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(service.id)}
              className={`flex w-full justify-between rounded border p-3 text-left transition ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-400"
              }`}
            >
              <span>{service.name}</span>
              <span className="text-gray-600">
                {service.durationMinutes} min ·{" "}
                {Number(service.price).toFixed(2)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
