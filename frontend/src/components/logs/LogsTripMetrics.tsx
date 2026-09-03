import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import {
  formatCycleHours,
  formatDistanceMiles,
  formatDurationHours,
} from "@/lib/tripDisplay";

type LogsTripMetricsProps = {
  trip: TripResponseDto;
};

export function LogsTripMetrics({ trip }: LogsTripMetricsProps) {
  return (
    <div className="flex items-stretch divide-x divide-slate-100 rounded-xl border border-slate-200/80 bg-white px-1 py-2.5 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <Metric label="Route" value={formatDistanceMiles(trip.total_distance_miles)} />
      <Metric label="Duration" value={formatDurationHours(trip.total_duration_hours)} />
      <Metric label="Cycle used" value={formatCycleHours(trip.current_cycle_used_hrs)} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col px-3">
      <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
        {label}
      </span>
      <span className="truncate font-mono text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}
