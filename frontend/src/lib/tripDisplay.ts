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

export function toTripListItem(trip: TripResponseDto): TripListItem {
  return {
    id: trip.id,
    origin: trip.pickup_location.address,
    destination: trip.delivery_location.address,
    dateLabel: formatRecentTripDateLabel(trip.created_at),
    status: trip.status,
  };
}

export function getRecentTrips(trips: TripResponseDto[], limit = 3): TripListItem[] {
  return trips.slice(0, limit).map((trip) => toTripListItem(trip));
}

export function formatDistanceMiles(value: string | null): string {
  if (value == null || value === "") {
    return "—";
  }

  const miles = Number(value);
  if (Number.isNaN(miles)) {
    return "—";
  }

  return `${miles.toLocaleString("en-US", { maximumFractionDigits: 1 })} mi`;
}

export function formatDurationHours(value: string | null): string {
  if (value == null || value === "") {
    return "—";
  }

  const hours = Number(value);
  if (Number.isNaN(hours)) {
    return "—";
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (wholeHours === 0) {
    return `${minutes} min`;
  }
  if (minutes === 0) {
    return `${wholeHours} hr`;
  }
  return `${wholeHours}h ${minutes}m`;
}

export function formatCycleHours(value: string, maxHours = 70): string {
  const hours = Number(value);
  if (Number.isNaN(hours)) {
    return "—";
  }

  return `${hours.toLocaleString("en-US", { maximumFractionDigits: 1 })} / ${maxHours} hr`;
}

export function shortPlaceName(address: string): string {
  const parts = address
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    return parts[1];
  }

  return parts[0] ?? address;
}

export function tripFilterLabel(trip: TripResponseDto): string {
  return `#${trip.id} • ${shortPlaceName(trip.pickup_location.address)}`;
}

export function tripRouteLabel(trip: TripResponseDto): string {
  return `${shortPlaceName(trip.pickup_location.address)} → ${shortPlaceName(trip.delivery_location.address)}`;
}
