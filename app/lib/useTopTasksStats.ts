import { useQuery } from "@tanstack/react-query";
import { type TopTasksResponse, fetchTopTasksStats } from "./api";
import { useSearchParams } from "./useSearchParams";

export function useTopTasksStats() {
  const { params } = useSearchParams();

  return useQuery<TopTasksResponse>({
    queryKey: [
      "topTasksStats",
      params.team,
      params.app,
      params.from,
      params.to,
      params.feedbackId,
      params.deviceType,
    ],
    queryFn: async () => {
      // Build params object
      const apiParams: Record<string, string> = {};
      if (params.team) apiParams.team = params.team;
      if (params.app) apiParams.app = params.app;
      if (params.from) apiParams.from = params.from;
      if (params.to) apiParams.to = params.to;
      if (params.feedbackId) apiParams.feedbackId = params.feedbackId;
      if (params.deviceType) apiParams.deviceType = params.deviceType;

      return fetchTopTasksStats(apiParams);
    },
    staleTime: 60000,
  });
}
