import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "./client";
import type { BookingView } from "./types";

export interface CreateBookingInput {
  providerSlug: string;
  serviceId: string;
  startTime: string; // UTC ISO from a slot
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateBookingInput) =>
      (await api.post<BookingView>("/bookings", input)).data,
    // Success or failure, availability has changed: refresh every slot list
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["slots"] }),
  });
}
