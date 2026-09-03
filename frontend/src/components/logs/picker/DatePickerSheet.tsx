import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { cn } from "@/lib/cn";
import {
  buildCalendarCells,
  monthTitle,
  parseDateKeyParts,
  toDateKey,
} from "../lib/calendar";
import { formatLogDayShortLabel } from "../lib";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type DatePickerSheetProps = {
  open: boolean;
  selectedDateKey: string | null;
  availableDateKeys: Set<string>;
  subtitle: string;
  onClose: () => void;
  onSelectDate: (dateKey: string | null) => void;
};

export function DatePickerSheet({
  open,
  selectedDateKey,
  availableDateKeys,
  subtitle,
  onClose,
  onSelectDate,
}: DatePickerSheetProps) {
  const todayKey = toDateKey(new Date());
  const [draftDateKey, setDraftDateKey] = useState<string | null>(selectedDateKey);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    initialMonth(selectedDateKey, availableDateKeys),
  );

  const cells = useMemo(
    () => buildCalendarCells(visibleMonth.year, visibleMonth.month),
    [visibleMonth],
  );

  const confirmLabel = draftDateKey
    ? `View ${formatLogDayShortLabel(draftDateKey)}`
    : "Show all days";

  return (
    <BottomSheet open={open} onClose={onClose}>
      <div className="space-y-4 px-5 pb-6">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground">Select daily log</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
            aria-label="Close date picker"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between px-1">
          <button
            type="button"
            onClick={() =>
              setVisibleMonth((current) => shiftMonth(current.year, current.month, -1))
            }
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <p className="text-sm font-bold tracking-tight text-foreground">
            {monthTitle(visibleMonth.year, visibleMonth.month)}
          </p>
          <button
            type="button"
            onClick={() =>
              setVisibleMonth((current) => shiftMonth(current.year, current.month, 1))
            }
            className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>

        <div className="space-y-1">
          <div className="grid grid-cols-7 py-1 text-center text-[11px] font-bold text-slate-400">
            {WEEKDAYS.map((weekday) => (
              <span key={weekday}>{weekday}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
            {cells.map((cell) => {
              const hasLog = availableDateKeys.has(cell.dateKey);
              const isSelected = draftDateKey === cell.dateKey;

              return (
                <button
                  key={cell.dateKey}
                  type="button"
                  disabled={!hasLog}
                  onClick={() => setDraftDateKey(cell.dateKey)}
                  className={cn(
                    "relative rounded-xl p-2 transition",
                    !cell.inCurrentMonth && "text-slate-300",
                    cell.inCurrentMonth && !hasLog && "text-slate-400",
                    cell.inCurrentMonth && hasLog && !isSelected && "text-slate-800 hover:bg-blue-50 hover:text-blue-600",
                    isSelected && "bg-blue-600 font-bold text-white shadow-sm",
                  )}
                >
                  {cell.day}
                  {hasLog ? (
                    <span
                      className={cn(
                        "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full",
                        isSelected ? "bg-white" : "bg-emerald-500",
                      )}
                      aria-hidden
                    />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between px-1 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            Has logs
          </span>
          <div className="flex items-center gap-3">
            {draftDateKey ? (
              <button
                type="button"
                className="text-xs font-bold text-slate-600 hover:text-slate-800"
                onClick={() => setDraftDateKey(null)}
              >
                Clear date
              </button>
            ) : null}
            <button
              type="button"
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
              onClick={() => {
                setVisibleMonth({
                  year: new Date().getFullYear(),
                  month: new Date().getMonth(),
                });
                if (availableDateKeys.has(todayKey)) {
                  setDraftDateKey(todayKey);
                }
              }}
            >
              Jump to today
            </button>
          </div>
        </div>

        <Button
          type="button"
          className="h-12 w-full rounded-xl text-xs font-bold"
          onClick={() => onSelectDate(draftDateKey)}
        >
          {confirmLabel}
        </Button>
      </div>
    </BottomSheet>
  );
}

function shiftMonth(year: number, month: number, delta: number) {
  const next = new Date(year, month + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

function initialMonth(selectedDateKey: string | null, availableDateKeys: Set<string>) {
  if (selectedDateKey) {
    const parts = parseDateKeyParts(selectedDateKey);
    return { year: parts.year, month: parts.month };
  }

  const latest = [...availableDateKeys].sort().at(-1);
  if (latest) {
    const parts = parseDateKeyParts(latest);
    return { year: parts.year, month: parts.month };
  }

  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() };
}
