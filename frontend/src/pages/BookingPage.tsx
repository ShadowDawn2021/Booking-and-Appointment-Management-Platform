import { useParams } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { useProvider, useServices } from "../api/providers";

export default function BookingPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const provider = useProvider(slug);
  const services = useServices(slug);

  if (provider.isPending) {
    return <p className="p-6 text-gray-600">Loading…</p>;
  }
  if (provider.isError) {
    return (
      <p className="p-6 text-red-600">{getErrorMessage(provider.error)}</p>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">{provider.data.businessName}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Times shown in {provider.data.timezone}
      </p>

      <h2 className="mb-2 text-lg font-semibold">Choose a service</h2>
      {services.isPending && <p className="text-gray-600">Loading services…</p>}
      {services.isError && (
        <p className="text-red-600">{getErrorMessage(services.error)}</p>
      )}
      {services.data?.length === 0 && (
        <p className="text-gray-600">No services available yet.</p>
      )}
      <ul className="space-y-2">
        {services.data?.map((service) => (
          <li
            key={service.id}
            className="flex justify-between rounded border border-gray-200 p-3"
          >
            <span>{service.name}</span>
            <span className="text-gray-600">
              {service.durationMinutes} min · {Number(service.price).toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
