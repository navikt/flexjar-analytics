import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchTaskPriorityServerFn } from "~/server/actions";

// Re-export TaskPriorityResponse type for components that need it
export type { TaskPriorityResponse } from "~/types/api";

/**
 * Hook to fetch Task Priority survey statistics.
 * Returns the "Long Neck" distribution of task votes.
 */
export function useTaskPriorityStats() {
  const { params } = useSearchParams();

  return useQuery({
    queryKey: [
      "taskPriorityStats",
      params.app,
      params.from,
      params.to,
      params.surveyId,
      params.deviceType,
    ],
    queryFn: () =>
      fetchTaskPriorityServerFn({
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
