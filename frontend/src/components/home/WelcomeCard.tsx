import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { DRIVER_NAME, ProfileAvatar } from "@/components/layout/ProfileAvatar";
import { formatDistanceMiles, tripRouteLabel } from "@/lib/tripDisplay";

type WelcomeCardProps = {
  trips: TripResponseDto[];
  isLoading?: boolean;
};

export function WelcomeCard({ trips, isLoading = false }: WelcomeCardProps) {
  const totalMiles = trips.reduce((sum, trip) => {
    const miles = Number(trip.total_distance_miles);
    return Number.isFinite(miles) ? sum + miles : sum;
  }, 0);
  const latest = trips[0];

  return (
    <section className="flex h-full flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start gap-3.5">
        <ProfileAvatar size="lg" />
        <div className="min-w-0 pt-0.5">
          <h1 className="text-[17px] font-bold leading-tight tracking-tight text-foreground">
            Welcome back, {DRIVER_NAME}
          </h1>
          <p className="mt-1 text-[13px] font-normal leading-relaxed text-muted-foreground">
            Plan a route when you are ready for the next run.
          </p>
        </div>
      </div>

      <div
        className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-4"
        aria-label="Trip overview"
      >
        <MiniStat
          label="Trips"
          value={isLoading ? "—" : String(trips.length)}
        />
        <MiniStat
          label="Miles"
          value={
            isLoading || totalMiles <= 0
              ? "—"
              : formatDistanceMiles(String(totalMiles))
          }
        />
        <MiniStat
          label="Latest"
          value={isLoading || !latest ? "—" : tripRouteLabel(latest)}
        />
      </div>
    </section>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 truncate text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}
