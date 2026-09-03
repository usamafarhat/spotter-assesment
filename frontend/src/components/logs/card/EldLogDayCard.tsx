import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { EldLogSheet } from "../EldLogGrid";
import {
  formatCompactHoursMinutes,
  formatLogMinuteLabel,
  statusTotalsForDay,
} from "../lib";
import type { TripLogEntry } from "../lib/logsFilter";

type EldLogDayCardProps = {
  entry: TripLogEntry;
  defaultExpanded?: boolean;
};

export function EldLogDayCard({
  entry,
  defaultExpanded = false,
}: EldLogDayCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { day, dayIndex, totalDays } = entry;
  const totals = statusTotalsForDay(day.blocks);
  const driveMinutes = totals.driving;
  const onDutyMinutes = totals.on_duty;
  const restMinutes = totals.off_duty + totals.sleeper;
  const barTotal = driveMinutes + onDutyMinutes + restMinutes;
  const remark = day.remarks[0];
  const dayNumber = String(dayIndex).padStart(2, "0");

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition hover:border-slate-300">
      <div className="space-y-2.5 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700">
              {dayNumber}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-foreground">{day.dateLabel}</h3>
              <p className="text-[11px] text-muted-foreground">
                Day {dayIndex} of {totalDays}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-xl border border-slate-100 bg-slate-50/80 p-2 text-center">
          <Metric label="Drive" value={formatCompactHoursMinutes(driveMinutes)} />
          <Metric label="On-Duty" value={formatCompactHoursMinutes(onDutyMinutes)} />
          <Metric label="Rest / Off" value={formatCompactHoursMinutes(restMinutes)} />
        </div>

        <div
          className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
          title="Duty distribution"
        >
          {barTotal > 0 ? (
            <>
              <BarSegment
                width={(driveMinutes / barTotal) * 100}
                className="bg-blue-600"
                label={`Driving ${formatCompactHoursMinutes(driveMinutes)}`}
              />
              <BarSegment
                width={(onDutyMinutes / barTotal) * 100}
                className="bg-amber-400"
                label={`On duty ${formatCompactHoursMinutes(onDutyMinutes)}`}
              />
              <BarSegment
                width={(restMinutes / barTotal) * 100}
                className="bg-slate-300"
                label={`Rest ${formatCompactHoursMinutes(restMinutes)}`}
              />
            </>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <p className="min-w-0 truncate text-[11px] font-medium text-muted-foreground">
            {remark
              ? `${formatLogMinuteLabel(remark.minute)} • ${remark.label}`
              : "No remarks"}
          </p>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            aria-expanded={expanded}
          >
            {expanded ? "Hide grid" : "View grid"}
            {expanded ? (
              <ChevronUp className="size-3.5" aria-hidden />
            ) : (
              <ChevronDown className="size-3.5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-slate-100 p-3">
          <EldLogSheet day={day} />
        </div>
      ) : null}
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="block text-[9px] font-bold uppercase text-slate-600">
        {label}
      </span>
      <span className="font-mono text-xs font-extrabold text-foreground">
        {value}
      </span>
    </div>
  );
}

function BarSegment({
  width,
  className,
  label,
}: {
  width: number;
  className: string;
  label: string;
}) {
  if (width <= 0) {
    return null;
  }

  return (
    <div className={`h-full ${className}`} style={{ width: `${width}%` }} title={label} />
  );
}
