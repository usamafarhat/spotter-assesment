import type { DutySegmentDto } from "@/api/EldPlanner/modules/trips/dutySegment.types";
import {
  formatSegmentDuration,
  formatSegmentTimeRange,
  formatSegmentTitle,
  segmentAccentClass,
} from "@/lib/dutySegmentDisplay";

type TripScheduleProps = {
  segments: DutySegmentDto[];
};

export function TripSchedule({ segments }: TripScheduleProps) {
  if (!segments.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No HOS schedule was generated for this trip.
      </p>
    );
  }

  const ordered = [...segments].sort((a, b) => a.sequence - b.sequence);

  return (
    <ol className="space-y-2">
      {ordered.map((segment) => (
        <li key={segment.id} className="rounded-2xl border border-border bg-card p-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${segmentAccentClass(segment)}`}
              >
                {formatSegmentTitle(segment)}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatSegmentTimeRange(segment)}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-foreground">
              {formatSegmentDuration(segment)}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
