import type { CreateTripDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { formatCoordinateForApi } from "@/lib/coordinates";
import type { TripFormValues } from "@/types/trip";

function toLocationDto(location: NonNullable<TripFormValues["currentLocation"]>) {
  return {
    address: location.address,
    latitude: formatCoordinateForApi(location.latitude),
    longitude: formatCoordinateForApi(location.longitude),
  };
}

export function toCreateTripDto(values: TripFormValues): CreateTripDto {
  const { currentLocation, pickupLocation, dropoffLocation, currentCycleUsedHrs } =
    values;

  if (!currentLocation || !pickupLocation || !dropoffLocation) {
    throw new Error("Missing required route locations");
  }

  return {
    current_location: toLocationDto(currentLocation),
    pickup_location: toLocationDto(pickupLocation),
    delivery_location: toLocationDto(dropoffLocation),
    current_cycle_used_hrs: currentCycleUsedHrs,
    notes: "",
  };
}
