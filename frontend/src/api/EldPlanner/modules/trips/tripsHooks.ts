import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tripsApi } from "./trips";
import type { CreateTripDto, TripResponseDto } from "./trips.types";

/**
 * React Query hooks for trip operations.
 */

export function useTrips(enabled = true) {
  return useQuery({
    queryKey: ["trips"],
    queryFn: () => tripsApi.getAll(),
    enabled,
    staleTime: 2 * 60 * 1000,
  });
}

export function useTrip(tripId: number | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["trips", tripId],
    queryFn: () => tripsApi.getById(tripId!),
    enabled: tripId != null,
    initialData: () => {
      if (tripId == null) {
        return undefined;
      }

      const trips = queryClient.getQueryData<TripResponseDto[]>(["trips"]);
      return trips?.find((trip) => trip.id === tripId);
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTripDto) => tripsApi.create(data),
    onSuccess: (created) => {
      queryClient.setQueryData<TripResponseDto[]>(["trips"], (current) => {
        if (!current) {
          return [created];
        }
        return [created, ...current.filter((trip) => trip.id !== created.id)];
      });
      queryClient.setQueryData(["trips", created.id], created);
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
