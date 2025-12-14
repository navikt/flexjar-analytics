import { useQuery } from "@tanstack/react-query";
import type { FeedbackPage } from "./api";
import { useSearchParams } from "./useSearchParams";

export function useFeedback() {
  const { params } = useSearchParams();

  return useQuery<FeedbackPage>({
    queryKey: [
      "feedback",
      params.app,
      params.feedbackId,
      params.page,
      params.size,
      params.from,
      params.to,
      params.medTekst,
      params.stjerne,
      params.fritekst,
      params.tags,
      params.lavRating,
      params.pathname,
      params.deviceType,
    ],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      // Note: team filtering is done server-side based on user's Azure AD groups
      queryParams.set("size", params.size || "20");

      if (params.app) queryParams.set("app", params.app);
      if (params.feedbackId) queryParams.set("feedbackId", params.feedbackId);
      if (params.page)
        queryParams.set("page", String(Number.parseInt(params.page, 10) - 1)); // Convert to 0-indexed
      if (params.from) queryParams.set("from", params.from);
      if (params.to) queryParams.set("to", params.to);
      if (params.medTekst) queryParams.set("medTekst", params.medTekst);
      if (params.stjerne) queryParams.set("stjerne", params.stjerne);
      if (params.fritekst) queryParams.set("fritekst", params.fritekst);
      if (params.tags) queryParams.set("tags", params.tags);
      if (params.lavRating) queryParams.set("lavRating", params.lavRating);
      if (params.pathname) queryParams.set("pathname", params.pathname);
      if (params.deviceType) queryParams.set("deviceType", params.deviceType);

      const response = await fetch(
        `/api/backend/api/v1/intern/feedback?${queryParams.toString()}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch feedback");
      }
      return response.json();
    },
    staleTime: 10000, // 10 seconds
  });
}
