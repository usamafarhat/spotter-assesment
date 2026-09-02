import type { DutySegmentDto } from "./dutySegment.types";

export type TripStatus = "planned" | "in_progress" | "completed" | "cancelled";

export type { DutySegmentDto, DutyStatus, StopType } from "./dutySegment.types";

export interface LocationDto {
  address: string;
  latitude: string;
  longitude: string;
}

export type RoutePolyline = [number, number][];

export interface TripResponseDto {
  id: number;
  current_location: LocationDto;
  pickup_location: LocationDto;
  delivery_location: LocationDto;
  current_cycle_used_hrs: string;
  total_distance_miles: string | null;
  total_duration_hours: string | null;
  total_trip_hours: string | null;
  route_to_pickup_polyline: RoutePolyline | null;
  route_to_delivery_polyline: RoutePolyline | null;
  duty_segments: DutySegmentDto[];
  status: TripStatus;
  started_at: string | null;
  completed_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTripDto {
  current_location: LocationDto;
  pickup_location: LocationDto;
  delivery_location: LocationDto;
  pickup_same_as_current?: boolean;
  current_cycle_used_hrs: string | number;
  notes?: string;
}
