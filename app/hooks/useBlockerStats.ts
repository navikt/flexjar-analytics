import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchBlockerServerFn } from "~/server/actions/fetchBlocker";

// Re-export BlockerResponse type for components that need it
export type { BlockerResponse } from "~/types/api";

/**
 * Hook to fetch Blocker pattern statistics for Top Tasks.
 * Returns word frequency, themes (patterns), and recent blocker text.
 */
export function useBlockerStats() {
  const { params } = useSearchParams();

  return useQuery({
    queryKey: [
      "blockerStats",
      params.app,
      params.from,
      params.to,
      params.surveyId,
      params.deviceType,
    ],
    queryFn: () =>
      fetchBlockerServerFn({
        data: {
          app: params.app,
          surveyId: params.surveyId,
          from: params.from,
          to: params.to,
          deviceType: params.deviceType,
        },
      }),
    staleTime: 60000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
