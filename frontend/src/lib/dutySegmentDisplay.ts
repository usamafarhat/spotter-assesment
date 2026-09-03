import type {
  DutySegmentDto,
  DutyStatus,
  StopType,
} from "@/api/EldPlanner/modules/trips/dutySegment.types";

const DUTY_STATUS_LABELS: Record<DutyStatus, string> = {
  off_duty: "Off duty",
  sleeper: "Sleeper berth",
  driving: "Driving",
  on_duty: "On duty",
};

const STOP_TYPE_LABELS: Record<Exclude<StopType, "">, string> = {
  pickup: "Pickup (load)",
  delivery: "Delivery (unload)",
  fuel: "Fuel stop",
  rest: "Rest break",
};

const LONG_REST_HOURS = 8;

function segmentHours(segment: DutySegmentDto): number {
  const start = new Date(segment.started_at).getTime();
  const end = new Date(segment.ended_at).getTime();
  return (end - start) / (1000 * 60 * 60);
}

/** 10 hr sleeper / cycle reset vs 30 min off-duty break. */
export function isLongRest(segment: DutySegmentDto): boolean {
  if (segment.stop_type !== "rest") {
    return false;
  }
  if (segment.duty_status === "sleeper") {
    return true;
  }
  return segmentHours(segment) >= LONG_REST_HOURS;
}

export function formatDutyStatus(status: DutyStatus): string {
  return DUTY_STATUS_LABELS[status];
}

export function formatSegmentTitle(segment: DutySegmentDto): string {
  if (segment.stop_type === "rest") {
    return isLongRest(segment) ? "10 hr rest" : "30 min break";
  }
  if (segment.stop_type && segment.stop_type in STOP_TYPE_LABELS) {
    return STOP_TYPE_LABELS[segment.stop_type as Exclude<StopType, "">];
  }
  return formatDutyStatus(segment.duty_status);
}

export function formatSegmentDuration(segment: DutySegmentDto): string {
  const start = new Date(segment.started_at);
  const end = new Date(segment.ended_at);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

  if (hours < 1) {
    return `${Math.round(hours * 60)} min`;
  }

  const rounded = Math.round(hours * 10) / 10;
  return `${rounded} hr${rounded === 1 ? "" : "s"}`;
}

export function formatSegmentTimeRange(segment: DutySegmentDto): string {
  const formatter = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  const start = formatter.format(new Date(segment.started_at));
  const end = formatter.format(new Date(segment.ended_at));
  return `${start} → ${end}`;
}

export function segmentAccentClass(segment: DutySegmentDto): string {
  if (segment.stop_type === "fuel") {
    return "bg-warning-subtle text-warning";
  }
  if (segment.stop_type === "pickup") {
    return "border border-info/20 bg-info-subtle text-info";
  }
  if (segment.stop_type === "delivery") {
    return "border border-border bg-secondary text-muted-foreground";
  }
  if (segment.stop_type === "rest") {
    if (isLongRest(segment)) {
      return "border border-violet-600/20 bg-violet-50 text-violet-700";
    }
    return "border border-cyan-600/20 bg-cyan-50 text-cyan-700";
  }
  if (segment.duty_status === "sleeper") {
    return "border border-violet-600/20 bg-violet-50 text-violet-700";
  }
  if (segment.duty_status === "driving") {
    return "border border-success/20 bg-success-subtle text-success";
  }
  return "border border-border bg-secondary text-foreground";
}
