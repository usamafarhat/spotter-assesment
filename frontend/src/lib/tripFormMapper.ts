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
  const {
    currentLocation,
    pickupLocation,
    dropoffLocation,
    pickupSameAsCurrent,
    currentCycleUsedHrs,
  } = values;

  const pickup = pickupSameAsCurrent ? currentLocation : pickupLocation;

  if (!currentLocation || !pickup || !dropoffLocation) {
    throw new Error("Missing required route locations");
  }

  const currentDto = toLocationDto(currentLocation);
  const pickupDto = pickupSameAsCurrent ? currentDto : toLocationDto(pickup);

  return {
    current_location: currentDto,
    pickup_location: pickupDto,
    delivery_location: toLocationDto(dropoffLocation),
    pickup_same_as_current: pickupSameAsCurrent,
    current_cycle_used_hrs: currentCycleUsedHrs,
    notes: "",
  };
}
