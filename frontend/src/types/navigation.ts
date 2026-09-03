export type AppTab = "home" | "trips" | "logs";

export const TAB_PATHS: Record<AppTab, string> = {
  home: "/",
  trips: "/trips",
  logs: "/logs",
};

export const PLAN_TRIP_PATH = "/trips/plan-trip";

export function tripDetailPath(tripId: number): string {
  return `/trips/${tripId}`;
}

export function logsPath(options?: {
  tripId?: number | "all";
  day?: string | null;
}): string {
  const params = new URLSearchParams();

  if (options?.tripId === "all") {
    params.set("trip", "all");
  } else if (typeof options?.tripId === "number") {
    params.set("trip", String(options.tripId));
  }

  if (options?.day) {
    params.set("day", options.day);
  }

  const query = params.toString();
  return query ? `${TAB_PATHS.logs}?${query}` : TAB_PATHS.logs;
}
