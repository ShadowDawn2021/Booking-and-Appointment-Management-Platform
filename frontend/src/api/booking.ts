import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { api } from "./client";
import type { BookingView } from "./types";

export type BookingScope = "upcoming" | "past" | "all";

export interface CreateBookingInput {
  providerSlug: string;
  serviceId: string;
  startTime: string; // UTC ISO from a slot
}

/** Any booking change alters both the bookings lists and slot availability. */
function invalidateBookingData(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["bookings"] }),
    queryClient.invalidateQueries({ queryKey: ["slots"] }),
  ]);
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) =>
      (await api.post<BookingView>("/bookings", input)).data,
    onSettled: () => invalidateBookingData(queryClient),
  });
}

export function useMyBookings(scope: BookingScope) {
  return useQuery({
    queryKey: ["bookings", scope],
    queryFn: async () =>
      (await api.get<BookingView[]>("/bookings/me", { params: { scope } }))
        .data,
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) =>
      (
        await api.patch<BookingView>(
          `/bookings/${encodeURIComponent(bookingId)}/cancel`,
        )
      ).data,
    onSettled: () => invalidateBookingData(queryClient),
  });
}
