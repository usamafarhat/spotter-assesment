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
    <ol className="space-y-2.5">
      {ordered.map((segment) => (
        <li
          key={segment.id}
          className="rounded-xl border border-slate-100 bg-card p-3.5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${segmentAccentClass(segment)}`}
            >
              {formatSegmentTitle(segment)}
            </span>
            <span className="shrink-0 text-xs font-semibold text-foreground">
              {formatSegmentDuration(segment)}
            </span>
          </div>
          <p className="mt-2 text-xs font-medium text-muted-foreground">
            {formatSegmentTimeRange(segment)}
          </p>
        </li>
      ))}
    </ol>
  );
}
