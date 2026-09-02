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
      void queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
