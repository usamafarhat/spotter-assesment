import { ChevronRight, History, Truck } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import type { TripListItem } from "@/lib/tripDisplay";
import { TripStatusBadge } from "../trip/TripStatusBadge";

type RecentTripCardProps = {
  trip: TripListItem;
};

export function RecentTripCard({ trip }: RecentTripCardProps) {
  const { openTripDetail } = useNavigation();
  const Icon = trip.status === "completed" ? History : Truck;

  return (
    <button
      type="button"
      onClick={() => openTripDetail(trip.id)}
      className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
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

      <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    </button>
  );
}
