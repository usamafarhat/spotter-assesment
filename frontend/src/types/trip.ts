import type { SelectedLocation } from "./location";

export type TripStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type LocationFieldKey = "currentLocation" | "pickupLocation" | "dropoffLocation";

export const locationFieldLabels: Record<LocationFieldKey, string> = {
  currentLocation: "Current Location",
  pickupLocation: "Pickup Location",
  dropoffLocation: "Dropoff Location",
};

export type TripFormValues = {
  currentLocation: SelectedLocation | null;
  pickupLocation: SelectedLocation | null;
  dropoffLocation: SelectedLocation | null;
  currentCycleUsedHrs: string;
};

export const emptyTripFormValues: TripFormValues = {
  currentLocation: null,
  pickupLocation: null,
  dropoffLocation: null,
  currentCycleUsedHrs: "",
};
