import type { TripStatus } from "../../types/trip";
import { cn } from "../../lib/cn";

const statusConfig: Record<
  TripStatus,
  { label: string; className: string; dotClassName: string }
> = {
  in_progress: {
    label: "In Progress",
    className: "bg-success-subtle text-success",
    dotClassName: "bg-success",
  },
  planned: {
    label: "Planned",
    className: "bg-info-subtle text-info",
    dotClassName: "bg-info",
  },
  completed: {
    label: "Completed",
    className: "bg-secondary text-muted-foreground",
    dotClassName: "bg-muted-foreground",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-error-subtle text-error",
    dotClassName: "bg-error",
  },
};

type TripStatusBadgeProps = {
  status: TripStatus;
  showDot?: boolean;
  className?: string;
};

export function TripStatusBadge({
  status,
  showDot = true,
  className,
}: TripStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold",
        config.className,
        className,
      )}
    >
      {showDot && (
        <span
          className={cn("size-1.5 rounded-full", config.dotClassName)}
          aria-hidden
        />
      )}
      {config.label}
    </span>
  );
}
