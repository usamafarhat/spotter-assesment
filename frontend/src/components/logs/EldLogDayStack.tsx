import { useMemo } from "react";
import type { DutySegmentDto } from "@/api/EldPlanner/modules/trips/dutySegment.types";
import { buildEldLogDays } from "./lib/eldLogUtils";
import { EldLogGrid } from "./EldLogGrid";

type EldLogDayStackProps = {
  segments: DutySegmentDto[];
};

export function EldLogDayStack({ segments }: EldLogDayStackProps) {
  const days = useMemo(() => buildEldLogDays(segments), [segments]);

  if (!days.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center text-sm text-muted-foreground">
        No ELD log data for this trip. Plan a new trip to generate duty segments.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {days.map((day) => (
        <EldLogGrid key={day.dateKey} day={day} />
      ))}
    </div>
  );
}
