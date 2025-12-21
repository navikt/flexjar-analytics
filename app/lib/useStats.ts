import { useQuery } from "@tanstack/react-query";
import { fetchStatsServerFn } from "./serverFunctions";
import { useSearchParams } from "./useSearchParams";

// Re-export the FeedbackStats type from schemas for components that need it
export type { FeedbackStats } from "./api";

export function useStats() {
  const { params } = useSearchParams();

  return useQuery({
    queryKey: [
      "stats",
      params.app,
      params.from,
      params.to,
      params.feedbackId,
      params.deviceType,
      params.ubehandlet,
    ],
    queryFn: () =>
      fetchStatsServerFn({
        data: {
          app: params.app,
          from: params.from,
          to: params.to,
          feedbackId: params.feedbackId,
          deviceType: params.deviceType,
          ubehandlet: params.ubehandlet,
        },
      }),
    staleTime: 30000, // 30 seconds
  });
}
