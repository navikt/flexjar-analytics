import { useQuery } from "@tanstack/react-query";
import { fetchTopTasksServerFn } from "./serverFunctions";
import { useSearchParams } from "./useSearchParams";

// Re-export TopTasksResponse type for components that need it
export type { TopTasksResponse } from "./api";

export function useTopTasksStats() {
  const { params } = useSearchParams();

  return useQuery({
    queryKey: [
      "topTasksStats",
      params.team,
      params.app,
      params.from,
      params.to,
      params.feedbackId,
      params.deviceType,
    ],
    queryFn: () =>
      fetchTopTasksServerFn({
        data: {
          surveyId: params.feedbackId,
          from: params.from,
          to: params.to,
        },
      }),
    staleTime: 60000, // 1 minute
  });
}
