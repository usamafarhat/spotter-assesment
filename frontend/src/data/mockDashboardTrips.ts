import type { TripStatus } from "../types/trip";

export type DashboardTrip = {
  id: string;
  origin: string;
  destination: string;
  dateLabel: string;
  status: TripStatus;
};

export const mockActiveTrip: DashboardTrip = {
  id: "active-1",
  origin: "Chicago, IL",
  destination: "Dallas, TX",
  dateLabel: "OCT 25, 2023",
  status: "in_progress",
};

export const mockRecentTrips: DashboardTrip[] = [
  {
    id: "recent-1",
    origin: "Dallas, TX",
    destination: "Houston, TX",
    dateLabel: "Oct 27",
    status: "planned",
  },
  {
    id: "recent-2",
    origin: "Chicago, IL",
    destination: "Indianapolis, IN",
    dateLabel: "Oct 24",
    status: "completed",
  },
];
