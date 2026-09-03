import type {
  DutySegmentDto,
  DutyStatus,
} from "@/api/EldPlanner/modules/trips/dutySegment.types";
import { formatSegmentTitle } from "@/lib/dutySegmentDisplay";

export const MINUTES_PER_DAY = 24 * 60;

export const ELD_HOUR_LABELS = [
  "Midnight",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "Noon",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
] as const;

export const ELD_DUTY_ROWS: { status: DutyStatus; label: string }[] = [
  { status: "off_duty", label: "OFF DUTY" },
  { status: "sleeper", label: "SLEEPER BERTH" },
  { status: "driving", label: "DRIVING" },
  { status: "on_duty", label: "ON DUTY (NOT DRIVING)" },
];

export type EldLogBlock = {
  id: string;
  dutyStatus: DutyStatus;
  startMinute: number;
  endMinute: number;
};

export type EldLogRemark = {
  id: string;
  minute: number;
  label: string;
};

export type EldLogDay = {
  dateKey: string;
  dateLabel: string;
  blocks: EldLogBlock[];
  remarks: EldLogRemark[];
};

export type EldStepPoint = {
  minute: number;
  status: DutyStatus;
};

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
}

function remarkLabel(segment: DutySegmentDto): string | null {
  if (segment.stop_type) {
    return formatSegmentTitle(segment);
  }

  return null;
}

export function formatLogDayLabel(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatLogDayShortLabel(dateKeyValue: string): string {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatLogDateRangeLabel(startKey: string, endKey: string): string {
  const start = new Date(parseDateKey(startKey));
  const end = new Date(parseDateKey(endKey));

  if (startKey === endKey) {
    return end.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  const startLabel = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endLabel = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startLabel} – ${endLabel}`;
}

function parseDateKey(dateKeyValue: string): number {
  const [year, month, day] = dateKeyValue.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function formatLogMinuteLabel(minute: number): string {
  const normalized = ((minute % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hour24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 || 12;
  return minutes === 0
    ? `${hour12} ${period}`
    : `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

export function buildEldStepPoints(blocks: EldLogBlock[]): EldStepPoint[] {
  const sorted = [...blocks].sort((a, b) => a.startMinute - b.startMinute);
  if (!sorted.length) {
    return [];
  }

  const points: EldStepPoint[] = [
    { minute: sorted[0].startMinute, status: sorted[0].dutyStatus },
  ];

  for (let index = 0; index < sorted.length; index += 1) {
    const block = sorted[index];
    points.push({ minute: block.endMinute, status: block.dutyStatus });

    const next = sorted[index + 1];
    if (next && next.dutyStatus !== block.dutyStatus) {
      points.push({ minute: block.endMinute, status: next.dutyStatus });
    }
  }

  return points;
}

export function buildEldLogDays(segments: DutySegmentDto[]): EldLogDay[] {
  if (!segments.length) {
    return [];
  }

  const blocksByDay = new Map<string, EldLogBlock[]>();
  const remarksByDay = new Map<string, EldLogRemark[]>();

  const ordered = [...segments].sort((a, b) => a.sequence - b.sequence);

  for (const segment of ordered) {
    let cursor = new Date(segment.started_at);
    const end = new Date(segment.ended_at);

    if (
      Number.isNaN(cursor.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= cursor
    ) {
      continue;
    }

    while (cursor < end) {
      const dayStart = startOfDay(cursor);
      const dayEnd = addDays(dayStart, 1);
      const clipEnd = end < dayEnd ? end : dayEnd;
      const key = dateKey(cursor);

      const startMinute = (cursor.getTime() - dayStart.getTime()) / 60_000;
      const endMinute = (clipEnd.getTime() - dayStart.getTime()) / 60_000;

      const dayBlocks = blocksByDay.get(key) ?? [];
      dayBlocks.push({
        id: `${segment.id}-${key}-${startMinute}`,
        dutyStatus: segment.duty_status,
        startMinute,
        endMinute,
      });
      blocksByDay.set(key, dayBlocks);

      cursor = clipEnd;
    }
  }

  for (const segment of ordered) {
    const label = remarkLabel(segment);
    if (!label) {
      continue;
    }

    const segmentStart = new Date(segment.started_at);
    if (Number.isNaN(segmentStart.getTime())) continue;

    const key = dateKey(segmentStart);
    const dayStart = startOfDay(segmentStart);
    const remarkMinute = (segmentStart.getTime() - dayStart.getTime()) / 60_000;

    const dayRemarks = remarksByDay.get(key) ?? [];
    if (!dayRemarks.some((remark) => remark.id === `${segment.id}-remark`)) {
      dayRemarks.push({
        id: `${segment.id}-remark`,
        minute: remarkMinute,
        label,
      });
      remarksByDay.set(key, dayRemarks);
    }
  }

  return [...blocksByDay.keys()].sort().map((key) => ({
    dateKey: key,
    dateLabel: formatLogDayLabel(key),
    blocks: blocksByDay.get(key) ?? [],
    remarks: (remarksByDay.get(key) ?? []).sort((a, b) => a.minute - b.minute),
  }));
}

export function statusTotalsForDay(blocks: EldLogBlock[]): Record<DutyStatus, number> {
  const totals: Record<DutyStatus, number> = {
    off_duty: 0,
    sleeper: 0,
    driving: 0,
    on_duty: 0,
  };

  for (const block of blocks) {
    totals[block.dutyStatus] += block.endMinute - block.startMinute;
  }

  return totals;
}

export function formatHoursFromMinutes(minutes: number): string {
  const hours = minutes / 60;
  return hours.toFixed(2);
}

/** FMCSA logs round minutes to 00, 15, 30, or 45. */
export function roundMinutesToQuarter(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

export function formatCompactHoursMinutes(minutes: number): string {
  const rounded = roundMinutesToQuarter(Math.max(0, minutes));
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m`;
}

export type EldStatusTotal = {
  status: DutyStatus;
  label: string;
  hours: string;
  minutes: string;
};

export function buildStatusTotalsDisplay(blocks: EldLogBlock[]): EldStatusTotal[] {
  const totals = statusTotalsForDay(blocks);

  return ELD_DUTY_ROWS.map((row) => {
    const rounded = roundMinutesToQuarter(totals[row.status]);
    return {
      status: row.status,
      label: row.label,
      hours: String(Math.floor(rounded / 60)).padStart(2, "0"),
      minutes: String(rounded % 60).padStart(2, "0"),
    };
  });
}

export function buildGrandTotalDisplay(blocks: EldLogBlock[]): {
  hours: string;
  minutes: string;
} {
  const totals = statusTotalsForDay(blocks);
  const sumMinutes = Object.values(totals).reduce((sum, value) => sum + value, 0);
  const rounded = roundMinutesToQuarter(sumMinutes);

  return {
    hours: String(Math.floor(rounded / 60)).padStart(2, "0"),
    minutes: String(rounded % 60).padStart(2, "0"),
  };
}
