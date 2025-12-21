import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTagServerFn,
  fetchTagsServerFn,
  removeTagServerFn,
} from "~/server/actions";

/**
 * Hook to fetch all available tags.
 *
 * @returns React Query result with array of tag strings
 *
 * @example
 * ```tsx
 * function TagFilter() {
 *   const { data: tags } = useTags();
 *   return <Select options={tags?.map(t => ({ label: t, value: t }))} />;
 * }
 * ```
 */
export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => fetchTagsServerFn(),
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to add a tag to a feedback item.
 * Automatically invalidates feedback and tags queries on success.
 *
 * @returns Mutation function that takes { feedbackId, tag }
 *
 * @example
 * ```tsx
 * function TagButton({ feedbackId }) {
 *   const addTag = useAddTag();
 *   return <Button onClick={() => addTag.mutate({ feedbackId, tag: "important" })}>Add</Button>;
 * }
 * ```
 */
export function useAddTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, tag }: { feedbackId: string; tag: string }) =>
      addTagServerFn({ data: { feedbackId, tag } }),
    onSuccess: () => {
      // Invalidate both feedback and tags queries
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

/**
 * Hook to remove a tag from a feedback item.
 * Automatically invalidates feedback and tags queries on success.
 *
 * @returns Mutation function that takes { feedbackId, tag }
 */
export function useRemoveTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, tag }: { feedbackId: string; tag: string }) =>
      removeTagServerFn({ data: { feedbackId, tag } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
