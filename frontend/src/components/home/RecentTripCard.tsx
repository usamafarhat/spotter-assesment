import { History, MoreVertical, Truck } from "lucide-react";
import { TripStatusBadge } from "../trip/TripStatusBadge";
import type { DashboardTrip } from "../../data/mockDashboardTrips";

type RecentTripCardProps = {
  trip: DashboardTrip;
};

export function RecentTripCard({ trip }: RecentTripCardProps) {
  const Icon = trip.status === "completed" ? History : Truck;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
        <Icon className="size-5 text-muted-foreground" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {trip.origin} → {trip.destination}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{trip.dateLabel}</span>
          <TripStatusBadge status={trip.status} showDot={false} />
        </div>
      </div>

      <button
        type="button"
        className="shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
        aria-label="Trip options"
      >
        <MoreVertical className="size-4" aria-hidden />
      </button>
    </div>
  );
}
