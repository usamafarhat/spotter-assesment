import { eldPlannerApiClient } from "@/api/EldPlanner/client";

import type { CreateTripDto, TripResponseDto } from "./trips.types";

/**
 * Trips API endpoints.
 */
export const tripsApi = {
  /**
   * GET /api/trips/
   */
  getAll: (): Promise<TripResponseDto[]> =>
    eldPlannerApiClient.get<TripResponseDto[]>("/trips/"),

  /**
   * POST /api/trips/
   */
  create: (data: CreateTripDto): Promise<TripResponseDto> =>
    eldPlannerApiClient.post<TripResponseDto>("/trips/", data),
};
