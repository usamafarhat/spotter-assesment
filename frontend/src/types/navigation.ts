export type AppTab = "home" | "trips" | "logs";

export const TAB_PATHS: Record<AppTab, string> = {
  home: "/",
  trips: "/trips",
  logs: "/logs",
};

export const PLAN_TRIP_PATH = "/trips/plan-trip";
