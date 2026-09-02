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

export function formatDutyStatus(status: DutyStatus): string {
  return DUTY_STATUS_LABELS[status];
}

export function formatSegmentTitle(segment: DutySegmentDto): string {
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
    return "bg-info-subtle text-info";
  }
  if (segment.stop_type === "delivery") {
    return "bg-secondary text-foreground";
  }
  if (segment.stop_type === "rest" || segment.duty_status === "sleeper") {
    return "bg-muted text-muted-foreground";
  }
  if (segment.duty_status === "driving") {
    return "bg-success-subtle text-success";
  }
  return "bg-secondary text-foreground";
}
