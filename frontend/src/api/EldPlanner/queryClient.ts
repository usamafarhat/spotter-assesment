import { QueryClient } from "@tanstack/react-query";

/**
 * Default query client configuration for ELD Planner API hooks.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: false,
    },
  },
});
