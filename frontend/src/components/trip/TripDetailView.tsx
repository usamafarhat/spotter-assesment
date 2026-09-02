import { ArrowLeft, Clock, LocateFixed, MapPin, Package, Route } from "lucide-react";
import type { LocationDto, TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { TripRouteMap } from "@/components/map/TripRouteMap";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import {
  formatCycleHours,
  formatDistanceMiles,
  formatDurationHours,
  formatRecentTripDateLabel,
} from "@/lib/tripDisplay";
import { TripStatusBadge } from "./TripStatusBadge";

type TripDetailViewProps = {
  trip: TripResponseDto;
  onBack: () => void;
};

type StopRow = {
  key: string;
  label: string;
  location: LocationDto;
  icon: typeof LocateFixed;
  accentClassName: string;
};

export function TripDetailView({ trip, onBack }: TripDetailViewProps) {
  const hasRoute = Boolean(trip.route_polyline?.length);
  const stops: StopRow[] = [
    {
      key: "current",
      label: "Current",
      location: trip.current_location,
      icon: LocateFixed,
      accentClassName: "bg-success-subtle text-success",
    },
    {
      key: "pickup",
      label: "Pickup",
      location: trip.pickup_location,
      icon: Package,
      accentClassName: "bg-info-subtle text-info",
    },
    {
      key: "delivery",
      label: "Destination",
      location: trip.delivery_location,
      icon: MapPin,
      accentClassName: "bg-secondary text-foreground",
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="size-9 p-0"
            aria-label="Back to trips"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Button>
          <p className="text-center text-base font-bold text-foreground">Trip</p>
          <TripStatusBadge status={trip.status} showDot={false} />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 pt-5 pb-6">
        {hasRoute ? (
          <TripRouteMap
            polyline={trip.route_polyline}
            currentLocation={trip.current_location}
            pickupLocation={trip.pickup_location}
            deliveryLocation={trip.delivery_location}
          />
        ) : (
          <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-secondary px-6 text-center">
            <Route className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No route to show</p>
            <p className="text-xs text-muted-foreground">
              This trip does not have a saved path yet.
            </p>
          </div>
        )}

        <section>
          <h1 className="text-lg font-bold leading-snug tracking-tight text-foreground">
            {trip.pickup_location.address} → {trip.delivery_location.address}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Planned {formatRecentTripDateLabel(trip.created_at)}
          </p>
        </section>

        <section className="grid grid-cols-3 gap-2">
          <StatCard label="Distance" value={formatDistanceMiles(trip.total_distance_miles)} />
          <StatCard label="Drive time" value={formatDurationHours(trip.total_duration_hours)} />
          <StatCard label="Cycle used" value={formatCycleHours(trip.current_cycle_used_hrs)} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted-foreground" aria-hidden />
            <h2 className="text-sm font-bold text-foreground">Stops</h2>
          </div>

          <ol className="space-y-0">
            {stops.map((stop, index) => {
              const Icon = stop.icon;
              const isLast = index === stops.length - 1;

              return (
                <li key={stop.key} className="flex gap-3">
                  <div className="flex w-8 shrink-0 flex-col items-center">
                    <span
                      className={`flex size-8 items-center justify-center rounded-full ${stop.accentClassName}`}
                    >
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    {!isLast && <span className="min-h-6 w-px flex-1 bg-border" aria-hidden />}
                  </div>
                  <div className={isLast ? "pb-0 pt-1" : "pb-4 pt-1"}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {stop.label}
                    </p>
                    <p className="mt-0.5 text-sm font-medium leading-snug text-foreground">
                      {stop.location.address}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {trip.notes.trim() ? (
          <section className="rounded-2xl border border-border bg-secondary/60 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {trip.notes}
            </p>
          </section>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/70 px-3 py-3">
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

export function TripDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-1 flex-col bg-card">
      <header className="sticky top-0 z-10 border-b border-border bg-card px-4 py-3">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="size-9 p-0"
            aria-label="Back to trips"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Button>
          <p className="text-center text-base font-bold text-foreground">Trip</p>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-5 px-5 pt-5" aria-busy="true" aria-label="Loading trip">
        <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
          <Skeleton className="h-16 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
