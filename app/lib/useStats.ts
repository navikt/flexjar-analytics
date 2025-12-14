import { useQuery } from "@tanstack/react-query";
import type { FeedbackStats } from "./api";
import { useSearchParams } from "./useSearchParams";

export function useStats() {
  const { params } = useSearchParams();

  return useQuery<FeedbackStats>({
    queryKey: [
      "stats",
      params.app,
      params.from,
      params.to,
      params.feedbackId,
      params.deviceType,
      params.ubehandlet,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      // Note: team filtering is done server-side based on user's Azure AD groups
      if (params.app) queryParams.set("app", params.app);
      if (params.from) queryParams.set("from", params.from);
      if (params.to) queryParams.set("to", params.to);
      if (params.feedbackId) queryParams.set("feedbackId", params.feedbackId);
      if (params.deviceType) queryParams.set("deviceType", params.deviceType);
      if (params.ubehandlet) queryParams.set("ubehandlet", params.ubehandlet);

      const response = await fetch(
        `/api/backend/api/v1/intern/stats?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }
      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
}
