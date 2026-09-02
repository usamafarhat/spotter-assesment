import { useQuery } from "@tanstack/react-query";

import { healthApi } from "./health";

/**
 * Hook for fetching backend health status.
 */
export function useHealth(enabled = true) {
  return useQuery({
    queryKey: ["health"],
    queryFn: () => healthApi.get(),
    enabled,
    staleTime: 60 * 1000,
  });
}
