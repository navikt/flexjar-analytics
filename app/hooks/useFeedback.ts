import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchFeedbackServerFn } from "~/server/actions";

// Re-export the FeedbackPage type for components that need it
export type { FeedbackPage } from "~/types/api";

/**
 * Hook to fetch paginated feedback items.
 *
 * Automatically reacts to URL search params for filtering and pagination:
 * - app: Filter by application name
 * - feedbackId: Filter by specific survey ID
 * - page/size: Pagination controls (1-indexed)
 * - from/to: Date range filter
 * - medTekst: Filter to only items with text responses
 * - lavRating: Filter to only low ratings (1-2)
 * - tags: Filter by comma-separated tags
 * - deviceType: Filter by device type
 *
 * @returns React Query result with FeedbackPage (content, pagination info)
 *
 * @example
 * ```tsx
 * function FeedbackList() {
 *   const { data, isLoading } = useFeedback();
 *   if (isLoading) return <Spinner />;
 *   return data.content.map(item => <FeedbackCard key={item.id} {...item} />);
 * }
 * ```
 */
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
    placeholderData: keepPreviousData, // Prevent skeleton flash on param changes
  });
}
