import type { TripResponseDto } from "@/api/EldPlanner/modules/trips/trips.types";
import { buildEldLogDays, formatLogDateRangeLabel, type EldLogDay } from "./eldLogUtils";

export type TripLogEntry = {
  trip: TripResponseDto;
  day: EldLogDay;
  dayIndex: number;
  totalDays: number;
};

export type TripLogGroup = {
  trip: TripResponseDto;
  entries: TripLogEntry[];
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseLogDateKey(value: string | null): string | null {
  if (!value || !DATE_KEY_PATTERN.test(value)) {
    return null;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return value;
}

export function buildTripLogEntries(trips: TripResponseDto[]): TripLogEntry[] {
  return trips.flatMap((trip) => {
    const days = buildEldLogDays(trip.duty_segments ?? []);
    return days.map((day, index) => ({
      trip,
      day,
      dayIndex: index + 1,
      totalDays: days.length,
    }));
  });
}

export function filterTripLogEntries(
  entries: TripLogEntry[],
  tripId: number | null,
  dateKey: string | null,
): TripLogEntry[] {
  return entries.filter((entry) => {
    if (tripId != null && entry.trip.id !== tripId) {
      return false;
    }

    if (dateKey != null && entry.day.dateKey !== dateKey) {
      return false;
    }

    return true;
  });
}

export function groupTripLogEntries(
  entries: TripLogEntry[],
  trips: TripResponseDto[],
): TripLogGroup[] {
  const byTrip = new Map<number, TripLogEntry[]>();

  for (const entry of entries) {
    const current = byTrip.get(entry.trip.id) ?? [];
    current.push(entry);
    byTrip.set(entry.trip.id, current);
  }

  return trips
    .filter((trip) => byTrip.has(trip.id))
    .map((trip) => ({
      trip,
      entries: (byTrip.get(trip.id) ?? []).sort((left, right) =>
        right.day.dateKey.localeCompare(left.day.dateKey),
      ),
    }));
}

export function collectLogDateKeys(
  entries: TripLogEntry[],
  tripId: number | null,
): Set<string> {
  const keys = new Set<string>();

  for (const entry of entries) {
    if (tripId != null && entry.trip.id !== tripId) {
      continue;
    }

    keys.add(entry.day.dateKey);
  }

  return keys;
}

export function latestTripId(trips: TripResponseDto[]): number | null {
  return trips[0]?.id ?? null;
}

export function dateSheetSubtitle(
  tripLabel: string | null,
  dateKeys: string[],
): string {
  if (!dateKeys.length) {
    return tripLabel ?? "No log days yet";
  }

  const sorted = [...dateKeys].sort();
  const range = formatLogDateRangeLabel(sorted[0], sorted[sorted.length - 1]);
  return tripLabel ? `${tripLabel} (${range})` : `All trips (${range})`;
}

export function parseTripFilterParam(
  rawTripId: string | null,
  trips: TripResponseDto[],
): number | "all" | null {
  if (rawTripId === "all") {
    return "all";
  }

  if (!rawTripId) {
    return null;
  }

  const tripId = Number(rawTripId);
  if (!Number.isInteger(tripId) || !trips.some((trip) => trip.id === tripId)) {
    return null;
  }

  return tripId;
}
