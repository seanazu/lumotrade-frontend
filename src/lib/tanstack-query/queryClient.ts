import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 2,
      staleTime: 30000, // 30 seconds - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - keep data in cache longer
      refetchOnMount: false, // Don't refetch if data is fresh
      refetchOnReconnect: true, // Refetch when network reconnects
    },
  },
});

