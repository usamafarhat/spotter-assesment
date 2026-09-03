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

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-wider text-blue-600 uppercase">
              Day {dayIndex} of {totalDays} • Driver&apos;s daily log
            </p>
            <h3 className="mt-0.5 text-base font-extrabold tracking-tight text-foreground">
              {day.dateLabel}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setExpanded((current) => !current)}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-3 text-xs font-semibold text-foreground hover:bg-slate-200"
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

        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-slate-500">
          <span>
            Drive:{" "}
            <strong className="font-semibold text-foreground">
              {formatCompactHoursMinutes(driveMinutes)}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            On-duty:{" "}
            <strong className="font-semibold text-foreground">
              {formatCompactHoursMinutes(onDutyMinutes)}
            </strong>
          </span>
          <span className="text-slate-300">•</span>
          <span>
            Rest / off:{" "}
            <strong className="font-semibold text-foreground">
              {formatCompactHoursMinutes(restMinutes)}
            </strong>
          </span>
        </p>

        <div
          className="flex h-2 w-full overflow-hidden rounded-full bg-slate-100"
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
                className="bg-sky-400"
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

        <p className="truncate text-[11px] font-medium text-slate-500">
          {remark
            ? `Remarks: ${formatLogMinuteLabel(remark.minute)} • ${remark.label}`
            : "No remarks"}
        </p>
      </div>

      {expanded ? (
        <div className="border-t border-slate-100 bg-slate-50/40 p-3">
          <EldLogSheet day={day} />
        </div>
      ) : null}
    </article>
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
