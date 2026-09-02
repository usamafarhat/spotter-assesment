import { eldPlannerApiClient } from "@/api/EldPlanner/client";

import type { HealthResponseDto } from "./health.types";

/**
 * Health check endpoints.
 */
export const healthApi = {
  /**
   * GET /api/health/
   */
  get: (): Promise<HealthResponseDto> =>
    eldPlannerApiClient.get<HealthResponseDto>("/health/"),
};
