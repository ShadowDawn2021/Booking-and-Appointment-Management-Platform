import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { api } from "./client";
import type { ProviderProfile, PublicProvider, Service } from "./types";

export interface CreateProviderInput {
  businessName: string;
  slug: string;
  timezone: string;
}

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

/** Resolves to null (not an error) when the logged-in provider hasn't created a profile yet. */
export function useMyProvider() {
  return useQuery({
    queryKey: ["my-provider"],
    queryFn: async (): Promise<ProviderProfile | null> => {
      try {
        return (await api.get<ProviderProfile>("/providers/me")).data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
  });
}

export function useCreateProvider() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateProviderInput) =>
      (await api.post<ProviderProfile>("/providers", input)).data,
    onSuccess: (provider) => {
      queryClient.setQueryData(["my-provider"], provider);
    },
  });
}
