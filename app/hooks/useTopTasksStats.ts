import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchTopTasksServerFn } from "~/server/actions";

// Re-export TopTasksResponse type for components that need it
export type { TopTasksResponse } from "~/types/api";

export function useTopTasksStats() {
  const { params } = useSearchParams();

  return useQuery({
    queryKey: [
      "topTasksStats",
      params.team,
      params.app,
      params.fromDate,
      params.toDate,
      params.surveyId,
      params.deviceType,
    ],
    queryFn: () =>
      fetchTopTasksServerFn({
        data: {
          app: params.app,
          surveyId: params.surveyId,
          fromDate: params.fromDate,
          toDate: params.toDate,
          deviceType: params.deviceType,
        },
      }),
    staleTime: 60000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
