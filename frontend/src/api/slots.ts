import { useQuery } from "@tanstack/react-query";
import { api } from "./client";
import type { SlotsResponse } from "./types";

export function useSlots(slug: string, serviceId: string | null, date: string) {
  return useQuery({
    queryKey: ["slots", slug, serviceId, date],
    queryFn: async () =>
      (
        await api.get<SlotsResponse>(
          `/providers/${encodeURIComponent(slug)}/slots`,
          {
            params: { date, serviceId },
          },
        )
      ).data,
    enabled: serviceId !== null && date !== "",
    staleTime: 0, // availability changes whenever anyone books
    refetchOnWindowFocus: true,
  });
}
