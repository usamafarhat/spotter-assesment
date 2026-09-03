import { CalendarDays, ChevronDown, Map } from "lucide-react";
import { cn } from "@/lib/cn";

type LogsFilterBarProps = {
  tripLabel: string;
  dateLabel: string;
  dateSelected: boolean;
  onOpenTripPicker: () => void;
  onOpenDatePicker: () => void;
};

export function LogsFilterBar({
  tripLabel,
  dateLabel,
  dateSelected,
  onOpenTripPicker,
  onOpenDatePicker,
}: LogsFilterBarProps) {
  return (
    <section
      className="grid grid-cols-12 gap-2 rounded-xl border border-slate-200/80 bg-white p-2 shadow-[0_1px_8px_rgba(0,0,0,0.03)]"
      aria-label="Log filters"
    >
      <FilterTrigger
        className="col-span-7"
        label="Active trip"
        value={tripLabel}
        icon={Map}
        onClick={onOpenTripPicker}
      />
      <FilterTrigger
        className="col-span-5"
        label="Log date"
        value={dateLabel}
        icon={CalendarDays}
        active={dateSelected}
        onClick={onOpenDatePicker}
      />
    </section>
  );
}

function FilterTrigger({
  className,
  label,
  value,
  icon: Icon,
  active = false,
  onClick,
}: {
  className?: string;
  label: string;
  value: string;
  icon: typeof Map;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between gap-1 rounded-lg px-2.5 py-2 text-left transition",
        active
          ? "bg-blue-50 hover:bg-blue-100/70"
          : "bg-slate-50 hover:bg-slate-100",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={cn(
            "shrink-0 rounded-md p-1.5",
            active ? "bg-blue-600 text-white" : "bg-white text-blue-600",
          )}
        >
          <Icon className="size-4" aria-hidden />
        </span>
        <span className="min-w-0 truncate">
          <span
            className={cn(
              "block text-[10px] font-bold uppercase tracking-wider",
              active ? "text-blue-600" : "text-slate-400",
            )}
          >
            {label}
          </span>
          <span className="block truncate text-xs font-bold text-foreground">
            {value}
          </span>
        </span>
      </div>
      <ChevronDown
        className={cn(
          "ml-1 size-4 shrink-0",
          active ? "text-blue-600" : "text-slate-400",
        )}
        aria-hidden
      />
    </button>
  );
}
