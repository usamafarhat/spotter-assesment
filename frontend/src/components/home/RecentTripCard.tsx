import { ChevronRight, Truck } from "lucide-react";
import { useNavigation } from "@/context/NavigationContext";
import type { TripListItem } from "@/lib/tripDisplay";
import { TripStatusBadge } from "../trip/TripStatusBadge";

type RecentTripCardProps = {
  trip: TripListItem;
};

export function RecentTripCard({ trip }: RecentTripCardProps) {
  const { openTripDetail } = useNavigation();

  return (
    <button
      type="button"
      onClick={() => openTripDetail(trip.id)}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Truck className="size-5" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight text-foreground">
            {trip.origin} → {trip.destination}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-xs font-normal text-muted-foreground">
              {trip.dateLabel}
            </span>
            <TripStatusBadge status={trip.status} showDot={false} />
          </div>
        </div>
      </div>

      <ChevronRight
        className="size-5 shrink-0 text-[#94a3b8]"
        aria-hidden
      />
    </button>
  );
}
