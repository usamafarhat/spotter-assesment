import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { tripsApi } from "./trips";
import type { CreateTripDto } from "./trips.types";

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}
