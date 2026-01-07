import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchContextTagsServerFn } from "~/server/actions";

/**
 * Hook to fetch context tags with cardinality filtering for auto-segmentation.
 *
 * @param surveyId - The survey/feedbackId to fetch tags for
 * @param maxCardinality - (Optional) Only return keys with <= this many unique values.
 *                         Useful for filtering out high-cardinality IDs.
 * @returns React Query result with context tags and their unique values
 *
 * @example
 * const { data, isLoading } = useContextTags("flexjar-soknad", 10);
 * if (data) {
 *   // data.contextTags = { harDialogmote: ["ja", "nei"], behandlingsstatus: ["ny", "pågående"] }
 *   return (
 *     <Filters>
 *       {Object.entries(data?.contextTags ?? {}).map(([key, values]) => (
 *         <Select label={key} options={values.map(v => v.value)} />
 *       ))}
 *     </Filters>
 *   );
 * }
 */
export function useContextTags(surveyId: string, maxCardinality?: number) {
  return useQuery({
    queryKey: ["context-tags", surveyId, maxCardinality],
    queryFn: () =>
      fetchContextTagsServerFn({
        data: {
          surveyId: surveyId,
          maxCardinality: maxCardinality,
        },
      }),
    enabled: !!surveyId,
    placeholderData: keepPreviousData,
  });
}
