import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "~/hooks/useSearchParams";
import { fetchStatsServerFn } from "~/server/actions";

// Re-export the FeedbackStats type from schemas for components that need it
export type { FeedbackStats } from "~/types/api";

/**
 * Hook to fetch aggregated feedback statistics.
 *
 * Automatically reacts to URL search params for filtering by:
 * - app: Filter by application name
 * - from/to: Date range filter
 * - feedbackId: Filter by specific survey ID
 * - deviceType: Filter by device type (mobile/tablet/desktop)
 *
 * @returns React Query result with FeedbackStats data
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data: stats, isLoading } = useStats();
 *   if (isLoading) return <Spinner />;
 *   return <div>Total: {stats.totalCount}</div>;
 * }
 * ```
 */
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
      params.segment,
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
          segment: params.segment,
        },
      }),
    staleTime: 30000, // 30 seconds
    placeholderData: keepPreviousData, // Prevent skeleton flash on param changes
  });
}
