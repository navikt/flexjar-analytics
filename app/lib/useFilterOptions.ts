import { useQuery } from "@tanstack/react-query";
import type { FeedbackStats } from "./api";

/**
 * Hook to fetch all available filter options (apps, surveys)
 * without being affected by current filter selections.
 * This ensures dropdowns always show all available options.
 */
export function useFilterOptions() {
  return useQuery<FeedbackStats>({
    queryKey: ["filterOptions"],
    queryFn: async () => {
      // Fetch stats without any filters to get all available options
      const response = await fetch("/api/backend/api/v1/intern/stats");
      if (!response.ok) {
        throw new Error("Failed to fetch filter options");
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute - these don't change often
  });
}
