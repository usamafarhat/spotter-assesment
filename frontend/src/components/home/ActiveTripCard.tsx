import { ChevronRight, Route } from "lucide-react";
import { TripRouteTimeline } from "./TripRouteTimeline";
import { TripStatusBadge } from "../trip/TripStatusBadge";
import type { DashboardTrip } from "../../data/mockDashboardTrips";

type ActiveTripCardProps = {
  trip: DashboardTrip;
};

export function ActiveTripCard({ trip }: ActiveTripCardProps) {
  return (
    <button
      type="button"
      className="w-full rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
            <Route className="size-5 text-muted-foreground" aria-hidden />
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {trip.dateLabel}
            </p>
            <div className="mt-1">
              <TripStatusBadge status={trip.status} />
            </div>
          </div>
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      </div>

      <TripRouteTimeline origin={trip.origin} destination={trip.destination} />
    </button>
  );
}
