import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addTagServerFn,
  fetchTagsServerFn,
  removeTagServerFn,
} from "./serverFunctions";

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: () => fetchTagsServerFn(),
    staleTime: 60000, // 1 minute
  });
}

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
