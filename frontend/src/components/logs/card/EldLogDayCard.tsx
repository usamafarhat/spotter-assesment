import { ChevronDown, ChevronUp } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/cn";
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

export function EldLogDayCard({ entry, defaultExpanded = false }: EldLogDayCardProps) {
  const gridId = useId();
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);
  const expanded = expandedOverride ?? defaultExpanded;
  const { day, dayIndex, totalDays } = entry;
  const totals = statusTotalsForDay(day.blocks);
  const driveMinutes = totals.driving;
  const onDutyMinutes = totals.on_duty;
  const restMinutes = totals.off_duty + totals.sleeper;
  const barTotal = driveMinutes + onDutyMinutes + restMinutes;
  const remark = day.remarks[0];

  function toggleExpanded() {
    setExpandedOverride(!(expandedOverride ?? defaultExpanded));
  }

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_8px_rgba(0,0,0,0.03)]",
        expanded && "shadow-[0_2px_10px_rgba(0,0,0,0.04)] lg:col-span-2",
      )}
    >
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
            onClick={toggleExpanded}
            className={cn(
              "inline-flex h-9 w-40 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold",
              expanded
                ? "border-blue-600 bg-blue-600 text-white hover:border-blue-700 hover:bg-blue-700"
                : "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100",
            )}
            aria-expanded={expanded}
            aria-controls={gridId}
          >
            <EldGridIcon className="size-3.5" />
            {expanded ? "Hide ELD grid" : "View ELD grid"}
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
        <div id={gridId} className="border-t border-slate-100 bg-slate-50/40 p-3">
          <EldLogSheet day={day} />
        </div>
      ) : null}
    </article>
  );
}

function EldGridIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden>
      <rect
        x="1.25"
        y="1.25"
        width="13.5"
        height="13.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <path
        d="M4 4.75h8M4 8h8M4 11.25h8"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.4"
      />
      <path
        d="M3.5 11.25h2.75V4.75h3v3.5H12.5"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinejoin="miter"
      />
    </svg>
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
    <div
      className={`h-full ${className}`}
      style={{ width: `${width}%` }}
      title={label}
    />
  );
}
