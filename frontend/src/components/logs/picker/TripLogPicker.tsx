import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { Label } from "@/components/ui/Label";
import { formatRecentTripDateLabel } from "@/lib/tripDisplay";

type TripLogPickerProps = {
  trips: TripResponseDto[];
  selectedTripId: number | null;
  onSelectTrip: (tripId: number) => void;
};

export function TripLogPicker({
  trips,
  selectedTripId,
  onSelectTrip,
}: TripLogPickerProps) {
  if (!trips.length) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label
        htmlFor="logs-trip-select"
        className="text-sm font-semibold text-foreground"
      >
        Trip
      </Label>
      <select
        id="logs-trip-select"
        value={selectedTripId ?? ""}
        onChange={(event) => {
          const value = Number(event.target.value);
          if (!Number.isNaN(value)) {
            onSelectTrip(value);
          }
        }}
        className="flex h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {trips.map((trip) => {
          const hasLogs = (trip.duty_segments?.length ?? 0) > 0;
          const routeLabel = `${trip.pickup_location.address} → ${trip.delivery_location.address}`;

          return (
            <option key={trip.id} value={trip.id}>
              {routeLabel}
              {hasLogs ? "" : " (no logs)"} ·{" "}
              {formatRecentTripDateLabel(trip.created_at)}
            </option>
          );
        })}
      </select>
    </div>
  );
}
