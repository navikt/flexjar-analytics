import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addTag, removeTag } from "./api";

export function useTags() {
  return useQuery<string[]>({
    queryKey: ["tags"],
    queryFn: async () => {
      const response = await fetch("/api/backend/api/v1/intern/feedback/tags");
      if (!response.ok) {
        throw new Error("Failed to fetch tags");
      }
      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
}

export function useAddTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, tag }: { feedbackId: string; tag: string }) =>
      addTag(feedbackId, tag),
    onSuccess: () => {
      // Invalidate both feedback and tags queries
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}

export function useRemoveTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ feedbackId, tag }: { feedbackId: string; tag: string }) =>
      removeTag(feedbackId, tag),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feedback"] });
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
}
