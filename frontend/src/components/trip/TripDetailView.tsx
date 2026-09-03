import {
  ArrowLeft,
  Clock,
  FileText,
  LocateFixed,
  MapPin,
  Package,
  Route,
} from "lucide-react";
import type {
  LocationDto,
  TripResponseDto,
} from "@/api/EldPlanner/modules/trips/trips.types";
import { TripRouteMap } from "@/components/map/TripRouteMap";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useNavigation } from "@/context/NavigationContext";
import {
  formatCycleHours,
  formatDistanceMiles,
  formatDurationHours,
  formatRecentTripDateLabel,
} from "@/lib/tripDisplay";
import { TripSchedule } from "./TripSchedule";
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
  const { openLogsForTrip } = useNavigation();
  const hasDutySegments = (trip.duty_segments?.length ?? 0) > 0;
  const hasRoute = Boolean(
    trip.route_to_pickup_polyline?.length || trip.route_to_delivery_polyline?.length,
  );
  const stops: StopRow[] = [
    {
      key: "current",
      label: "Current",
      location: trip.current_location,
      icon: LocateFixed,
      accentClassName:
        "border border-success/20 bg-success-subtle text-success",
    },
    {
      key: "pickup",
      label: "Pickup",
      location: trip.pickup_location,
      icon: Package,
      accentClassName: "border border-info/20 bg-info-subtle text-info",
    },
    {
      key: "delivery",
      label: "Destination",
      location: trip.delivery_location,
      icon: MapPin,
      accentClassName: "border border-border bg-secondary text-foreground",
    },
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-card/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-1 shrink-0 active:scale-95"
            aria-label="Back to trips"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Button>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="text-lg font-bold leading-none text-foreground">Trip</h1>
              <TripStatusBadge status={trip.status} showDot={false} />
            </div>
            {hasDutySegments ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-auto shrink-0 whitespace-nowrap rounded-full border-slate-200/80 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-slate-100 active:bg-slate-200"
                onClick={() => openLogsForTrip(trip.id)}
              >
                <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                View ELD logs
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden">
        {hasRoute ? (
          <TripRouteMap
            routeToPickupPolyline={trip.route_to_pickup_polyline}
            routeToDeliveryPolyline={trip.route_to_delivery_polyline}
            currentLocation={trip.current_location}
            pickupLocation={trip.pickup_location}
            deliveryLocation={trip.delivery_location}
            dutySegments={trip.duty_segments}
            className="aspect-auto h-72 shrink-0 rounded-none border-0 border-b border-slate-200"
          />
        ) : (
          <div className="flex h-72 w-full shrink-0 flex-col items-center justify-center gap-2 border-b border-slate-200 bg-secondary px-6 text-center">
            <Route className="size-6 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium text-foreground">No route to show</p>
            <p className="text-xs text-muted-foreground">
              This trip does not have a saved path yet.
            </p>
          </div>
        )}

        <div className="space-y-6 p-4 md:min-h-0 md:flex-1 md:overflow-y-auto">
          <section>
            <h2 className="text-base font-bold leading-snug text-foreground">
              {trip.pickup_location.address} → {trip.delivery_location.address}
            </h2>
            <p className="mt-1 text-xs font-medium text-muted-foreground">
              Planned {formatRecentTripDateLabel(trip.created_at)}
            </p>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <StatCard
              label="Distance"
              value={formatDistanceMiles(trip.total_distance_miles)}
            />
            <StatCard
              label="Drive time"
              value={formatDurationHours(trip.total_duration_hours)}
            />
            <StatCard
              label="Total trip"
              value={formatDurationHours(trip.total_trip_hours)}
            />
            <StatCard
              label="Cycle used before trip"
              value={formatCycleHours(trip.current_cycle_used_hrs)}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-foreground" aria-hidden />
              <h2 className="text-sm font-bold text-foreground">HOS schedule</h2>
            </div>
            <p className="text-xs font-normal text-muted-foreground">
              Driving, rests, fuel, and on-duty stops in order.
            </p>
            <TripSchedule segments={trip.duty_segments ?? []} />
            {hasDutySegments ? (
              <Button
                type="button"
                variant="outline"
                className="h-auto w-full rounded-full border-slate-200/80 bg-slate-50 py-2.5 text-xs font-semibold text-foreground hover:bg-slate-100 active:bg-slate-200"
                onClick={() => openLogsForTrip(trip.id)}
              >
                <FileText className="size-3.5 text-muted-foreground" aria-hidden />
                View ELD logs
              </Button>
            ) : null}
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4 text-foreground" aria-hidden />
              <h2 className="text-sm font-bold text-foreground">Locations</h2>
            </div>

            <ol className="relative space-y-6 pl-1">
              {stops.map((stop, index) => {
                const Icon = stop.icon;
                const isLast = index === stops.length - 1;

                return (
                  <li key={stop.key} className="flex items-start gap-3">
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${stop.accentClassName}`}
                      >
                        <Icon className="size-4" aria-hidden />
                      </span>
                      {!isLast && (
                        <span
                          className="absolute top-8 h-10 w-0.5 bg-slate-200"
                          aria-hidden
                        />
                      )}
                    </div>
                    <div className="pt-0.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {stop.label}
                      </p>
                      <p className="mt-0.5 text-xs font-semibold leading-snug text-foreground">
                        {stop.location.address}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>

          {trip.notes.trim() ? (
            <section className="rounded-xl border border-slate-100 bg-slate-50/80 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Notes
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-xs font-semibold leading-relaxed text-foreground">
                {trip.notes}
              </p>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

export function TripDetailSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card">
      <header className="sticky top-0 z-30 border-b border-slate-100 bg-card/95 px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="-ml-1 shrink-0"
            aria-label="Back to trips"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Button>
          <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>
      </header>

      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto md:overflow-hidden"
        aria-busy="true"
        aria-label="Loading trip"
      >
        <Skeleton className="h-72 w-full shrink-0 rounded-none" />
        <div className="space-y-6 p-4 md:min-h-0 md:flex-1 md:overflow-y-auto">
          <div className="space-y-2">
            <Skeleton className="h-5 w-full max-w-sm" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-[4.75rem] rounded-xl" />
            <Skeleton className="h-[4.75rem] rounded-xl" />
            <Skeleton className="h-[4.75rem] rounded-xl" />
            <Skeleton className="h-[4.75rem] rounded-xl" />
          </div>
          <div className="space-y-2.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-[4.5rem] rounded-xl" />
            <Skeleton className="h-[4.5rem] rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
