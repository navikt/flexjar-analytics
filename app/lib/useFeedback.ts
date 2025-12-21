import { useQuery } from "@tanstack/react-query";
import { fetchFeedbackServerFn } from "./serverFunctions";
import { useSearchParams } from "./useSearchParams";

// Re-export the FeedbackPage type for components that need it
export type { FeedbackPage } from "./api";

export function useFeedback() {
  const { params } = useSearchParams();

  return useQuery({
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
    queryFn: () =>
      fetchFeedbackServerFn({
        data: {
          app: params.app,
          feedbackId: params.feedbackId,
          page: params.page,
          size: params.size || "20",
          from: params.from,
          to: params.to,
          medTekst: params.medTekst,
          stjerne: params.stjerne,
          fritekst: params.fritekst,
          tags: params.tags,
          lavRating: params.lavRating,
          pathname: params.pathname,
          deviceType: params.deviceType,
        },
      }),
    staleTime: 10000, // 10 seconds
  });
}
