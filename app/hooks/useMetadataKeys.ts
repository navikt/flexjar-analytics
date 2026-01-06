import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchMetadataKeysServerFn } from "~/server/actions";

/**
 * Hook to fetch metadata keys with cardinality filtering for auto-segmentation.
 *
 * Returns low-cardinality tags that can be used to generate dashboard graphs.
 *
 * @param surveyId - The survey/feedbackId to fetch metadata keys for
 * @param maxCardinality - Maximum unique values per key (default 10). Keys with more values are filtered out.
 * @returns React Query result with metadata keys and their unique values
 *
 * @example
 * ```tsx
 * function SegmentationGraphs() {
 *   const { data } = useMetadataKeys("survey-vurdering");
 *   // data.metadataKeys = { harDialogmote: ["ja", "nei"], behandlingsstatus: ["ny", "pågående"] }
 *   return (
 *     <>
 *       {Object.entries(data?.metadataKeys ?? {}).map(([key, values]) => (
 *         <BarChart key={key} title={key} data={values} />
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function useMetadataKeys(surveyId: string, maxCardinality = 10) {
  return useQuery({
    queryKey: ["metadata-keys", surveyId, maxCardinality],
    queryFn: () =>
      fetchMetadataKeysServerFn({ data: { surveyId, maxCardinality } }),
    enabled: !!surveyId,
    staleTime: 60000, // 1 minute
    placeholderData: keepPreviousData,
  });
}
