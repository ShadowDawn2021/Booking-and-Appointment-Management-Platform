// src/pages/BookingPage.tsx
import { useParams } from "react-router-dom";
import { getErrorMessage } from "../api/errors";
import { useProvider, useServices } from "../api/providers";
import { BookingFlow } from "../components/BookingFlow";

export default function BookingPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const provider = useProvider(slug);
  const services = useServices(slug);

  if (provider.isPending || services.isPending) {
    return <p className="p-6 text-gray-600">Loading…</p>;
  }
  if (provider.isError) {
    return (
      <p className="p-6 text-red-600">{getErrorMessage(provider.error)}</p>
    );
  }
  if (services.isError) {
    return (
      <p className="p-6 text-red-600">{getErrorMessage(services.error)}</p>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-2xl font-bold">{provider.data.businessName}</h1>
      <p className="mb-6 text-sm text-gray-500">
        Times shown in {provider.data.timezone}
      </p>
      <BookingFlow provider={provider.data} services={services.data} />
    </main>
  );
}
