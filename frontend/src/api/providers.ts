import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { PublicProvider, Service } from "./types";

export function useProvider(slug: string) {
  return useQuery({
    queryKey: ["provider", slug],
    queryFn: async () =>
      (await api.get<PublicProvider>(`/providers/${encodeURIComponent(slug)}`))
        .data,
  });
}

export function useServices(slug: string) {
  return useQuery({
    queryKey: ["services", slug],
    queryFn: async () =>
      (
        await api.get<Service[]>(
          `/providers/${encodeURIComponent(slug)}/services`,
        )
      ).data,
  });
}
