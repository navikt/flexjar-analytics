import { QueryClient } from "@tanstack/react-query";

// Keep a single QueryClient instance for the whole app.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
    },
  },
});
