export type TripStatus = "planned" | "in_progress" | "completed" | "cancelled";

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
  route_polyline: RoutePolyline | null;
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
  current_cycle_used_hrs: string | number;
  notes?: string;
}
