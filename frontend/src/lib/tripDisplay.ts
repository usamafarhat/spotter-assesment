import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import type { TripStatus } from "@/types/trip";

export type TripListItem = {
  id: number;
  origin: string;
  destination: string;
  dateLabel: string;
  status: TripStatus;
};

export function formatRecentTripDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatActiveTripDateLabel(iso: string): string {
  return new Date(iso)
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();
}

export function toTripListItem(
  trip: TripResponseDto,
  dateStyle: "short" | "long" = "short",
): TripListItem {
  return {
    id: trip.id,
    origin: trip.pickup_location.address,
    destination: trip.delivery_location.address,
    dateLabel:
      dateStyle === "long"
        ? formatActiveTripDateLabel(trip.created_at)
        : formatRecentTripDateLabel(trip.created_at),
    status: trip.status,
  };
}

export function getActiveTrip(trips: TripResponseDto[]): TripListItem | null {
  const active = trips.find((trip) => trip.status === "in_progress");
  return active ? toTripListItem(active, "long") : null;
}

export function getRecentTrips(
  trips: TripResponseDto[],
  options: { limit?: number; excludeId?: number } = {},
): TripListItem[] {
  const { limit = 5, excludeId } = options;

  return trips
    .filter((trip) => trip.status !== "in_progress" && trip.id !== excludeId)
    .slice(0, limit)
    .map((trip) => toTripListItem(trip));
}
